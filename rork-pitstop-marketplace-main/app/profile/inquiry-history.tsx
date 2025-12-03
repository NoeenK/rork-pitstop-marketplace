import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Stack } from "expo-router";
import { FileText, Plus, MessageCircle, CheckCircle, Clock, XCircle } from "lucide-react-native";
import { useInquiry } from "@/contexts/InquiryContext";
import { useState } from "react";

export default function InquiryHistoryScreen() {
  const { inquiries, createInquiry, addResponse } = useInquiry();
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const handleCreateInquiry = async () => {
    if (!subject.trim() || !message.trim()) return;
    
    await createInquiry(subject.trim(), message.trim());
    setSubject("");
    setMessage("");
    setShowModal(false);
  };

  const handleAddResponse = async (inquiryId: string) => {
    if (!responseText.trim()) return;
    
    await addResponse(inquiryId, responseText.trim(), false);
    setResponseText("");
    setSelectedInquiry(null);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { icon: Clock, color: "#FFD700", label: "Pending" };
      case "in-progress":
        return { icon: MessageCircle, color: "#3B82F6", label: "In Progress" };
      case "resolved":
        return { icon: CheckCircle, color: "#34C759", label: "Resolved" };
      case "closed":
        return { icon: XCircle, color: "#666666", label: "Closed" };
      default:
        return { icon: Clock, color: "#666666", label: "Unknown" };
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Inquiry history",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
              <Plus size={24} color="#FF6B35" />
            </TouchableOpacity>
          ),
        }}
      />

      {inquiries.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={64} color="#666666" />
          <Text style={styles.emptyTitle}>No inquiries</Text>
          <Text style={styles.emptyText}>Your support inquiries will appear here</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
            <Text style={styles.createButtonText}>Create Inquiry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {inquiries.map((inquiry) => {
            const statusInfo = getStatusInfo(inquiry.status);
            const StatusIcon = statusInfo.icon;

            return (
              <TouchableOpacity
                key={inquiry.id}
                style={styles.inquiryCard}
                onPress={() => setSelectedInquiry(inquiry.id)}
              >
                <View style={styles.inquiryHeader}>
                  <Text style={styles.inquirySubject}>{inquiry.subject}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
                    <StatusIcon size={14} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.inquiryMessage} numberOfLines={2}>
                  {inquiry.message}
                </Text>
                <View style={styles.inquiryFooter}>
                  <Text style={styles.inquiryDate}>
                    {inquiry.createdAt.toLocaleDateString()}
                  </Text>
                  <View style={styles.responsesContainer}>
                    <MessageCircle size={14} color="#666666" />
                    <Text style={styles.responsesText}>{inquiry.responses.length} responses</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Inquiry</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <XCircle size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="What's your issue?"
              placeholderTextColor="#666666"
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue in detail"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateInquiry}>
              <Text style={styles.saveButtonText}>Submit Inquiry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedInquiry} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedInquiry && inquiries.find(i => i.id === selectedInquiry) && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {inquiries.find(i => i.id === selectedInquiry)?.subject}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedInquiry(null)}>
                    <XCircle size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.responsesScroll}>
                  <View style={styles.originalMessage}>
                    <Text style={styles.messageLabel}>Your message:</Text>
                    <Text style={styles.messageText}>
                      {inquiries.find(i => i.id === selectedInquiry)?.message}
                    </Text>
                  </View>

                  {inquiries.find(i => i.id === selectedInquiry)?.responses.map((response) => (
                    <View
                      key={response.id}
                      style={[
                        styles.responseCard,
                        response.isAdmin ? styles.adminResponse : styles.userResponse
                      ]}
                    >
                      <Text style={styles.responseAuthor}>
                        {response.isAdmin ? "Support Team" : "You"}
                      </Text>
                      <Text style={styles.responseMessage}>{response.message}</Text>
                      <Text style={styles.responseDate}>
                        {response.createdAt.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.replyContainer}>
                  <TextInput
                    style={styles.replyInput}
                    value={responseText}
                    onChangeText={setResponseText}
                    placeholder="Type your reply..."
                    placeholderTextColor="#666666"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => selectedInquiry && handleAddResponse(selectedInquiry)}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inquiryCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  inquirySubject: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  inquiryMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  inquiryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inquiryDate: {
    fontSize: 12,
    color: "#666666",
  },
  responsesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  responsesText: {
    fontSize: 12,
    color: "#666666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  responsesScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  originalMessage: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  responseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userResponse: {
    backgroundColor: "#2C2C2E",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  adminResponse: {
    backgroundColor: "#FF6B3520",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  responseAuthor: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FF6B35",
    marginBottom: 4,
  },
  responseMessage: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
    marginBottom: 4,
  },
  responseDate: {
    fontSize: 11,
    color: "#666666",
  },
  replyContainer: {
    flexDirection: "row",
    gap: 12,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
