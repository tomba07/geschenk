import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text, FlatList, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { apiService } from "../utils/apiService";
import { Project } from "@/utils/interfaces";

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
      <View style={styles.container}>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item)} style={styles.itemContainer}>
              <Text style={styles.item}>{item.name}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="gray" />
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()} style={styles.floatingButton}>
          <Ionicons name="add-circle" size={60} color="#007AFF" />
        </TouchableOpacity>

        <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={["10%", "30%"]}>
          <View style={styles.sheetContent}>
            <View style={styles.cancelButton}>
              <Button
                title="Cancel"
                onPress={() => {
                  bottomSheetRef.current?.close();
                  setProjectName("");
                }}
              />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Create Project</Text>
              <TouchableOpacity onPress={createProject} style={styles.createButton}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
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
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  item: {
    fontSize: 18,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  cancelButton: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetContent: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    marginLeft: 0,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    fontSize: 18,
    width: "100%",
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
