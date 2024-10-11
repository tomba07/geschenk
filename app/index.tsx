import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { apiService } from "../utils/apiService";
import { Ionicons } from "@expo/vector-icons";

interface Project {
  id: Number;
  name: string;
}

export default function App() {
  //hard coded uuid for user id for now

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch all project rows
  const fetchProjects = async () => {
    const beProjects = await apiService.getProjects();

    setProjects(beProjects);
    setLoading(false);
  };

  // Create a new project
  const createProject = async () => {
    const response = await apiService.createProject({ projectName });

    if (response.ok) {
      fetchProjects();
    } else {
      alert("Failed to create project");
    }
  };

  const handlePress = (item: Project) => {
    router.push(`/projects/${item.name}/${item.id.toString()}` as const);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder="Project name" onChangeText={(text) => setProjectName(text)} />
      <Button title="Create" onPress={createProject} />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.name.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)} style={styles.itemContainer}>
            <Text style={styles.item}>{item.name}</Text>
            {/* Arrow icon */}
            <Ionicons name="chevron-forward-outline" size={20} color="gray" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 12,
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
});
