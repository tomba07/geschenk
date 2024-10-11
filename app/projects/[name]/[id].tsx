import { apiService } from "@/utils/apiService";
import SecretSantaMatcher from "@/utils/SecretSantaMatcher";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

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
      <Text>Details of project {projectName} </Text>
      <Text>Participants:</Text>
      {loading && <Text>Loading...</Text>}
      {!loading && projectDetails.participants.map((participant, index) => <Text key={index}>{participant.name}</Text>)}
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
    justifyContent: "center",
    alignItems: "center",
  },
});
