import { apiService } from "@/utils/apiService";
import { Assignment, Participant, ProjectDetails } from "@/utils/interfaces";
import { findMatches } from "@/utils/SecretSantaMatcher";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";

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
  }, []);

  const assignParticipants = () => {
    const participants: Participant[] = projectDetails.participants.map((participant) => {
      return { name: participant.name, excludes: [] };
    });

    const assignments: Assignment[] = findMatches(participants);

    setAssignments(assignments);
  };

  return (
    <View style={styles.container}>
      <Text>Participants:</Text>
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={projectDetails.participants}
        keyExtractor={(participant) => participant.name.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.item}>{item.name}</Text>
          </View>
        )}
      />
      {assignments.length > 0 && <Text>Assignments:</Text>}
      {assignments.map((assignment, index) => (
        <Text key={index}>
          {assignment.from} - {assignment.to}
        </Text>
      ))}

      <TouchableOpacity style={styles.floatingButton} onPress={assignParticipants}>
        <Text style={styles.buttonText}>Assign</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
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
    bottom: 40,
    right: 40,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
