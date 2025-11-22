import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabaseClient as supabase } from "@/lib/supabase";
import { Picker } from "@react-native-picker/picker";

export default function UsernameTeamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // This is a mock implementation - replace with actual Blue Alliance API call
      // For now, we'll use some sample team numbers
      const mockTeams = [
        { team_number: 254, nickname: "The Cheesy Poofs" },
        { team_number: 148, nickname: "RoboWranglers" },
        { team_number: 118, nickname: "The Robonauts" },
        { team_number: 1678, nickname: "Citrus Circuits" },
        { team_number: 2056, nickname: "OP Robotics" },
        { team_number: 1114, nickname: "Simbotics" },
        { team_number: 971, nickname: "Sparta Robotics" },
        { team_number: 1323, nickname: "MadTown Robotics" },
        { team_number: 1678, nickname: "Citrus Circuits" },
        { team_number: 2910, nickname: "Jack in the Bot" },
        { team_number: 118, nickname: "The Robonauts" },
        { team_number: 3309, nickname: "Beachbotics" }
      ];
      
      // Sort teams by team number
      const sortedTeams = [...mockTeams].sort((a, b) => a.team_number - b.team_number);
      setTeams(sortedTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      Alert.alert("Error", "Failed to load teams. Using default list.");
      
      // Fallback to a minimal set of teams
      const fallbackTeams = [
        { team_number: 1, nickname: "Team 1" },
        { team_number: 2, nickname: "Team 2" },
        { team_number: 3, nickname: "Team 3" }
      ];
      setTeams(fallbackTeams);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please choose a username");
      return;
    }
    
    if (!selectedTeam) {
      Alert.alert("Error", "Please select a team");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw userError || new Error("User not found");
      }
      
      // Check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .neq('id', user.id)
        .single();
      
      if (existingUser && !checkError) {
        throw new Error("Username is already taken. Please choose another one.");
      }
      
      // Update user profile with username and team
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          team_number: selectedTeam,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Navigate to home screen
      router.replace("/(tabs)/(home)");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error", 
        error?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#C44B5C" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FFF5E6", "#C44B5C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Complete Your Profile</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Choose a Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Your Team</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTeam}
                onValueChange={(itemValue) => setSelectedTeam(itemValue)}
                style={styles.picker}
                dropdownIconColor="#C44B5C"
              >
                <Picker.Item label="Select a team..." value="" />
                {teams.map((team) => (
                  <Picker.Item 
                    key={team.team_number} 
                    label={`${team.team_number} - ${team.nickname}`} 
                    value={team.team_number.toString()} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.continueButton, (!username || !selectedTeam || isSubmitting) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!username || !selectedTeam || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  continueButton: {
    backgroundColor: '#C44B5C',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  continueButtonDisabled: {
    backgroundColor: '#C4B5A8',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
