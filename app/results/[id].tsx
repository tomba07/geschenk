import { apiService } from "@/utils/apiService";
import { ProjectDetails } from "@/utils/interfaces";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "@/utils/styles";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import * as Linking from "expo-linking";

export default function ResultsScreen() {
  let { id: projectId } = useLocalSearchParams();
  const projectIdAsNum = Number(projectId);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    id: projectIdAsNum,
    name: "",
    participants: [],
    assignments: [],
  });
  const [revealedAssignments, setRevealedAssignments] = useState<{ [key: string]: boolean }>({});
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

  const toggleReveal = (assignmentFromName: string) => {
    setRevealedAssignments((prevRevealed) => ({
      ...prevRevealed,
      [assignmentFromName]: !prevRevealed[assignmentFromName],
    }));
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
        </View>
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}
