import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Portal,
  Dialog,
  Button,
  TextInput,
  Text,
  Divider,
} from "react-native-paper";
import { Fee } from "../../../../types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  fee: Fee | null;
  onPaymentSuccess: (data: {
    feeId: number;
    amount: number;
    method: string;
    receiptNumber: string;
    transactionId: string;
    timestamp: string;
  }) => Promise<void>;
  maxAmount: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  fee,
  onPaymentSuccess,
  maxAmount,
}) => {
  const [amount, setAmount] = useState(maxAmount.toString());
  const [method, setMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      setAmount(maxAmount.toString());
      setMethod("UPI");
      setTransactionId("");
      setError("");
    }
  }, [open, maxAmount]);

  const handleConfirmPayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError("Amount must be positive.");
      return;
    }
    if (paymentAmount > maxAmount) {
      setError(
        `Amount cannot exceed the remaining due: ${formatCurrency(maxAmount)}`
      );
      return;
    }
    if (!transactionId.trim()) {
      setError("Transaction ID is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const receiptNumber = `RCP${Date.now().toString().slice(-6)}`;
      const paymentData = {
        feeId: fee?.id!,
        amount: paymentAmount,
        method: method,
        receiptNumber: receiptNumber,
        transactionId: transactionId.trim(),
        timestamp: new Date().toISOString(),
      };

      await onPaymentSuccess(paymentData);
      onClose();
    } catch (e: any) {
      Alert.alert(
        "Payment Failed",
        e.message || "An unexpected error occurred during payment processing."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!fee) return null;

  return (
    <Portal>
      <Dialog
        visible={open}
        onDismiss={onClose}
        style={[
          styles.dialog,
          { backgroundColor: "#ffffff", borderRadius: 12 },
        ]}
      >
        <Dialog.Title
          style={{
            color: "#87CEEB",
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <Icon name="credit-card-outline" size={24} color={"#87CEEB"} /> Pay
          Fee: {fee.title}
        </Dialog.Title>
        <Dialog.Content>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                },
              ]}
            >
              <View style={styles.detailRow}>
                <Text variant="titleMedium" style={{ color: "#0A0A0A" }}>
                  Total Fee:
                </Text>
                <Text
                  variant="titleMedium"
                  style={{ color: "#0A0A0A", fontWeight: "bold" }}
                >
                  {formatCurrency(fee.totalAmount)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="titleMedium" style={{ color: "#0A0A0A" }}>
                  Paid Amount:
                </Text>
                <Text
                  variant="titleMedium"
                  style={{ color: "#87CEEB", fontWeight: "bold" }}
                >
                  {formatCurrency(fee.paidAmount)}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text variant="headlineSmall" style={{ color: "#0A0A0A" }}>
                  Remaining Due:
                </Text>
                <Text
                  variant="headlineSmall"
                  style={{ color: "#0A0A0A", fontWeight: "bold" }}
                >
                  {formatCurrency(fee.remaining)}
                </Text>
              </View>
            </View>

            <TextInput
              label="Payment Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              error={!!error}
              right={<TextInput.Affix text="INR" />}
            />

            <TextInput
              label="Transaction ID (UPI/Bank Ref)"
              value={transactionId}
              onChangeText={setTransactionId}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.methodContainer}>
              <Text variant="labelLarge" style={{ color: "#0A0A0A", flex: 1 }}>
                Select Method:
              </Text>
              <Button
                mode={method === "UPI" ? "contained" : "outlined"}
                onPress={() => setMethod("UPI")}
                style={styles.methodButton}
                buttonColor={method === "UPI" ? "#87CEEB" : "#ffffff"}
                textColor={method === "UPI" ? "#0A0A0A" : "#87CEEB"}
              >
                UPI
              </Button>
              <Button
                mode={method === "Net Banking" ? "contained" : "outlined"}
                onPress={() => setMethod("Net Banking")}
                style={styles.methodButton}
                buttonColor={method === "Net Banking" ? "#87CEEB" : "#ffffff"}
                textColor={method === "Net Banking" ? "#0A0A0A" : "#87CEEB"}
              >
                Net Banking
              </Button>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
            paddingTop: 10,
          }}
        >
          <Button
            onPress={onClose}
            disabled={loading}
            mode="outlined"
            style={{ flex: 1, marginHorizontal: 5 }}
            textColor={"#0A0A0A"}
          >
            Cancel
          </Button>
          <Button
            onPress={handleConfirmPayment}
            loading={loading}
            disabled={loading}
            mode="contained"
            style={{ flex: 1, marginHorizontal: 5 }}
            buttonColor={"#87CEEB"}
            textColor={"#0A0A0A"}
          >
            Confirm Payment
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: "90%",
  },
  scrollContainer: {
    paddingVertical: 5,
  },
  detailCard: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)", // Light gray background
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  divider: {
    marginVertical: 10,
  },
  input: {
    marginBottom: 15,
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    gap: 10,
  },
  methodButton: {
    minWidth: 100,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginBottom: 10,
    textAlign: "center",
  },
});
