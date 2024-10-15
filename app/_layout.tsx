import { apiService } from "@/utils/apiService";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "grey",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Projects" }} />
      <Stack.Screen
        name="projects/[id]"
        options={({ route }: { route: { params?: any } }) => ({
          title: "",
        })}
      />
    </Stack>
  );
}
