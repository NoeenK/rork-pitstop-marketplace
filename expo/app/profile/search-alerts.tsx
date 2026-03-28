import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Switch } from "react-native";
import { Stack } from "expo-router";
import { Tag, Plus, X, Bell, BellOff } from "lucide-react-native";
import { useSearchAlerts } from "@/contexts/SearchAlertsContext";
import { useState } from "react";

export default function SearchAlertsScreen() {
  const { alerts, addAlert, toggleAlert, deleteAlert } = useSearchAlerts();
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleAddAlert = () => {
    if (!query.trim()) return;
    
    addAlert({
      query: query.trim(),
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
    
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Search alerts",
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

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Tag size={64} color="#666666" />
          <Text style={styles.emptyTitle}>No search alerts</Text>
          <Text style={styles.emptyText}>Get notified when new items match your searches</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
            <Text style={styles.createButtonText}>Create Alert</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertQuery}>{alert.query}</Text>
                  {(alert.minPrice || alert.maxPrice) && (
                    <Text style={styles.alertPrice}>
                      {alert.minPrice && `$${alert.minPrice}+`}
                      {alert.minPrice && alert.maxPrice && " - "}
                      {alert.maxPrice && `$${alert.maxPrice}`}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => deleteAlert(alert.id)} style={styles.deleteButton}>
                  <X size={20} color="#666666" />
                </TouchableOpacity>
              </View>
              <View style={styles.alertFooter}>
                <Switch
                  value={alert.isActive}
                  onValueChange={() => toggleAlert(alert.id)}
                  trackColor={{ false: "#2C2C2E", true: "#FF6B35" }}
                  thumbColor="#FFFFFF"
                />
                <View style={styles.statusContainer}>
                  {alert.isActive ? (
                    <>
                      <Bell size={16} color="#34C759" />
                      <Text style={styles.statusTextActive}>Active</Text>
                    </>
                  ) : (
                    <>
                      <BellOff size={16} color="#666666" />
                      <Text style={styles.statusTextInactive}>Paused</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Search Alert</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Search Query</Text>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="e.g. NEO motors"
              placeholderTextColor="#666666"
            />

            <Text style={styles.label}>Min Price (optional)</Text>
            <TextInput
              style={styles.input}
              value={minPrice}
              onChangeText={setMinPrice}
              placeholder="0"
              placeholderTextColor="#666666"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Max Price (optional)</Text>
            <TextInput
              style={styles.input}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="1000"
              placeholderTextColor="#666666"
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddAlert}>
              <Text style={styles.saveButtonText}>Create Alert</Text>
            </TouchableOpacity>
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
  alertCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertQuery: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  alertPrice: {
    fontSize: 14,
    color: "#FF6B35",
  },
  deleteButton: {
    padding: 4,
  },
  alertFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusTextActive: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600" as const,
  },
  statusTextInactive: {
    fontSize: 14,
    color: "#666666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
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
});
