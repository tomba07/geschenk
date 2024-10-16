import React, { useEffect, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View, Text, FlatList, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { apiService } from "../utils/apiService";
import { Project } from "@/utils/interfaces";
import { globalStyles } from "@/utils/styles";
import { CustomBottomSheet } from "@/components/BottomSheet";


export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();

  const fetchProjects = async () => {
    const beProjects = await apiService.getProjects();
    setProjects(beProjects);
    setLoading(false);
  };

  const createProject = async () => {
    const response = await apiService.createProject({ projectName });

    if (response.ok) {
      setProjectName("");
      bottomSheetRef.current?.close();
      fetchProjects();
    } else {
      alert("Failed to create project");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handlePress = (item: Project) => {
    router.push(`/projects/${item.id.toString()}` as const);
  };

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item)} style={globalStyles.itemContainer}>
              <Text style={globalStyles.item}>{item.name}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="gray" />
            </TouchableOpacity>
          )}
        />

        <View style={globalStyles.footer}>
          <Button title="Create Project" onPress={() => bottomSheetRef.current?.expand()} />
        </View>

        <CustomBottomSheet
          bottomSheetRef={bottomSheetRef}
          title="Create Project"
          inputPlaceholder="Enter project name"
          inputValue={projectName}
          onInputChange={setProjectName}
          onCancel={() => {
            bottomSheetRef.current?.close();
            setProjectName("");
          }}
          onSubmit={createProject}
          submitButtonText="Create"
        />
      </View>
    </GestureHandlerRootView>
  );
}
