import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar, Download, CreditCard } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: Date;
  status: "completed" | "pending" | "failed";
}

export default function BalanceScreen() {
  const [balance] = useState<number>(25000);
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "credit",
      amount: 18000,
      description: "Sold: Swerve Module MK4i",
      date: new Date("2024-10-28"),
      status: "completed",
    },
    {
      id: "2",
      type: "debit",
      amount: 12000,
      description: "Purchased: REV NEO Motors",
      date: new Date("2024-10-25"),
      status: "completed",
    },
    {
      id: "3",
      type: "credit",
      amount: 6000,
      description: "Sold: Pneumatics Kit",
      date: new Date("2024-10-20"),
      status: "completed",
    },
    {
      id: "4",
      type: "debit",
      amount: 4500,
      description: "Purchased: CTRE PDP",
      date: new Date("2024-10-15"),
      status: "pending",
    },
  ]);

  const handleWithdraw = () => {
    console.log("Withdraw funds");
  };

  const handleAddPayment = () => {
    console.log("Add payment method");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${(balance / 100).toFixed(2)}</Text>
        <Text style={styles.balanceSubtext}>Ready to withdraw</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Download size={20} color={Colors.background} />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleAddPayment}>
            <CreditCard size={20} color={Colors.text} />
            <Text style={styles.secondaryButtonText}>Add Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={Colors.accent} />
          <Text style={styles.statValue}>$420.00</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingDown size={20} color={Colors.primary} />
          <Text style={styles.statValue}>$245.00</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={[
              styles.transactionIcon,
              transaction.type === "credit" 
                ? { backgroundColor: Colors.accent + "20" }
                : { backgroundColor: Colors.primary + "20" }
            ]}>
              {transaction.type === "credit" ? (
                <TrendingUp size={20} color={Colors.accent} />
              ) : (
                <TrendingDown size={20} color={Colors.primary} />
              )}
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>
                {transaction.description}
              </Text>
              <View style={styles.transactionMeta}>
                <Calendar size={12} color={Colors.textSecondary} />
                <Text style={styles.transactionDate}>
                  {transaction.date.toLocaleDateString()}
                </Text>
                <Text style={[
                  styles.transactionStatus,
                  transaction.status === "pending" && styles.transactionStatusPending,
                  transaction.status === "failed" && styles.transactionStatusFailed,
                ]}>
                  {transaction.status}
                </Text>
              </View>
            </View>
            
            <Text style={[
              styles.transactionAmount,
              transaction.type === "credit" && styles.transactionAmountCredit,
            ]}>
              {transaction.type === "credit" ? "+" : "-"}
              ${(transaction.amount / 100).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Funds are typically available for withdrawal within 3-5 business days after a successful sale.
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
  balanceCard: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  withdrawButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.background,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  stats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
    marginLeft: 6,
    textTransform: "capitalize" as const,
  },
  transactionStatusPending: {
    color: Colors.warning,
  },
  transactionStatusFailed: {
    color: Colors.error,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  transactionAmountCredit: {
    color: Colors.accent,
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
