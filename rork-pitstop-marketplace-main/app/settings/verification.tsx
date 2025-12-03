import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { CheckCircle, Shield, Camera, FileText, Upload } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";

export default function VerificationScreen() {
  const { user } = useAuth();
  const [teamNumber, setTeamNumber] = useState<string>(user?.teamNumber?.toString() || "");
  const [schoolName, setSchoolName] = useState<string>(user?.schoolName || "");
  const [verificationDocs, setVerificationDocs] = useState<string[]>([]);

  const handleUploadPhoto = () => {
    Alert.alert("Upload Photo", "Camera functionality will be implemented");
  };

  const handleUploadDocument = () => {
    Alert.alert("Upload Document", "Document picker will be implemented");
  };

  const handleSubmit = () => {
    if (!teamNumber || !schoolName) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }
    Alert.alert("Verification Submitted", "We'll review your submission within 24-48 hours");
  };

  const verificationSteps = [
    {
      icon: FileText,
      title: "Enter Team Details",
      description: "Provide your team number and school name",
      completed: !!teamNumber && !!schoolName,
    },
    {
      icon: Camera,
      title: "Upload Verification Photo",
      description: "Photo of your team badge, robot, or team at competition",
      completed: verificationDocs.length > 0,
    },
    {
      icon: CheckCircle,
      title: "Review & Submit",
      description: "We'll verify your team within 24-48 hours",
      completed: false,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield size={32} color={Colors.accent} />
        </View>
        <Text style={styles.title}>Team Verification</Text>
        <Text style={styles.subtitle}>
          Get verified to build trust with other teams and unlock premium features
        </Text>
      </View>

      <View style={styles.benefits}>
        <Text style={styles.sectionTitle}>Verification Benefits</Text>
        <View style={styles.benefitItem}>
          <CheckCircle size={20} color={Colors.accent} />
          <Text style={styles.benefitText}>Verified badge on your profile</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={20} color={Colors.accent} />
          <Text style={styles.benefitText}>Higher visibility in search results</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={20} color={Colors.accent} />
          <Text style={styles.benefitText}>Increased buyer confidence</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={20} color={Colors.accent} />
          <Text style={styles.benefitText}>Access to verified-only features</Text>
        </View>
      </View>

      <View style={styles.steps}>
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <View key={index} style={styles.stepItem}>
              <View style={[
                styles.stepIcon,
                step.completed && styles.stepIconCompleted
              ]}>
                <Icon size={24} color={step.completed ? Colors.background : Colors.accent} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.completed && (
                  <Text style={styles.stepCompleted}>✓ Completed</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Team Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Team Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 7558"
            placeholderTextColor={Colors.textSecondary}
            value={teamNumber}
            onChangeText={setTeamNumber}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>School Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Toronto Tech High"
            placeholderTextColor={Colors.textSecondary}
            value={schoolName}
            onChangeText={setSchoolName}
          />
        </View>

        <Text style={styles.formTitle}>Verification Documents</Text>
        <Text style={styles.formSubtitle}>
          Upload at least one photo showing your team badge, robot, or team at competition
        </Text>

        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhoto}>
          <Camera size={24} color={Colors.accent} />
          <Text style={styles.uploadButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
          <Upload size={24} color={Colors.accent} />
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </TouchableOpacity>

        <Button
          title="Submit Verification"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Your information will be kept private and only used for verification purposes.
          Review typically takes 24-48 hours.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  benefits: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.text,
  },
  steps: {
    padding: 16,
  },
  stepItem: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconCompleted: {
    backgroundColor: Colors.accent,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  stepCompleted: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
    marginTop: 6,
  },
  form: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent + "40",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  submitButton: {
    marginTop: 24,
  },
  note: {
    padding: 16,
    marginVertical: 16,
  },
  noteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
