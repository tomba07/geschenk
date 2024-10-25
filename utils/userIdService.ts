import * as SecureStore from "expo-secure-store";
import uuid from "react-native-uuid";

let cachedUserId: string = "";

const getUserId = async () => {
  try {
    if (!cachedUserId) {
      let userId: string = (await SecureStore.getItemAsync("USER_ID")) || "";

      if (!userId) {
        userId = uuid.v4() as string;
      }

      cachedUserId = userId;
    }

    return cachedUserId;
  } catch (error) {
    console.error("Error fetching USER_ID:", error);
  }

  console.log("returning cachedUserId", cachedUserId);

  return cachedUserId;
};

const getCachedUserId = () => {
  console.log("getCachedUserId called", cachedUserId);
  return cachedUserId;
};

export default getUserId;

export { getCachedUserId };
