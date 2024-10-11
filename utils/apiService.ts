// apiService.js

import { Assignment } from "./interfaces";

const API_BASE_URL = "https://geschenk-api-production.up.railway.app";

const getProjects = async () => {
  return await (await fetch(`${API_BASE_URL}/projects`)).json();
};

const createProject = async ({ projectName }: { projectName: String }): Promise<Response> => {
  return await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
    }),
  });
};

const getProjectDetails = async ({ projectId }: { projectId: Number }) => {
  return await (await fetch(`${API_BASE_URL}/projects/${projectId}`)).json();
};

const createAssignments = async (assignments: Assignment[]) => {
  return await fetch(`${API_BASE_URL}/assignments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignments),
  });
};

export const apiService = {
  getProjects,
  createProject,
  getProjectDetails,
  createAssignments,
};
