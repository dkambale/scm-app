import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  useTheme,
  Snackbar as RNP_Snackbar,
  Portal,
  List,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api, { userDetails } from "../../../api";
import { FeeCard } from "./components/FeeCard";
import { PaymentModal } from "./components/PaymentModal";
import { FeeReceiptModal } from "./components/FeeReceiptModal";
import { Fee, StudentInfo, PaymentHistoryItem } from "../../../types";
import { LoadingSpinner } from "../../../../components/common/LoadingSpinner"; // Assuming this path

// Helper function to format currency
const formatCurrency = (amount: number | undefined) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

interface ViewerData {
  id?: number | string;
  type?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  className?: string;
  rollNo?: string;
}

export const StudentFeeView: React.FC = () => {
  const theme = useTheme();
  const route = useRoute();
  const [viewer, setViewer] = useState<ViewerData | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | any>({});
  const [fees, setFees] = useState<Fee[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openReceiptModal, setOpenReceiptModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedReceipt, setSelectedReceipt] =
    useState<PaymentHistoryItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Route params check (for teacher/admin viewing another student)
  const { studentId: paramStudentId } =
    (route.params as { studentId?: string }) || {};
  const isTeacher = (viewer?.type || "").toUpperCase() === "TEACHER";
  const targetStudentId =
    isTeacher && paramStudentId ? paramStudentId : viewer?.id;

  // 1. Initial User Fetch (As per request)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Call userDetails.getUser() as requested
        const u = await userDetails.getUser();
        setViewer(u);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    loadUser();
  }, []);

  // 2. Data Fetch Logic
  const fetchStudentData = useCallback(async () => {
    if (!targetStudentId) return;

    try {
      setRefreshing(true);

      // API calls
      const [feesRes, historyRes, studentRes] = await Promise.all([
        api.get(`/api/student/fees/${targetStudentId}`),
        api.get(`/api/student/fees/${targetStudentId}/history`),
        api.get(`/api/users/getById?id=${targetStudentId}`),
      ]);

      setFees(feesRes?.data?.feeStatus || []);
      setPaymentHistory(historyRes?.data || []);
      setStudentInfo(studentRes.data || {});
    } catch (error) {
      console.error("Error fetching student data:", error);

      // --- Mock Data on Error/Demo ---
      setStudentInfo({
        id: targetStudentId,
        firstName: "Aryan",
        lastName: "Sharma",
        className: "6A",
        schoolName: "Sunrise High School",
        rollNo: "101",
        type: "STUDENT",
      } as StudentInfo);

      setFees([
        {
          id: 1,
          title: "Term 1 Tuition Fee",
          totalAmount: 12000,
          paidAmount: 9000,
          remaining: 3000,
          dueDate: "2025-08-31",
          status: "partial",
          installments: [],
        },
        {
          id: 2,
          title: "Library Fee",
          totalAmount: 1000,
          paidAmount: 1000,
          remaining: 0,
          dueDate: "2025-08-01",
          status: "paid",
          installments: [],
        },
        {
          id: 3,
          title: "Lab Fee",
          totalAmount: 2500,
          paidAmount: 0,
          remaining: 2500,
          dueDate: "2025-09-15",
          status: "pending",
          installments: [],
        },
      ] as Fee[]);

      setPaymentHistory([
        {
          id: 1,
          date: "2025-08-02",
          feeTitle: "Term 1 Tuition Fee",
          amount: 9000,
          receiptNumber: "RCP001",
          paymentMode: "UPI",
        },
        {
          id: 2,
          date: "2025-08-01",
          feeTitle: "Library Fee",
          amount: 1000,
          receiptNumber: "RCP002",
          paymentMode: "Net Banking",
        },
      ] as PaymentHistoryItem[]);
      setErrorMessage("Could not connect to API. Showing mock data.");
      // --- End Mock Data ---
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetStudentId, isTeacher]);

  useEffect(() => {
    if (viewer && targetStudentId) {
      setLoading(true); // Only set loading true if we have a target ID
      fetchStudentData();
    }
  }, [viewer, targetStudentId, fetchStudentData]);

  // --- Handlers ---
  const handlePayNow = (fee: Fee) => {
    setSelectedFee(fee);
    setOpenPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    // This function runs when the payment modal successfully processes payment logic
    try {
      const newPaymentRecord = {
        id: Date.now(),
        date: paymentData.timestamp,
        feeTitle: selectedFee?.title,
        amount: paymentData.amount,
        studentFeeId: selectedFee?.id,
        studentId: targetStudentId,
        receiptNumber: paymentData.receiptNumber,
        paymentMode: paymentData.method,
        transactionId: paymentData.transactionId,
      };

      // 1. API Call to save payment
      await api.post(`/api/student/fees/pay`, newPaymentRecord);

      // 2. Update Local State:
      setFees((prevFees) =>
        prevFees.map((fee) => {
          if (fee.id === selectedFee?.id) {
            const newPaidAmount = fee.paidAmount + paymentData.amount;
            const newRemaining = fee.totalAmount - newPaidAmount;
            return {
              ...fee,
              paidAmount: newPaidAmount,
              remaining: newRemaining,
              status:
                newRemaining === 0
                  ? "paid"
                  : newPaidAmount > 0
                  ? "partial"
                  : "pending",
            };
          }
          return fee;
        })
      );

      setPaymentHistory((prevHistory) => [
        newPaymentRecord as PaymentHistoryItem,
        ...prevHistory,
      ]);

      setSuccessMessage(
        `Payment of ${formatCurrency(
          paymentData.amount
        )} successful! Receipt: ${paymentData.receiptNumber}`
      );

      return Promise.resolve(); // Indicate success to the modal
    } catch (error: any) {
      console.error("Error processing payment:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to update payment records. Please contact support.";
      setErrorMessage(msg);
      throw new Error(msg); // Re-throw to inform the modal
    }
  };

  const handleViewReceipt = (payment: PaymentHistoryItem) => {
    setSelectedReceipt(payment);
    setOpenReceiptModal(true);
  };

  const getTotalDue = () => {
    return fees.reduce((total, fee) => total + (fee?.remaining || 0), 0);
  };

  const getTotalPaid = () => {
    return fees.reduce((total, fee) => total + (fee?.paidAmount || 0), 0);
  };

  // --- UI Components ---
  const SummaryCard: React.FC<{
    icon: string;
    title: string;
    value: string;
    color: string;
    gradient: string;
  }> = ({ icon, title, value, color }) => (
    <Card
      style={[styles.summaryCard, { backgroundColor: "#ffffff" }]}
      elevation={4}
    >
      <View style={styles.summaryCardContent}>
        <View style={styles.summaryTitleRow}>
          <Icon name={icon} size={24} color={"#87CEEB"} />
          <Text
            variant="titleMedium"
            style={[styles.summaryTitleText, { color: "#0A0A0A" }]}
          >
            {title}
          </Text>
        </View>
        <Text
          variant="headlineMedium"
          style={[styles.summaryValueText, { color: "#87CEEB" }]}
        >
          {value}
        </Text>
      </View>
    </Card>
  );

  const PaymentRow: React.FC<{ payment: PaymentHistoryItem; theme: any }> = ({
    payment,
    theme,
  }) => (
    <View style={styles.historyRow}>
      <View style={styles.historyCell}>
        <Text variant="bodyMedium" style={{ color: "#0A0A0A" }}>
          {new Date(payment.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.historyCell}>
        <Text variant="bodyMedium" style={{ color: "#0A0A0A" }}>
          {payment.feeTitle || payment.feeName}
        </Text>
      </View>
      <View style={styles.historyCell}>
        <Text
          variant="bodyMedium"
          style={{ fontWeight: "bold", color: "#87CEEB" }}
        >
          {formatCurrency(payment.amount)}
        </Text>
      </View>
      <View style={[styles.historyCell, styles.historyActionsCell]}>
        <Chip
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#87CEEB",
          }}
          textStyle={{ color: "#87CEEB", fontSize: 12 }}
          mode="flat"
        >
          {payment.paymentMode || payment.paymentMethod || "N/A"}
        </Chip>
        <Button
          size={30}
          icon="download"
          mode="text"
          onPress={() => handleViewReceipt(payment)}
          textColor={"#87CEEB"}
        >
          Receipt
        </Button>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: "#ffffff" }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStudentData}
            colors={["#87CEEB"]}
            tintColor="#87CEEB"
          />
        }
      >
        {/* Student Header */}
        <Card
          style={[styles.mainCard, { backgroundColor: "#ffffff" }]}
          elevation={2}
        >
          <View style={styles.studentHeader}>
            <Avatar.Text
              size={70}
              label={studentInfo.firstName?.charAt(0) || "S"}
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#87CEEB",
              }}
              labelStyle={{ fontSize: 32, color: "#87CEEB" }}
            />
            <View style={styles.studentInfoText}>
              <Text variant="headlineMedium" style={{ color: "#0A0A0A" }}>
                💼 Fee Details
              </Text>
              <Text variant="titleMedium" style={{ color: "#0A0A0A" }}>
                {studentInfo.firstName} {studentInfo.lastName} (
                {studentInfo.className || "N/A"})
              </Text>
              <Text variant="bodySmall" style={{ color: "#0A0A0A" }}>
                School: {studentInfo.schoolName || "N/A"} | Roll No:{" "}
                {studentInfo.rollNo || "N/A"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Summary Cards (max 2 columns per row) */}
        <View style={styles.summaryGrid}>
          {(() => {
            const items = [
              {
                icon: "cash-multiple",
                title: "Total Due",
                value: formatCurrency(getTotalDue()),
              },
              {
                icon: "check-circle-outline",
                title: "Total Paid",
                value: formatCurrency(getTotalPaid()),
              },
              {
                icon: "receipt",
                title: "Total Payments",
                value: paymentHistory.length.toString(),
              },
            ];

            const rows: any[] = [];
            for (let i = 0; i < items.length; i += 2) {
              rows.push(items.slice(i, i + 2));
            }

            return rows.map((row, rIdx) => (
              <View key={rIdx} style={styles.summaryRow}>
                {row.map((it, idx) => (
                  <SummaryCard
                    key={idx}
                    icon={it.icon}
                    title={it.title}
                    value={it.value}
                    color={theme.colors.primary}
                    gradient={""}
                  />
                ))}
                {row.length === 1 && (
                  <View style={styles.summaryCardPlaceholder} />
                )}
              </View>
            ));
          })()}
        </View>

        {/* Fee Details Cards */}
        <Card
          style={[styles.mainCard, { backgroundColor: "#ffffff" }]}
          elevation={2}
        >
          <List.Section
            title="Fee Details"
            titleStyle={{ color: "#0A0A0A", fontWeight: "bold", fontSize: 18 }}
          >
            {fees.length > 0 ? (
              fees.map((fee) => (
                <FeeCard key={fee.id} fee={fee} onPayNow={handlePayNow} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text variant="bodyLarge" style={{ color: "#0A0A0A" }}>
                  No fees assigned at the moment.
                </Text>
              </View>
            )}
          </List.Section>
        </Card>

        {/* Payment History */}
        <Card
          style={[styles.mainCard, { backgroundColor: "#ffffff" }]}
          elevation={2}
        >
          <List.Section
            title="📜 Payment History"
            titleStyle={{ color: "#0A0A0A", fontWeight: "bold", fontSize: 18 }}
          >
            <View style={styles.historyTable}>
              <View
                style={[styles.historyHeader, { backgroundColor: "#ffffff" }]}
              >
                <Text
                  style={[
                    styles.historyCell,
                    styles.historyHeaderText,
                    { color: "#0A0A0A" },
                  ]}
                >
                  Date
                </Text>
                <Text
                  style={[
                    styles.historyCell,
                    styles.historyHeaderText,
                    { color: "#0A0A0A" },
                  ]}
                >
                  Fee Name
                </Text>
                <Text
                  style={[
                    styles.historyCell,
                    styles.historyHeaderText,
                    { color: "#0A0A0A" },
                  ]}
                >
                  Amount
                </Text>
                <Text
                  style={[
                    styles.historyCell,
                    styles.historyHeaderText,
                    styles.historyActionsCell,
                    { color: "#0A0A0A", flex: 1.5 },
                  ]}
                >
                  Actions
                </Text>
              </View>

              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    theme={theme}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text variant="bodyLarge" style={{ color: "#0A0A0A" }}>
                    No payment history found.
                  </Text>
                </View>
              )}
            </View>
          </List.Section>
        </Card>
      </ScrollView>

      {/* Modals and Snackbars */}
      <Portal>
        <PaymentModal
          open={openPaymentModal}
          onClose={() => setOpenPaymentModal(false)}
          fee={selectedFee}
          onPaymentSuccess={handlePaymentSuccess}
          maxAmount={selectedFee?.remaining || 0}
        />
        <FeeReceiptModal
          open={openReceiptModal}
          onClose={() => setOpenReceiptModal(false)}
          receipt={selectedReceipt}
          studentInfo={studentInfo}
        />

        <RNP_Snackbar
          visible={!!successMessage}
          onDismiss={() => setSuccessMessage("")}
          duration={6000}
          action={{
            label: "Close",
            onPress: () => setSuccessMessage(""),
          }}
          style={{ backgroundColor: "#ffffff", top: 0, zIndex: 100 }} // white background
        >
          <Text style={{ color: "#87CEEB" }}>{successMessage}</Text>
        </RNP_Snackbar>

        <RNP_Snackbar
          visible={!!errorMessage}
          onDismiss={() => setErrorMessage("")}
          duration={6000}
          action={{
            label: "Close",
            onPress: () => setErrorMessage(""),
          }}
          style={{ backgroundColor: "#ffffff", top: 0, zIndex: 100 }} // white background
        >
          <Text style={{ color: "#0A0A0A" }}>{errorMessage}</Text>
        </RNP_Snackbar>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  mainCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 15,
  },
  studentInfoText: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: 100,
    maxWidth: "48%", // Allows two per row
    borderRadius: 12,
    marginBottom: 0,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  summaryCardPlaceholder: {
    width: "48%",
  },
  summaryCardContent: {
    padding: 12,
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  summaryTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  summaryValueText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
    marginTop: 4,
  },
  emptyState: {
    textAlign: "center",
    padding: 20,
  },
  historyTable: {
    paddingHorizontal: 0, // Padding handled by Card content
    paddingBottom: 0,
  },
  historyHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginBottom: 5,
  },
  historyRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    alignItems: "center",
  },
  historyCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  historyHeaderText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  historyActionsCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1.5,
    gap: 4,
  },
});
