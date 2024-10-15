import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text, FlatList, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { apiService } from "../utils/apiService";
import { Project } from "@/utils/interfaces";
import { globalStyles } from "@/utils/styles";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
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

        <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()} style={globalStyles.floatingButton}>
          <Ionicons name="add-circle" size={60} color="#007AFF" />
        </TouchableOpacity>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["10%", "30%"]}
          onChange={(index) => {
            if (index > 0) {
              inputRef.current?.focus();
            }
          }}
        >
          <View style={globalStyles.sheetContent}>
            <View style={globalStyles.cancelButton}>
              <Button
                title="Cancel"
                onPress={() => {
                  bottomSheetRef.current?.close();
                  setProjectName("");
                }}
              />
            </View>
            <View style={globalStyles.sheetHeader}>
              <Text style={globalStyles.sheetTitle}>Create Project</Text>
              <TouchableOpacity onPress={createProject} style={globalStyles.createButton}>
                <Text style={globalStyles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={inputRef}
              style={globalStyles.input}
              placeholder="Enter project name"
              onChangeText={(text) => setProjectName(text)}
              value={projectName}
            />
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  
});
