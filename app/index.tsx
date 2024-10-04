import "react-native-url-polyfill/auto";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { Link } from "expo-router";

export default function App() {
  //hard coded uuid for user id for now

  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const apiURL = "https://geschenk-api-production.up.railway.app";

  // Fetch all project rows
  const fetchProjects = async () => {
    const beProjects = await (await fetch(`${apiURL}/projects`)).json();

    setProjects(beProjects);
    setLoading(false);
  };

  // Create a new project
  const createProject = async () => {
    const response = await fetch(`${apiURL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
      }),
    });

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
    //Show list of nicely formatted projects
    <View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.name.toString()}
        renderItem={({ item }) => (
          <View>
            {/* <Text>{item.name}</Text> */}
            <Link href={`/projects/${item.name}`}>
              <Text>{item.name}</Text>
            </Link>
          </View>
        )}
      />
      <View>
        <Text>Create a new project</Text>
        <Text>Project name:</Text>
        <TextInput placeholder="Project name" onChangeText={(text) => setProjectName(text)} />
        <Button title="Create" onPress={createProject} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
