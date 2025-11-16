import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Button,
  TextInput,
  IconButton,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import HeaderBar from "../../../components/common/HeaderBar";
import api from "../../../utils/apiService";
import { userDetails } from "../../../utils/apiService";
// Import SCDSelector (native) safely like other RN screens do
import * as SCDModule from "../../../components/common/SCDSelector.native";
const SCDSelector =
  (((SCDModule as any).default || (SCDModule as any).SCDSelector) as any) ||
  null;
import { useTranslation } from "react-i18next";

const StudentCard = ({
  student,
  subjects,
  marks,
  onMarksChange,
  onOpenGrader,
  onSave,
}) => {
  return (
    <Card style={styles.studentCard} elevation={2}>
      <Card.Title
        title={student.studentName}
        subtitle={`Roll No: ${student.studentRollNo || "N"}, Student ID ${
          student.studentId
        }`}
        titleStyle={styles.studentTitle}
        subtitleStyle={styles.studentSubtitle}
      />

      <Card.Content>
        {subjects.map((sub) => (
          <View key={sub.subjectId} style={styles.row}>
            <Text style={styles.subjectLabel}>{sub.subjectName}</Text>
            <View style={styles.controls}>
              <TextInput
                mode="outlined"
                value={String(
                  marks[`${student.studentId}-${sub.subjectId}`] ?? ""
                )}
                onChangeText={(val) =>
                  onMarksChange(student.studentId, sub.subjectId, val)
                }
                keyboardType="numeric"
                style={styles.marksInput}
                placeholder={`/ ${sub.maxMarksSubject ?? ""}`}
              />
              <IconButton
                icon="eye"
                size={20}
                onPress={() => onOpenGrader(student, sub)}
              />
            </View>
          </View>
        ))}
      </Card.Content>
      <Card.Actions style={{ justifyContent: "flex-end" }}>
        <Button mode="contained" onPress={() => onSave(student.studentId)}>
          {"Save"}
        </Button>
      </Card.Actions>
    </Card>
  );
};

