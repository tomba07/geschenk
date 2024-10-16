import { Stack } from "expo-router";
import { TouchableOpacity, Text } from 'react-native';
import { EditModeProvider, useEditMode } from '@/utils/context/EditModeContext';
import { useState } from 'react';
import { HeaderRight } from '@/components/HeaderRight';

function RootLayoutNav() {
  const [assignmentsExist, setAssignmentsExist] = useState(false);

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
        headerRight: () => <HeaderRight assignmentsExist={assignmentsExist} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Projects",
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
