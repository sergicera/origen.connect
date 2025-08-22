import * as WEBIFC from "web-ifc";

export default class IFCAPI {
  constructor(app) {
    this.app = app;
    this.ifcApi = null;
    this.modelID = null;
  }

  async init() {
    this.ifcAPI = new WEBIFC.IfcAPI();
    this.ifcAPI.SetWasmPath("/");
    await this.ifcAPI.Init();
  }

  async loadIFC(path, token) {
    const file = await fetch(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    this.modelID = this.ifcAPI.OpenModel(buffer);
  }
}
