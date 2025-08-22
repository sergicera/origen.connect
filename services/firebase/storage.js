import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";

import { storage } from "@/firebaseConfig";

// Base operations handler
const baseOps = {
  uploadFileAndGetURL: async (filePath, file) => {
    try {
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Uploaded file and got URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading file to ${filePath}:`, error);
      throw error;
    }
  },

  getDownloadUrl: async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        console.log(`File not found at ${filePath}`);
        return null;
      }
      console.error(`Error getting download URL for ${filePath}:`, error);
      throw error;
    }
  },

  deleteFile: async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      console.log(`File deleted successfully from ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        console.warn(
          `File not found at ${filePath}, consider deletion successful.`
        );
        return true;
      }
      console.error(`Error deleting file from ${filePath}:`, error);
      throw error;
    }
  },

  listFolderItems: async (folderPath) => {
    try {
      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);
      const items = await Promise.all(
        listResult.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, path: itemRef.fullPath, url };
        })
      );
      return items;
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        return [];
      }
      console.error(`Error listing folder ${folderPath}:`, error);
      throw error;
    }
  },
};

export const Storage = {
  async getDownloadUrl(filePath) {
    return baseOps.getDownloadUrl(filePath);
  },

  async deleteFile(filePath) {
    return baseOps.deleteFile(filePath);
  },

  async uploadAvatar(tenantId, memberId, file) {
    if (!tenantId || !memberId || !file || !file.name) {
      const message = "[uploadAvatar]: Missing required parameters.";
      console.error(message);
      return Promise.reject(message);
    }
    const filePath = `tenants/${tenantId}/members/${memberId}/avatar/${file.name}`;
    return baseOps.uploadFileAndGetURL(filePath, file);
  },

  async deleteAvatar(tenantId, memberId, fileName) {
    if (!tenantId || !memberId || !fileName) {
      const message = "[deleteAvatar]: Missing required parameters.";
      console.error(message);
      return Promise.reject(message);
    }
    const filePath = `tenants/${tenantId}/members/${memberId}/avatar/${fileName}`;
    return baseOps.deleteFile(filePath);
  },

  async uploadGeneratedImage(tenantId, modelId, buildingId, file) {
    if (!tenantId || !modelId || !buildingId || !file || !file.name) {
      const message = "[uploadGeneratedImage]: Missing required parameters.";
      console.error(message);
      return Promise.reject(message);
    }
    const filePath = `${tenantId}/${modelId}/${buildingId}/images/${file.name}`;
    return baseOps.uploadFileAndGetURL(filePath, file);
  },

  async uploadGeneratedImageAsLatest(tenantId, modelId, buildingId, file) {
    if (!tenantId || !modelId || !buildingId || !file) {
      const message = "[uploadGeneratedImageAsLatest]: Missing required parameters.";
      console.error(message);
      return Promise.reject(message);
    }
    const filePath = `${tenantId}/${modelId}/${buildingId}/images/latest.png`;
    return baseOps.uploadFileAndGetURL(filePath, file);
  },

  async listGeneratedImages(tenantId, modelId, buildingId) {
    if (!tenantId || !modelId || !buildingId) {
      const message = "[listGeneratedImages]: Missing required parameters.";
      console.error(message);
      return Promise.reject(message);
    }
    const folderPath = `${tenantId}/${modelId}/${buildingId}/images`;
    const items = await baseOps.listFolderItems(folderPath);
    const generatedItems = items
      .filter((it) => it.name.startsWith("generated_") && it.name.endsWith(".png"))
      .map((it) => {
        const ts = Number(it.name.replace("generated_", "").replace(".png", ""));
        return { name: it.name, url: it.url, path: it.path, timestamp: Number.isFinite(ts) ? ts : 0 };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    return generatedItems;
  },
};
