import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";

export default class IFCTree {
  constructor(app) {
    this.app = app;
    this.tree = null;
  }

  get inverseAttributes() {
    return ["IsDecomposedBy", "ContainsElements"];
  }

  async compute(expressID = null) {
    const rows = [];
    let modelData;

    if (expressID) {
      // If user calls with a specific expressID
      modelData = {
        data: {
          Entity:
            this.app.fragments.model.name !== ""
              ? this.app.fragments.model.name
              : this.app.fragments.model.uuid,
        },
        children: await this.getDecompositionTree(expressID),
      };
    } else {
      // If no expressID is given, default to project
      const modelRelations =
        this.app.indexer.indexer.relationMaps[this.app.fragments.model.uuid];
      const projectAttrs =
        await this.app.fragments.model.getAllPropertiesOfType(
          WEBIFC.IFCPROJECT
        );

      if (modelRelations && projectAttrs) {
        const { expressID } = Object.values(projectAttrs)[0];

        modelData = {
          data: {
            Entity:
              this.app.fragments.model.name !== ""
                ? this.app.fragments.model.name
                : this.app.fragments.model.uuid,
          },
          children: await this.getDecompositionTree(expressID),
        };
      }
    }

    rows.push(modelData);
    this.tree = rows;
    this.app.manager.emitter.emit("IFC_RELATION_TREE_CHANGED");
  }

  async getDecompositionTree(expressID) {
    const rows = [];
    const entityAttrs = await this.app.fragments.model.getProperties(expressID);
    if (!entityAttrs) return rows;

    const { type } = entityAttrs;

    const entityRow = {
      data: {
        Entity: OBC.IfcCategoryMap[type],
        Name: entityAttrs.Name?.value,
        modelID: this.app.fragments.model.uuid,
        expressID,
      },
    };

    for (const attrName of this.inverseAttributes) {
      const relations = this.app.indexer.indexer.getEntityRelations(
        this.app.fragments.model,
        expressID,
        attrName
      );

      if (!relations || relations.length === 0) continue;

      if (!entityRow.children) entityRow.children = [];
      entityRow.data.relations = JSON.stringify(relations);

      const entityGroups = {};

      for (const id of relations) {
        const decompositionRow = await this.getDecompositionTree(id);

        for (const row of decompositionRow) {
          if (row.data.relations) {
            // If the child has further relations, just push it
            entityRow.children.push(row);
          } else {
            // If not, group them by type => This is the "post-grouping" logic
            const data = this.app.fragments.model.data.get(id);
            if (!data) {
              entityRow.children.push(row);
              continue;
            }
            const type = data[1][1];
            const entity = OBC.IfcCategoryMap[type];
            if (!(entity in entityGroups)) entityGroups[entity] = [];
            // rename row.data.Entity => row.data.Name
            row.data.Entity = row.data.Name;
            delete row.data.Name;
            entityGroups[entity].push(row);
          }
        }
      }

      // Create group rows
      for (const entity in entityGroups) {
        const children = entityGroups[entity];
        const relations = children.map((child) => child.data.expressID);
        const row = {
          data: {
            Entity: entity,
            modelID: this.app.fragments.model.uuid,
            relations: JSON.stringify(relations),
          },
          children,
        };
        entityRow.children.push(row);
      }
    }

    rows.push(entityRow);

    return rows;
  }
}
