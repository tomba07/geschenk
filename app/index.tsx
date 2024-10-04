import "react-native-url-polyfill/auto";
import { FlatList, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function App() {
  //hard coded uuid for user id for now

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all project rows
  const fetchProjects = async () => {
    const beProjects = (await (await fetch("https://geschenk-api-production.up.railway.app/projects")).json());

    setProjects(beProjects);
    console.log(beProjects);
    setLoading(false);
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
    <View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.name.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
