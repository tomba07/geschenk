// apiService.js

import { Assignment, BEParticipant } from "./interfaces";

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

const deleteProject = async ({ projectId }: { projectId: Number }) => {
  return await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "DELETE",
  });
};

const getProjectDetails = async ({ projectId }: { projectId: Number }) => {
  return await (await fetch(`${API_BASE_URL}/projects/${projectId}`)).json();
};

const createParticipant = async ({ participant }: { participant: BEParticipant }) => {
  return await fetch(`${API_BASE_URL}/participants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  });
};

const deleteParticipant = async ({ name, projectId }: { name: String, projectId: Number }) => {
  return await fetch(`${API_BASE_URL}/projects/${projectId}/participants/${name}`, {
    method: "DELETE",
  });
};

const createAssignments = async ({ assignments, projectId }: { assignments: Assignment[]; projectId: Number }) => {
  //first delete all old assignments
  //TODO: Think about rollback
  await fetch(`${API_BASE_URL}/assignments/${projectId}`, {
    method: "DELETE",
  });
  return await fetch(`${API_BASE_URL}/assignments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, assignments }),
  });
};

export const apiService = {
  getProjects,
  createProject,
  getProjectDetails,
  createParticipant,
  createAssignments,
  deleteProject,
  deleteParticipant,
};
