import { apiService } from "@/utils/apiService";
import { BEParticipant, Participant, ProjectDetails, SimplifiedAssignment } from "@/utils/interfaces";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TextInput, Button, TouchableOpacity } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "@/utils/styles";
import { findMatches } from "@/utils/SecretSantaMatcher";
import * as Linking from "expo-linking";

export default function ParticipantsScreen() {
  let { id: projectId } = useLocalSearchParams();
  const projectIdAsNum = Number(projectId);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    id: projectIdAsNum,
    name: "",
    participants: [],
    assignments: [],
  });
  const [participantName, setParticipantName] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    fetchProjectDetails({ projectId: projectIdAsNum });
  }, []);

  const fetchProjectDetails = async ({ projectId }: { projectId: Number }) => {
    const projectDetails = await apiService.getProjectDetails({ projectId });
    setProjectDetails(projectDetails);
    navigation.setOptions({ title: projectDetails.name });
    setLoading(false);
  };

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

    // Navigate to ResultsScreen to view assignments
    router.replace(`/results/${projectId}` as const);
  };

  const createAssignments = async (simplifiedAssignments: SimplifiedAssignment[]) => {
    const assignments = simplifiedAssignments.map((assignment) => {
      return {
        ...assignment,
        projectId: projectIdAsNum,
      };
    });
    try {
      await apiService.createAssignments({ assignments, projectId: projectIdAsNum });
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
      <View style={globalStyles.container}>
        <FlatList
          data={projectDetails.participants}
          keyExtractor={(participant) => participant.name.toString()}
          renderItem={({ item }) => (
            <View style={globalStyles.itemContainer}>
              <Text style={globalStyles.item}>{item.name}</Text>
            </View>
          )}
        />
        <View style={globalStyles.footer}>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()}>
            <Ionicons name="person-add-outline" size={20} color="#007bff" />
          </TouchableOpacity>
          <Button title="Assign" onPress={assignParticipants} />
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["10%", "30%"]}
          onChange={(index) => {
            if (index > 0) {
              inputRef.current?.focus();
            }
          }}
        >
          <View style={globalStyles.sheetContent}>
            <View style={globalStyles.cancelButton}>
              <Button
                title="Cancel"
                onPress={() => {
                  bottomSheetRef.current?.close();
                  setParticipantName("");
                }}
              />
            </View>
            <View style={globalStyles.sheetHeader}>
              <Text style={globalStyles.sheetTitle}>Create Participant</Text>
              <TouchableOpacity onPress={createParticipant} style={globalStyles.createButton}>
                <Text style={globalStyles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={inputRef}
              style={globalStyles.input}
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
