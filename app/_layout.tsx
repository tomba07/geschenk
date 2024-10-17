import { Stack } from "expo-router";
import { EditModeProvider } from "@/utils/context/EditModeContext";
import { HeaderRight } from "@/components/HeaderRight";

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "grey",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => (route.name !== "results/[id]" ? <HeaderRight /> : null),
      })}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Projects",
        }}
      />
      <Stack.Screen
        name="projects/[id]"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="results/[id]"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <EditModeProvider>
      <RootLayoutNav />
    </EditModeProvider>
  );
}
