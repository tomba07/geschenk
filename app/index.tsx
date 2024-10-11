import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { apiService } from "../utils/apiService";

interface Project {
    id: Number;
  name: string;
}

export default function App() {
  //hard coded uuid for user id for now

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);

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
      <FlatList
        data={projects}
        keyExtractor={(item) => item.name.toString()}
        renderItem={({ item }) => (
          <View>
            <Link href={`/projects/${item.name}/${item.id}`}>
              <Text>{item.name}</Text>
            </Link>
          </View>
        )}
      />
      <View>
        <TextInput placeholder="Project name" onChangeText={(text) => setProjectName(text)} />
        <Button title="Create" onPress={createProject} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
