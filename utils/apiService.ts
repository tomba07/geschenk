import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { Assignment, BEParticipant } from "./interfaces";
import getUserId from "./userIdService";
import { getCachedUserId } from "./userIdService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const createUser = async () => {
    console.log("createUser called");
  return await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: getCachedUserId() }),
  });
};

const getProjects = async () => {
    console.log("getProjects called");
  return await (await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      "Content-Type": "application/json",
      "x-user-id": (await getCachedUserId()) || "",
    },
  })).json();
};

const createProject = async ({ projectName }: { projectName: String }): Promise<Response> => {
  return await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      userId: getCachedUserId(),
    }),
  });
};

const deleteProject = async ({ projectId }: { projectId: string }) => {
  return await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "DELETE",
  });
};

const getProjectDetails = async ({ projectId }: { projectId: string }) => {
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

const deleteParticipant = async ({ name, projectId }: { name: String, projectId: string }) => {
  return await fetch(`${API_BASE_URL}/projects/${projectId}/participants/${name}`, {
    method: "DELETE",
  });
};

const createAssignments = async ({ assignments, projectId }: { assignments: Assignment[]; projectId: string }) => {
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
  createUser,
  getProjects,
  createProject,
  getProjectDetails,
  createParticipant,
  createAssignments,
  deleteProject,
  deleteParticipant,
};