const TeacherExamView: React.FC = () => {
  const { t } = useTranslation("teacherView");
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
    ""
  );
  const [selectedSchoolName, setSelectedSchoolName] = useState<string | null>(
    ""
  );
  const [selectedClassName, setSelectedClassName] = useState<string | null>("");
  const [selectedDivisionName, setSelectedDivisionName] = useState<
    string | null
  >("");
  const [marks, setMarks] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [gradingItem, setGradingItem] = useState<any>(null);

  useEffect(() => {
    // Only load exams once the user has selected School, Class and Division
    if (!selectedSchoolId || !selectedClassId || !selectedDivisionId) {
      // clear exams until selection is made
      setExams([]);
      return;
    }

    const loadExams = async () => {
      setLoading(true);
      try {
        const accountId = await userDetails.getAccountId();
        if (!accountId) return;
        const payload: any = {
          page: 0,
          size: 1000,
          sortBy: "id",
          sortDir: "asc",
        };
        // include selected SCD in payload
        payload.schoolId = selectedSchoolId;
        payload.classId = selectedClassId;
        payload.divisionId = selectedDivisionId;
        const res = await api.post(`/api/exams/getAllBy/${accountId}`, payload);
        setExams(res.data?.content || []);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, [selectedSchoolId, selectedClassId, selectedDivisionId]);

  useEffect(() => {
    if (!selectedExamId) {
      setSubjects([]);
      setStudents([]);
      setMarks({});
      return;
    }

    const loadDetails = async () => {
      setLoadingStudents(true);
      try {
        const subjectsRes = await api.get(
          `/api/exams/getSubjectsForExam/${selectedExamId}`
        );
        const subs = subjectsRes.data || [];
        setSubjects(subs);

        const accountId = await userDetails.getAccountId();
        const studentPayload: any = {
          page: 0,
          size: 1000,
          sortBy: "id",
          sortDir: "asc",
        };
        if (selectedSchoolId) studentPayload.schoolId = selectedSchoolId;
        if (selectedClassId) studentPayload.classId = selectedClassId;
        if (selectedDivisionId) studentPayload.divisionId = selectedDivisionId;
        const studentsRes = await api.post(
          `/api/exams/getStudentForExam/${selectedExamId}/${accountId}`,
          studentPayload
        );
        const studentsData = studentsRes.data?.content || [];
        setStudents(studentsData);

        // initialize marks
        const init: any = {};
        studentsData.forEach((st) => {
          if (st.marks) {
            for (const sid in st.marks) {
              init[`${st.studentId}-${sid}`] = st.marks[sid];
            }
          }
        });
        setMarks(init);
      } catch (err) {
        console.error("Failed to load subjects/students", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadDetails();
  }, [selectedExamId, selectedSchoolId, selectedClassId, selectedDivisionId]);

  const handleMarksChange = (studentId, subjectId, value) => {
    setMarks((p) => ({ ...p, [`${studentId}-${subjectId}`]: value }));
  };

  const handleSaveMarks = async (studentId) => {
    try {
      const payloadMarks: any = {};
      subjects.forEach((s) => {
        const key = `${studentId}-${s.subjectId}`;
        if (marks[key] !== undefined && marks[key] !== "")
          payloadMarks[s.subjectId] = Number(marks[key]);
      });
      const savePayload: any = { studentId, marks: payloadMarks };
      if (selectedSchoolId) savePayload.schoolId = selectedSchoolId;
      if (selectedClassId) savePayload.classId = selectedClassId;
      if (selectedDivisionId) savePayload.divisionId = selectedDivisionId;
      await api.put(
        `/api/exams/updateExamStudentMarks/${selectedExamId}`,
        savePayload
      );
      // simple feedback
      console.log("Saved marks for", studentId);
    } catch (err) {
      console.error("Failed to save marks", err);
    }
  };

  const openGrader = (student, subject) => {
    setGradingItem({ student, subject });
  };

  const closeGrader = () => setGradingItem(null);

  // scdAdapter: provides a Formik-like interface expected by SCDSelector.native
  const scdAdapter = {
    values: {
      schoolId: selectedSchoolId,
      classId: selectedClassId,
      divisionId: selectedDivisionId,
      schoolName: selectedSchoolName,
      className: selectedClassName,
      divisionName: selectedDivisionName,
    },
    setFieldValue: (field: string, value: any, label?: string) => {
      if (field === "schoolId") {
        setSelectedSchoolId(value);
        if (label) setSelectedSchoolName(label);
      }
      if (field === "classId") {
        setSelectedClassId(value);
        if (label) setSelectedClassName(label);
      }
      if (field === "divisionId") {
        setSelectedDivisionId(value);
        if (label) setSelectedDivisionName(label);
      }
      if (field === "schoolName") setSelectedSchoolName(value);
      if (field === "className") setSelectedClassName(value);
      if (field === "divisionName") setSelectedDivisionName(value);
    },
  } as any;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      {/* <HeaderBar title={t("title") ||/ "Grade Exams"} /> */}
      {/* Use a VirtualizedList-backed parent (FlatList) to avoid nesting VirtualizedLists
          inside a plain ScrollView. The header contains the SCD selector and exam picker. */}
      <FlatList
        data={students}
        keyExtractor={(it) => String(it.studentId)}
        ListHeaderComponent={() => (
          <View style={styles.container}>
            {SCDSelector ? (
              <Card style={{ margin: 12, padding: 8, backgroundColor: "#fff" }}>
                <Card.Content>
                  <SCDSelector
                    formik={scdAdapter}
                    showSchool
                    showClass
                    showDivision
                  />
                </Card.Content>
              </Card>
            ) : null}

            {!selectedSchoolId || !selectedClassId || !selectedDivisionId ? (
              <Card
                style={[
                  styles.filterCard,
                  { alignItems: "center", justifyContent: "center" },
                ]}
              >
                <Card.Content>
                  <Text style={styles.noticeText}>
                    {t("teacherView.selectSCD") ||
                      "Please select School, Class and Division to load exams"}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.filterCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>
                    {t("teacherView.selectExam") || "Select Exam"}
                  </Text>
                  <FlatList
                    data={exams}
                    horizontal
                    keyExtractor={(it) => String(it.id)}
                    renderItem={({ item }) => (
                      <Button
                        mode={
                          String(item.id) === String(selectedExamId)
                            ? "contained"
                            : "outlined"
                        }
                        onPress={() => setSelectedExamId(item.id)}
                        style={{ marginRight: 8 }}
                      >
                        {item.examName}
                      </Button>
                    )}
                  />
                </Card.Content>
              </Card>
            )}

            <Divider style={{ marginVertical: 8 }} />
            {loadingStudents && <ActivityIndicator animating />}
          </View>
        )}
        renderItem={({ item }) => (
          <StudentCard
            student={item}
            subjects={subjects}
            marks={marks}
            onMarksChange={handleMarksChange}
            onOpenGrader={openGrader}
            onSave={(sid) => handleSaveMarks(sid)}
          />
        )}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        ListEmptyComponent={() =>
          !loadingStudents &&
          (!selectedSchoolId ||
            !selectedClassId ||
            !selectedDivisionId) ? null : (
            <View style={{ padding: 12 }}>
              <Text style={styles.noStudentsText}>
                {t("teacherView.noStudents") || "No students found"}
              </Text>
            </View>
          )
        }
      />

      {/* Grader modal/screen simplified */}
      {gradingItem && (
        <Card style={styles.graderCard}>
          <Card.Title
            title={`${gradingItem.student.studentName} - ${gradingItem.subject.subjectName}`}
            titleStyle={styles.graderTitle}
            left={() => <IconButton icon="arrow-left" onPress={closeGrader} />}
          />
          <Card.Content>
            <Text variant="bodyLarge" style={styles.graderText}>
              {t("teacherView.question") || "Question"}:{" "}
              {gradingItem.subject.question || "—"}
            </Text>
            <Text style={[{ marginTop: 8 }, styles.graderText]}>
              {t("teacherView.studentAnswer") || "Student Answer"}:{" "}
              {gradingItem.student.answer || "—"}
            </Text>
            <TextInput
              label="Marks"
              mode="outlined"
              keyboardType="numeric"
              value={String(
                marks[
                  `${gradingItem.student.studentId}-${gradingItem.subject.subjectId}`
                ] ?? ""
              )}
              onChangeText={(v) =>
                handleMarksChange(
                  gradingItem.student.studentId,
                  gradingItem.subject.subjectId,
                  v
                )
              }
              style={{ marginTop: 12 }}
            />
            <Button
              mode="contained"
              style={{ marginTop: 12 }}
              onPress={() => {
                handleSaveMarks(gradingItem.student.studentId);
                closeGrader();
              }}
            >
              Save
            </Button>
          </Card.Content>
        </Card>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterCard: { margin: 12, padding: 8, backgroundColor: "#fff" },
  studentCard: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  marksInput: { width: 110, marginRight: 8 },
  graderCard: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 80,
    zIndex: 40,
    elevation: 12,
  },
  studentTitle: {
    color: "#0b2b55",
    fontWeight: "800",
    fontSize: 16,
  },
  studentSubtitle: {
    color: "#333",
    fontSize: 13,
  },
  subjectLabel: { flex: 1, fontWeight: "700", color: "#0b2b55", fontSize: 15 },
  noticeText: { color: "#0b2b55", fontWeight: "700", textAlign: "center" },
  sectionTitle: { marginBottom: 8, color: "#0b2b55", fontWeight: "700" },
  noStudentsText: { color: "#333", fontSize: 15, textAlign: "center" },
  graderTitle: { color: "#0b2b55", fontWeight: "800" },
  graderText: { color: "#111" },
});

export default TeacherExamView;
