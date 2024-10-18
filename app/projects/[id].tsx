import { apiService } from "@/utils/apiService";
import { BEParticipant, ProjectDetails, Participant, SimplifiedAssignment } from "@/utils/interfaces";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TextInput, Button, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "@/utils/styles";
import { useEditMode } from "@/utils/context/EditModeContext";
import { findMatches } from "@/utils/SecretSantaMatcher";

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
  const { isEditMode, setIsEditMode } = useEditMode(); // Use the EditModeContext
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

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
    Alert.alert('Are you sure?', 'Once you assign participants, you cannot edit them anymore.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: async () => {
          const participants: Participant[] = projectDetails.participants.map((participant) => {
            return { name: participant.name, excludes: [] };
          });

          const assignments: SimplifiedAssignment[] = findMatches(participants);
          await createAssignments(assignments);

          // Navigate to ResultsScreen to view assignments
          router.replace(`/results/${projectId}` as const);
        }
      },
    ]);

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

  // Toggle participant selection logic
  const toggleParticipantSelection = (name: string) => {
    setSelectedParticipants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  // Delete selected participants
  const deleteSelectedParticipants = async () => {
    for (const name of selectedParticipants) {
      await apiService.deleteParticipant({ name, projectId: projectIdAsNum });
    }
    fetchProjectDetails({ projectId: projectIdAsNum });
    setSelectedParticipants(new Set());
    setIsEditMode(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        {loading && (
          <View style={globalStyles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <FlatList
          data={projectDetails.participants}
          keyExtractor={(participant) => participant.name.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => (isEditMode ? toggleParticipantSelection(item.name) : null)}
              style={[globalStyles.itemContainer, { flexDirection: "row", alignItems: "center" }]}
            >
              <Text style={globalStyles.item}>{item.name}</Text>
              {isEditMode && (
                <Ionicons
                  name={selectedParticipants.has(item.name) ? "checkbox" : "square-outline"}
                  size={24}
                  color="gray"
                  style={{ marginRight: 10 }}
                />
              )}
            </TouchableOpacity>
          )}
        />
        <View style={globalStyles.footer}>
          {isEditMode ? (
            <Button
              title={`Delete Selected (${selectedParticipants.size})`}
              onPress={deleteSelectedParticipants}
              disabled={selectedParticipants.size === 0}
            />
          ) : (
            <>
              <Button title="Assign" onPress={assignParticipants} />
              <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()}>
                <Ionicons name="person-add-outline" size={20} color="#007bff" />
              </TouchableOpacity>
            </>
          )}
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
