import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, Text, FlatList, Button, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { apiService } from "../utils/apiService";
import { Project } from "@/utils/interfaces";
import { globalStyles } from "@/utils/styles";
import { CustomBottomSheet } from "@/components/BottomSheet";
import { useEditMode } from "@/utils/context/EditModeContext";
import getUserId from "@/utils/userIdService";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const { isEditMode, setIsEditMode } = useEditMode();
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const beProjects = await apiService.getProjects();
      setProjects(beProjects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
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
    const initializeUserId = async () => {
      await getUserId();
      await apiService.createUser();
      fetchProjects();
    };

    initializeUserId();
  }, []);

  const handlePress = (item: Project) => {
    if (item.assigned) {
      router.push(`/results/${item.id.toString()}` as const);
    } else {
      router.push(`/projects/${item.id.toString()}` as const);
    }
  };

  const toggleProjectSelection = (projectId: number) => {
    setSelectedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const deleteSelectedProjects = async () => {
    for (const projectId of selectedProjects) {
      await apiService.deleteProject({ projectId });
      fetchProjects();
    }
    setSelectedProjects(new Set());
    setIsEditMode(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        {loading && (
          <View style={globalStyles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => (isEditMode ? toggleProjectSelection(item.id) : handlePress(item))}
              style={[globalStyles.itemContainer, { flexDirection: "row", alignItems: "center" }]}
            >
              <Text style={globalStyles.item}>{item.name}</Text>
              {isEditMode && (
                <Ionicons
                  name={selectedProjects.has(item.id) ? "checkbox" : "square-outline"}
                  size={24}
                  color="gray"
                  style={{ marginRight: 10 }}
                />
              )}
              {!isEditMode && <Ionicons name="chevron-forward-outline" size={20} color="gray" />}
            </TouchableOpacity>
          )}
        />

        <View style={globalStyles.footer}>
          {isEditMode ? (
            <Button
              title={`Delete Selected (${selectedProjects.size})`}
              onPress={deleteSelectedProjects}
              disabled={selectedProjects.size === 0}
            />
          ) : (
            <Button title="Create Project" onPress={() => bottomSheetRef.current?.expand()} />
          )}
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
