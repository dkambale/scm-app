import React, { useEffect, useState, useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Card,
  Text,
  Divider,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import HeaderBar from "../../../components/common/HeaderBar";
import api, { userDetails } from "../../../api";

const CertificateRow: React.FC<{ label: string; value?: any }> = ({
  label,
  value,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value ?? "-"}</Text>
  </View>
);

const StudentExamResult: React.FC<any> = ({ route }: any) => {
  const examId = route?.params?.id ?? route?.params?.examId;
  const [loading, setLoading] = useState(false);
  const [examStudents, setExamStudents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        const user = await userDetails.getUser();
        const studentId = user?.id;
        if (!studentId) {
          setExamStudents([]);
          return;
        }
        const res = await api.get(
          `/api/exams/getExamStudent/${examId}/${studentId}`
        );
        const data = res?.data || res?.data?.data || [];
        setExamStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load exam result", err);
        setExamStudents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

  const summary = useMemo(() => {
    if (!examStudents?.length) return null;
    let totalMax = 0;
    let totalObtained = 0;
    examStudents.forEach((es) => {
      totalMax += Number(es?.totalMarks || 0);
      totalObtained += Number(es?.marksObtained || 0);
    });
    const percentage =
      totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : "0.00";
    const overall = examStudents[0] || {};
    return {
      examName: overall.examName,
      studentName: overall.studentName,
      className: overall.className,
      divisionName: overall.divisionName,
      schoolName: overall.schoolName,
      totalMax,
      totalObtained,
      percentage,
    };
  }, [examStudents]);

  return (
    <View style={styles.container}>
      <HeaderBar title={summary?.examName || "Exam Result"} showCancel />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator
            animating={true}
            size={36}
            style={{ marginTop: 24 }}
          />
        ) : (
          <>
            <Card style={styles.card} elevation={3}>
              <Card.Content>
                <Text style={styles.certificateTitle}>
                  Examination Certificate
                </Text>
                <Divider style={{ marginVertical: 12 }} />
                {summary ? (
                  <>
                    <CertificateRow label="School" value={summary.schoolName} />
                    <CertificateRow
                      label="Student"
                      value={summary.studentName}
                    />
                    <CertificateRow label="Exam" value={summary.examName} />
                    <CertificateRow
                      label="Class / Division"
                      value={`${summary.className} / ${summary.divisionName}`}
                    />
                    <Divider style={{ marginVertical: 12 }} />
                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Total Marks</Text>
                        <Text style={styles.metricValue}>
                          {summary.totalObtained} / {summary.totalMax}
                        </Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Percentage</Text>
                        <Text style={styles.metricValue}>
                          {summary.percentage}%
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>No results available.</Text>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card} elevation={1}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Subject-wise Details</Text>
                <Divider style={{ marginVertical: 10 }} />
                {examStudents.map((row) => (
                  <Card
                    key={`${row.subjectId}-${row.id || Math.random()}`}
                    style={styles.subjectCardOuter}
                    mode="elevated"
                  >
                    <Card.Content>
                      <View style={styles.subjectInner}>
                        <Text style={styles.subjectNameDark}>
                          {row.subjectName}
                        </Text>
                        <View style={{ marginTop: 8 }}>
                          <View style={styles.subjectRow}>
                            <Text style={styles.subjectLabelDark}>Marks</Text>
                            <Text style={styles.subjectValueDark}>{`${
                              row.marksObtained ?? 0
                            } / ${row.totalMarks ?? 0}`}</Text>
                          </View>
                          <View style={styles.subjectRow}>
                            <Text style={styles.subjectLabelDark}>Grade</Text>
                            <Text style={styles.subjectValueDark}>
                              {row.grade ?? "-"}
                            </Text>
                          </View>
                          <View style={styles.subjectRow}>
                            <Text style={styles.subjectLabelDark}>Remarks</Text>
                            <Text style={styles.subjectValueDark}>
                              {row.remarks ?? "-"}
                            </Text>
                          </View>
                          {row.passed !== undefined && (
                            <Chip
                              style={{ marginTop: 8 }}
                              mode="flat"
                              textStyle={{ color: "#fff" }}
                              icon={row.passed ? "check" : "close"}
                            >
                              {row.passed ? "Passed" : "Failed"}
                            </Chip>
                          )}
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  scroll: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 16, backgroundColor: "#ffffff" },
  certificateTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { color: "#555", fontWeight: "600", width: "45%" },
  rowValue: { color: "#111", width: "55%", textAlign: "right" },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metricItem: { flex: 1, alignItems: "center" },
  metricLabel: { color: "#666" },
  metricValue: { fontSize: 18, fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#666", paddingVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  subjectCard: { marginBottom: 10 },
  subjectName: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  subjectCardOuter: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  subjectInner: {
    backgroundColor: "#0d0d0d",
    borderRadius: 10,
    padding: 12,
  },
  subjectNameDark: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  subjectLabelDark: { color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  subjectValueDark: { color: "#ffffff", fontWeight: "700" },
});

export default StudentExamResult;
