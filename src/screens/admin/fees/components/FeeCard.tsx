import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button, ProgressBar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Fee } from "../../../../types";

interface FeeCardProps {
  fee: Fee;
  onPayNow: (fee: Fee) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

export const FeeCard: React.FC<FeeCardProps> = ({ fee, onPayNow }) => {
  const progress = fee.totalAmount > 0 ? fee.paidAmount / fee.totalAmount : 0;

  return (
    <Card style={[styles.card, { backgroundColor: "#ffffff" }]} elevation={2}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ color: "#0A0A0A" }}>
            {fee.title}
          </Text>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#87CEEB",
              },
            ]}
          >
            {/* show status with sky-blue text on white chip */}
            <Text style={[styles.statusText, { color: "#87CEEB" }]}>
              {fee.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.amounts}>
          <Text variant="bodySmall" style={{ color: "#0A0A0A" }}>
            Total: {formatCurrency(fee.totalAmount)}
          </Text>
          <Text variant="bodySmall" style={{ color: "#0A0A0A" }}>
            Paid: {formatCurrency(fee.paidAmount)}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ fontWeight: "bold", color: "#0A0A0A" }}
          >
            Due: {formatCurrency(fee.remaining)}
          </Text>
        </View>

        <ProgressBar
          progress={progress}
          color={"#87CEEB"}
          style={styles.progressBar}
        />
        <Text
          variant="bodySmall"
          style={[styles.dueDateText, { color: "#0A0A0A" }]}
        >
          Due Date: {new Date(fee.dueDate).toLocaleDateString()}
        </Text>

        {fee.remaining > 0 && (
          <Button
            mode="contained"
            icon="cash-multiple"
            onPress={() => onPayNow(fee)}
            style={styles.payButton}
            buttonColor={"#87CEEB"}
            textColor={"#0A0A0A"}
          >
            Pay Now
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusChip: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    color: "#87CEEB",
    fontSize: 12,
    fontWeight: "bold",
  },
  amounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  dueDateText: {
    textAlign: "right",
    marginBottom: 10,
  },
  payButton: {
    marginTop: 10,
    borderRadius: 6,
  },
});
