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
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const router = useRouter();

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

  const fetchProjectDetails = async ({ projectId }: { projectId: Number }) => {
    const projectDetails = await apiService.getProjectDetails({ projectId });
    setProjectDetails(projectDetails);
    setAssignmentsExist(projectDetails.assignments.length > 0);
    navigation.setOptions({ title: projectDetails.name });
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
        {!assignmentsExist && (
          <FlatList
            data={projectDetails.participants}
            keyExtractor={(participant) => participant.name.toString()}
            renderItem={({ item }) => (
              <View style={globalStyles.itemContainer}>
                <Text style={globalStyles.item}>{item.name}</Text>
              </View>
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
              <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()}>
                <Ionicons name="person-add-outline" size={20} color="#007bff" />
              </TouchableOpacity>
              <Button title="Assign" onPress={assignParticipants} />
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
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}
