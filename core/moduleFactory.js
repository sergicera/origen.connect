
import { IfcModule } from "@/core/src/main/IndustryFoundationClasses";
import { SapModule } from "@/core/src/main/SwissApartmentsDataset";

export const moduleFactories = {
  ifc: () => new IfcModule(), // IFC - Industry Foundation Classes Model
  sap: () => new SapModule(), // SAP - Swiss Architecture Plans Model
};
