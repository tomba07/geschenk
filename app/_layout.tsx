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
      // show the ID value in the stack header
      <Stack.Screen
        name="projects/[name]/[id]"
        options={({ route }: { route: { params?: any } }) => ({
          title: decodeURIComponent(route.params?.name),
        })}
      />
    </Stack>
  );
}
