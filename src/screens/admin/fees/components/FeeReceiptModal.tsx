import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Portal,
  Dialog,
  Button,
  Text,
  Divider,
  Avatar,
  useTheme,
} from "react-native-paper";
import { PaymentHistoryItem, StudentInfo } from "../../../types/FeeTypes";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface FeeReceiptModalProps {
  open: boolean;
  onClose: () => void;
  receipt: PaymentHistoryItem | null;
  studentInfo: StudentInfo | any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

const DetailRow: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <Text variant="labelLarge" style={{ color: "#0A0A0A" }}>
      {label}:
    </Text>
    <Text variant="bodyLarge" style={{ color: "#0A0A0A", fontWeight: "600" }}>
      {value}
    </Text>
  </View>
);

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  open,
  onClose,
  receipt,
  studentInfo,
}) => {
  const theme = useTheme();

  if (!receipt) return null;

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
            textAlign: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
            paddingBottom: 10,
          }}
        >
          <Icon name="receipt" size={24} color={"#87CEEB"} /> Payment Receipt
        </Dialog.Title>
        <Dialog.Content>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header Info */}
            <View style={styles.studentHeader}>
              <Avatar.Text
                size={50}
                label={studentInfo.firstName?.charAt(0) || "S"}
                style={{
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#87CEEB",
                }}
                labelStyle={{ fontSize: 24, color: "#87CEEB" }}
              />
              <View>
                <Text variant="titleMedium" style={{ color: "#0A0A0A" }}>
                  {studentInfo.firstName} {studentInfo.lastName}
                </Text>
                <Text variant="bodySmall" style={{ color: "#0A0A0A" }}>
                  Roll No: {studentInfo.rollNo || "N/A"}
                </Text>
                <Text variant="bodySmall" style={{ color: "#0A0A0A" }}>
                  Class: {studentInfo.className || "N/A"}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Receipt Amount */}
            <Text
              variant="headlineLarge"
              style={{
                color: "#87CEEB",
                marginBottom: 15,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {formatCurrency(receipt.amount)}
            </Text>

            <DetailRow
              label="Receipt Number"
              value={receipt.receiptNumber}
              theme={theme}
            />
            <DetailRow
              label="Fee Item"
              value={receipt.feeName || receipt.feeTitle || "N/A"}
              theme={theme}
            />
            <DetailRow
              label="Date Paid"
              value={new Date(receipt.date).toLocaleDateString()}
              theme={theme}
            />
            <DetailRow
              label="Payment Mode"
              value={receipt.paymentMode || receipt.paymentMethod || "N/A"}
              theme={theme}
            />
            <DetailRow
              label="Transaction ID"
              value={receipt.transactionId || "N/A"}
              theme={theme}
            />

            <View
              style={[
                styles.note,
                { borderColor: "#87CEEB", backgroundColor: "#ffffff" },
              ]}
            >
              <Text variant="bodySmall" style={{ color: "#0A0A0A" }}>
                <Text style={{ fontWeight: "bold" }}>Note:</Text> This is a
                system-generated receipt. Contact the school administration for
                any discrepancies.
              </Text>
            </View>
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
            icon="close"
            mode="outlined"
            style={styles.actionButton}
            textColor={"#0A0A0A"}
          >
            Close
          </Button>
          <Button
            onPress={() =>
              Alert.alert("Download", "Receipt download simulated.")
            }
            icon="download"
            mode="contained"
            style={styles.actionButton}
            buttonColor={"#87CEEB"}
            textColor={"#0A0A0A"}
          >
            Download PDF
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
    paddingVertical: 10,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  divider: {
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  note: {
    borderLeftWidth: 4,
    paddingLeft: 10,
    paddingVertical: 8,
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
