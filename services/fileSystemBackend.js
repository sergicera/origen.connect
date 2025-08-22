import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiService = {
  getAllProjects: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/storage/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },

  getProjectExercices: async (projectId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/storage/projects/${projectId}/exercices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },

  /**
   * List files in the current exercise's directory
   * @param {*} exerciceId
   * @returns
   */

  listExerciceFiles: async (exerciceId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/storage/exercices/${exerciceId}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },

  addFilesToExerciceOnFolder: async (exerciceId, formData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/storage/files/${exerciceId}/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Let Axios set the correct Content-Type with boundaries
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
