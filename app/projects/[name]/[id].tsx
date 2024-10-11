import { apiService } from "@/utils/apiService";
import SecretSantaMatcher from "@/utils/SecretSantaMatcher";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, FlatList } from "react-native";

export interface Participant {
  name: string;
  excludes: string[];
}

interface ProjectDetails {
  id: Number;
  name: string;
  participants: Participant[];
}

export interface Assignment {
  from: string;
  to: string;
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
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchProjects = async ({ projectId }: { projectId: Number }) => {
    setProjectDetails(await apiService.getProjectDetails({ projectId }));

    setLoading(false);
  };

  useEffect(() => {
    fetchProjects({ projectId: projectIdAsNum });
  });

  const assignParticipants = () => {
    const participants: Participant[] = projectDetails.participants.map((participant) => {
      return { name: participant.name, excludes: [] };
    });

    const secretSantaMatcher = new SecretSantaMatcher(participants);
    const assignments: Assignment[] = secretSantaMatcher.findMatches();

    setAssignments(assignments);
  };

  return (
    <View style={styles.container}>
      <Text>Participants:</Text>
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={projectDetails.participants}
        keyExtractor={(participant) => participant.name.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
      <Button title="Assign" onPress={assignParticipants} />
      {assignments.length > 0 && <Text>Assignments:</Text>}
      {assignments.map((assignment, index) => (
        <Text key={index}>
          {assignment.from} - {assignment.to}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});
