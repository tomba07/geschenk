import { apiService } from "@/utils/apiService";
import { BEParticipant, Participant, ProjectDetails, SimplifiedAssignment } from "@/utils/interfaces";
import { findMatches } from "@/utils/SecretSantaMatcher";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Button } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "@/utils/styles";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";
import { CustomBottomSheet } from "@/components/BottomSheet";
import { useEditMode } from '@/utils/context/EditModeContext';
import { HeaderRight } from '@/components/HeaderRight';

export default function DetailsScreen() {
  let { id: projectId } = useLocalSearchParams();
  const projectIdAsNum = Number(projectId);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    id: projectIdAsNum,
    name: "",
    participants: [],
    assignments: [],
  });
  const [assignmentsExist, setAssignmentsExist] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [revealedAssignments, setRevealedAssignments] = useState<{ [key: string]: boolean }>({});
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();
  const router = useRouter();
  const { isEditMode, setIsEditMode } = useEditMode();
  const [selectedParticipants, setSelectedParticipants] = useState<Set<String>>(new Set());

  const handleDeepLink = (event: any) => {
    const data = Linking.parse(event.url);
    const { path } = data;

    if (path?.startsWith("projects/")) {
      const projectId = path.split("/")[1];

      router.push(`/projects/${projectId}` as const);
    }
  };

  const toggleReveal = (assignmentFromName: string) => {
    setRevealedAssignments((prevRevealed) => ({
      ...prevRevealed,
      [assignmentFromName]: !prevRevealed[assignmentFromName],
    }));
  };

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchProjectDetails = async () => {
    const projectDetails = await apiService.getProjectDetails({ projectId: projectIdAsNum });
    setProjectDetails(projectDetails);
    const assignmentsExist = projectDetails.assignments.length > 0;
    setAssignmentsExist(assignmentsExist);
    navigation.setOptions({ 
      title: projectDetails.name,
      headerRight: () => <HeaderRight assignmentsExist={assignmentsExist} />
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectIdAsNum, navigation]);

  const createParticipant = async () => {
    const participant: BEParticipant = { name: participantName, projectId: projectIdAsNum };

    try {
      await apiService.createParticipant({ participant });
      setParticipantName("");
      bottomSheetRef.current?.close();
      fetchProjectDetails();
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

    fetchProjectDetails();
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

  useEffect(() => {
    // Reset edit mode when component mounts
    setIsEditMode(false);

    // Optionally, reset edit mode when component unmounts
    return () => setIsEditMode(false);
  }, []);

  const toggleParticipantSelection = (name: String) => {
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

  const deleteSelectedParticipants = async () => {
    for (const name of selectedParticipants) {
      await apiService.deleteParticipant({ name, projectId: projectIdAsNum });
    }
    fetchProjectDetails();
    setSelectedParticipants(new Set());
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
        {!assignmentsExist && (
          <FlatList
            data={projectDetails.participants}
            keyExtractor={(participant) => participant.name}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => isEditMode ? toggleParticipantSelection(item.name) : null}
                style={[globalStyles.itemContainer, { flexDirection: 'row', alignItems: 'center' }]}
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
        )}
        <FlatList
          data={projectDetails.assignments}
          keyExtractor={(assignment) => assignment.fromName.toString()}
          renderItem={({ item }) => {
            return (
              <View style={globalStyles.itemContainer}>
                <Text style={globalStyles.item}>{item.fromName}</Text>
                {revealedAssignments[item.fromName] && <Text>{item.toName}</Text>}
                <TouchableOpacity onPress={() => toggleReveal(item.fromName)}>
                  <Ionicons
                    name={revealedAssignments[item.fromName] ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#007bff"
                  />
                </TouchableOpacity>
              </View>
            );
          }}
        />
        <View style={globalStyles.footer}>
          {!assignmentsExist && (
            <>
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
            </>
          )}
          {assignmentsExist && (
            <TouchableOpacity
              onPress={async () => {
                const fullRoute = Linking.createURL(`/projects/${projectId}`);

                await Clipboard.setStringAsync(fullRoute);
                Toast.show({
                  text1: "Link copied to clipboard!",
                });
              }}
            >
              <Ionicons name="share-outline" size={20} color="#007bff" />
            </TouchableOpacity>
          )}
        </View>

        <CustomBottomSheet
          bottomSheetRef={bottomSheetRef}
          title="Create Participant"
          inputPlaceholder="Enter participant name"
          inputValue={participantName}
          onInputChange={setParticipantName}
          onCancel={() => {
            bottomSheetRef.current?.close();
            setParticipantName("");
          }}
          onSubmit={createParticipant}
          submitButtonText="Create"
        />
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}
