import { apiService } from "@/utils/apiService";
import { BEParticipant, Participant, ProjectDetails, SimplifiedAssignment } from "@/utils/interfaces";
import { findMatches } from "@/utils/SecretSantaMatcher";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Button } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  const [participantName, setParticipantName] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);

  const fetchProjectDetails = async ({ projectId }: { projectId: Number }) => {
    setProjectDetails(await apiService.getProjectDetails({ projectId }));
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectDetails({ projectId: projectIdAsNum });
  }, []);

  const createParticipant = async () => {
    const participant: BEParticipant = { name: participantName, projectId: projectIdAsNum };

    try {
      await apiService.createParticipant({ participant });
      setParticipantName("");
      bottomSheetRef.current?.close();
      fetchProjectDetails({ projectId: projectIdAsNum });
    } catch (error) {
      console.error(error);
    }
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
          <TouchableOpacity style={styles.footerButton} onPress={() => bottomSheetRef.current?.expand()}>
            <Text style={styles.buttonText}>Create Participant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={assignParticipants}>
            <Text style={styles.buttonText}>Assign Participants</Text>
          </TouchableOpacity>
        </View>

        <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={["10%", "30%"]}>
          <View style={styles.sheetContent}>
            <View style={styles.cancelButton}>
              <Button
                title="Cancel"
                onPress={() => {
                  bottomSheetRef.current?.close();
                  setParticipantName("");
                }}
              />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Create Participant</Text>
              <TouchableOpacity onPress={createParticipant} style={styles.createButton}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter participant name"
              onChangeText={(text) => setParticipantName(text)}
              value={participantName}
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
  sheetContent: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    marginLeft: 0,
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
