import { apiService } from "@/utils/apiService";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Participant {
  name: string;
}

interface ProjectDetails {
  id: Number;
  name: string;
  participants: Participant[];
}

export default function DetailsScreen() {
  let { id: projectId, name: projectName } = useLocalSearchParams();
  const projectIdAsNum = Number(projectId);
  projectName = projectName.toString();
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    id: projectIdAsNum,
    name: projectName,
    participants: [],
  });

  const fetchProjects = async ({ projectId }: { projectId: Number }) => {
    setProjectDetails(await apiService.getProjectDetails({ projectId }));

    setLoading(false);
  };

  useEffect(() => {
    fetchProjects({ projectId: projectIdAsNum });
  });

  return (
    <View style={styles.container}>
      <Text>Details of project {projectName} </Text>
      <Text>Participants:</Text>
      {loading && <Text>Loading...</Text>}
      {!loading && projectDetails.participants.map((participant, index) => (
        <Text key={index}>{participant.name}</Text>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
