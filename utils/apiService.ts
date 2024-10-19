import { Assignment, BEParticipant } from "./interfaces";
import * as SecureStore from "expo-secure-store";
import uuid from 'react-native-uuid';

const API_BASE_URL = "https://geschenk-api-production.up.railway.app";

let cachedUserId: string | null = null;

const _checkUserId = async () => {
  try {
    if (cachedUserId) {
      return;
    }
    let userId: string = await SecureStore.getItemAsync("USER_ID") || "";

    if (!userId) {
      userId = uuid.v4() as string;
      await createUser();
      await SecureStore.setItemAsync("USER_ID", userId);
    }

    cachedUserId = userId;

  } catch (error) {
    console.error("Error fetching USER_ID:", error);
  }
};

const createUser = async () => {
  _checkUserId();

  return await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify({ id: cachedUserId }),
  });
};

const getProjects = async () => {
  _checkUserId();
  return await (await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      "Content-Type": "application/json",
      "x-user-id": cachedUserId || "",
    },
  })).json();
};

const createProject = async ({ projectName }: { projectName: String }): Promise<Response> => {
  _checkUserId();

  return await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      userId: cachedUserId,
    }),
  });
};

const deleteProject = async ({ projectId }: { projectId: Number }) => {
  _checkUserId();
  return await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "DELETE",
  });
};

const getProjectDetails = async ({ projectId }: { projectId: Number }) => {
  _checkUserId();

  return await (await fetch(`${API_BASE_URL}/projects/${projectId}`)).json();
};

const createParticipant = async ({ participant }: { participant: BEParticipant }) => {
  _checkUserId();
  return await fetch(`${API_BASE_URL}/participants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  });
};

const deleteParticipant = async ({ name, projectId }: { name: String, projectId: Number }) => {
  _checkUserId();
  return await fetch(`${API_BASE_URL}/projects/${projectId}/participants/${name}`, {
    method: "DELETE",
  });
};

const createAssignments = async ({ assignments, projectId }: { assignments: Assignment[]; projectId: Number }) => {
  _checkUserId();
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
