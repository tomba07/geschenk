import { Stack } from "expo-router";
import { TouchableOpacity, Text } from 'react-native';
import { EditModeProvider, useEditMode } from '@/utils/context/EditModeContext';

function HeaderRight() {
  const { isEditMode, setIsEditMode } = useEditMode();
  return (
    <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
      <Text style={{ color: '#fff', marginRight: 15 }}>
        {isEditMode ? "Done" : "Edit"}
      </Text>
    </TouchableOpacity>
  );
}

function RootLayoutNav() {
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
      <Stack.Screen
        name="index"
        options={{
          title: "Projects",
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen
        name="projects/[id]"
        options={({ route }: { route: { params?: any } }) => ({
          title: "",
        })}
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