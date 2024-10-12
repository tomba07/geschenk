import { apiService } from "@/utils/apiService";
import { BEParticipant, Participant, ProjectDetails, SimplifiedAssignment } from "@/utils/interfaces";
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
    assignments: [],
  });

  const fetchProjectDetails = async ({ projectId }: { projectId: Number }) => {
    setProjectDetails(await apiService.getProjectDetails({ projectId }));
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectDetails({ projectId: projectIdAsNum });
  }, []);

  const createParticipant = async () => {
    const participant: BEParticipant = { name: "New Participant", projectId: projectIdAsNum };

    try {
      await apiService.createParticipant({  participant });
      fetchProjectDetails({ projectId: projectIdAsNum });
    } catch (error) {
      console.error(error);
    }

    await fetchProjectDetails({ projectId: projectIdAsNum });
  };

  const assignParticipants = async () => {
    const participants: Participant[] = projectDetails.participants.map((participant) => {
      return { name: participant.name, excludes: [] };
    });

    const assignments: SimplifiedAssignment[] = findMatches(participants);
    await createAssignments(assignments);

    fetchProjectDetails({ projectId: projectIdAsNum });
  };

  const createAssignments = async (simplifiedAssignments: SimplifiedAssignment[]) => {
    const assignments = simplifiedAssignments.map((assignment) => {
      return {
        ...assignment,
        projectId: projectIdAsNum,
      };
    });
    try {
      await apiService.createAssignments(assignments);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
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
      {projectDetails.assignments.length > 0 && <Text>Assignments:</Text>}
      {projectDetails.assignments.map((assignment, index) => (
        <Text key={index}>
          {assignment.fromName} - {assignment.toName}
        </Text>
      ))}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={createParticipant}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={assignParticipants}>
          <Text style={styles.buttonText}>Assign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  footerButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 10,
    width: "40%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
