import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator as RNActivityIndicator, // Use RN built-in for loading state
} from "react-native";
import {
  Button,
  Text,
  TextInput,
  List,
  Chip,
  Snackbar,
  Card,
  Avatar,
  Title,
} from "react-native-paper";
import { apiService } from "../../../api/apiService"; // Assuming correct path
import { storage } from "../../../utils/storage"; // Assuming correct path
import { useAuth } from "../../../context/AuthContext"; // Assuming correct path
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useSCDData } from "../../../context/SCDProvider";

// --- FIXED IMPORT ---
// We import the entire module as 'SCDModule' and conditionally pull the component from its exports.
import * as SCDModule from "../../../components/common/SCDSelector.native";
// Determine the actual component function from the imported module (Handles both default and named exports)
// try to resolve default or named export; fall back to null component to avoid runtime crash
const SCDSelector =
  (((SCDModule as any).default || (SCDModule as any).SCDSelector) as any) ||
  null;

// --- COLOR PALETTE ---
const ACCENT_BLUE = "#00BFFF"; // Sky Blue
const DARK_BLUE = "#1E90FF"; // Dodger Blue
const BG_WHITE = "#FFFFFF";
const SHADOW_COLOR = "#000000";

// --- TYPES ---
type AttendanceRequest = {
  schoolId: string | null;
  classId: string | null;
  divisionId: string | null;
  subjectId: string | null;
  date: string | null; // YYYY-MM-DD
  schoolName: string;
  className: string;
  divisionName: string;
  subjectName: string;
};

type StudentMapping = {
  id: string; // Used for unique key
  studentId: string;
  studentName: string;
  studentRollNo: string;
  vailable: boolean; // True for Present, False for Absent
  attendanceId?: string;
};

// --- MAIN COMPONENT ---
export const AttendanceEdit: React.FC = () => {
  const { t } = useTranslation("edit");
  const { user } = useAuth(); // Assuming useAuth provides a user object
  const { schools = [], classes = [], divisions = [] } = useSCDData() || {};
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string | null }) || {};

  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentMapping[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null); // Full attendance record if editing
  const [loading, setLoading] = useState(false); // Local loading for all fetches
  const [reqData, setReqData] = useState<AttendanceRequest>({
    schoolId: null,
    classId: null,
    divisionId: null,
    subjectId: null,
    date: dayjs().format("YYYY-MM-DD"), // Default to today's date
    schoolName: "",
    className: "",
    divisionName: "",
    subjectName: "",
  });

  // UI State
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // --- Data Fetching (Logic remains the same, focuses on presentation/typing) ---

  // 1. Fetch Subjects
  useEffect(() => {
    const loadSubjects = async () => {
      // setLoading(true); // Don't set loading yet, let it be controlled by the main loading block
      try {
        const authData = await storage
          .getItem("SCM-AUTH")
          .then((raw) => (raw ? JSON.parse(raw) : null));
        const accountId = authData?.data?.accountId;

        if (accountId) {
          // @ts-ignore - Assuming getSubjects implementation in apiService
          const res = await apiService.getSubjects(accountId);
          setSubjects(res || []);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        showToast(
          t("attendance.messages.subjectFetchFailed") ||
            "Failed to load subjects."
        );
      }
      // setLoading(false);
    };
    loadSubjects();
  }, [t]);

  // 2. Fetch Existing Attendance Data if Editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      // @ts-ignore - Assuming getAttendanceById implementation in apiService
      apiService
        .getAttendanceById(id)
        .then((data: any) => {
          setAttendanceData(data);
          setReqData({
            schoolId: String(data.schoolId) || null,
            classId: String(data.classId) || null,
            divisionId: String(data.divisionId) || null,
            subjectId: String(data.subjectId) || null,
            date: dayjs(data.attendanceDate).format("YYYY-MM-DD"),
            schoolName: data.schoolName || "",
            className: data.className || "",
            subjectName: data.subjectName || "",
            divisionName: data.divisionName || "",
          });

          const mappedStudents: any[] = (
            data.studentAttendanceMappings || []
          ).map((s: any) => ({
            // Preserve original mapping id as mappingId, keep studentId separate
            mappingId: s.id ?? null,
            studentId: s.studentId ?? s.studentId ?? null,
            studentName:
              s.studentName ??
              `${s.firstName || ""} ${s.lastName || ""}`.trim(),
            vailable: s.vailable === undefined ? true : !!s.vailable,
            // keep raw fields for flexibility
            ...s,
          }));
          setStudents(mappedStudents as any[]);
        })
        .catch((err) => {
          console.error("Failed to fetch attendance data:", err);
          showToast(
            t("attendance.messages.fetchFailed") ||
              "Failed to load attendance record."
          );
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, t]);

  // 3. Fetch Students/Attendance based on Selection
  useEffect(() => {
    const { classId, divisionId, subjectId, date } = reqData;

    const isReadyForFetch = classId && divisionId && subjectId && date;
    const isEditMode = !!id;

    let shouldFetch = false;

    if (isReadyForFetch) {
      if (!isEditMode) {
        shouldFetch = true;
      } else if (attendanceData) {
        const loadedDate = dayjs(attendanceData?.attendanceDate).format(
          "YYYY-MM-DD"
        );

        if (
          classId !== String(attendanceData?.classId) ||
          divisionId !== String(attendanceData?.divisionId) ||
          subjectId !== String(attendanceData?.subjectId) ||
          date !== loadedDate
        ) {
          shouldFetch = true;
        }
      }
    }

    if (shouldFetch) {
      // Call the backend attendance endpoint directly with the accountId and query params
      (async () => {
        setLoading(true);
        try {
          const authData = await storage
            .getItem("SCM-AUTH")
            .then((raw) => (raw ? JSON.parse(raw) : null));
          const accountId = authData?.data?.accountId;
          if (!accountId) return;
          const resp = await apiService.getAttendanceBy(accountId, {
            classId: classId as string,
            divisionId: divisionId as string,
            subjectId: subjectId as string,
            date: date as string,
          });
          const newStudents: any[] = (
            resp?.studentAttendanceMappings || []
          ).map((s: any) => {
            const first = s.firstName || s.first_name || "";
            const last = s.lastName || s.last_name || "";
            const nameFromParts = [first, last].filter(Boolean).join(" ");
            const resolvedName =
              s.studentName ||
              s.name ||
              s.fullName ||
              s.displayName ||
              nameFromParts ||
              `Student ${s.studentId || s.id || ""}`;
            return {
              mappingId: s.id ?? null,
              studentId: s.studentId ?? null,
              studentName: resolvedName,
              vailable: s.vailable === undefined ? true : !!s.vailable,
              ...s,
            };
          });
          setStudents(newStudents as any[]);
        } catch (err) {
          console.error("Failed to fetch attendance data:", err);
          showToast(
            t("attendance.messages.fetchFailed") ||
              "Failed to fetch student list."
          );
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [
    reqData.classId,
    reqData.divisionId,
    reqData.subjectId,
    reqData.date,
    id,
    attendanceData,
    t,
    reqData,
  ]);

  // fetchAttendance removed; inline calls use apiService.getAttendanceBy directly

  // --- Handlers ---

  const scdAdapter = {
    values: {
      schoolId: reqData.schoolId,
      classId: reqData.classId,
      divisionId: reqData.divisionId,
      schoolName: reqData.schoolName,
      className: reqData.className,
      divisionName: reqData.divisionName,
    },
    // @ts-ignore - Allowing for flexible value type here
    setFieldValue: (field: string, value: any, label?: string) => {
      setReqData((prev) => {
        const newState = { ...prev, [field]: value };
        if (field === "schoolId") newState.schoolName = label || "";
        if (field === "classId") newState.className = label || "";
        if (field === "divisionId") newState.divisionName = label || "";
        return newState;
      });
    },
    // Required but unused Formik props for SCDSelector in RN implementation
    touched: {},
    errors: {},
  };

  const handleToggle = (index: number) => {
    setStudents((prevStudents) =>
      prevStudents.map((student, idx) =>
        idx === index ? { ...student, vailable: !student.vailable } : student
      )
    );
  };

  const handleDatePickerChange = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setReqData((prev) => ({
        ...prev,
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
      }));
    }
  };

  const onHandleClickSubmit = async () => {
    if (
      !reqData.schoolId ||
      !reqData.classId ||
      !reqData.divisionId ||
      !reqData.subjectId ||
      !reqData.date
    ) {
      showToast(
        t("common.fillAllFields") ||
          "Please select School, Class, Division, Subject, and Date."
      );
      return;
    }

    setLoading(true);

    const { subjectId, date } = reqData;

    try {
      const authData = await storage
        .getItem("SCM-AUTH")
        .then((raw) => (raw ? JSON.parse(raw) : null));
      const accountId = authData?.data?.accountId;

      if (!accountId) {
        setLoading(false);
        showToast("Account information missing. Please login again.");
        return;
      }

      // Reconcile ids and names: if a name is present but id is missing (or vice-versa),
      // try to infer the missing value from SCD lists so backend gets both.
      const reconcile = () => {
        let schoolId = reqData.schoolId;
        let schoolName = reqData.schoolName;
        let classId = reqData.classId;
        let className = reqData.className;
        let divisionId = reqData.divisionId;
        let divisionName = reqData.divisionName;

        // schools
        if ((!schoolId || String(schoolId).trim() === "") && schoolName) {
          const found = (schools || []).find(
            (s: any) =>
              (s.name || s.branchName || s.schoolName || "") === schoolName
          );
          if (found)
            schoolId = String(
              found.id ?? found.schoolbranchId ?? found.schoolId ?? ""
            );
        }
        if ((!schoolName || String(schoolName).trim() === "") && schoolId) {
          const found = (schools || []).find(
            (s: any) => String(s.id) === String(schoolId)
          );
          if (found)
            schoolName =
              found.name || found.branchName || found.schoolName || "";
        }

        // classes
        if ((!classId || String(classId).trim() === "") && className) {
          const found = (classes || []).find(
            (c: any) =>
              (c.name || c.className || c.schoolClassName || "") === className
          );
          if (found)
            classId = String(
              found.id ?? found.schoolClassId ?? found.classId ?? ""
            );
        }
        if ((!className || String(className).trim() === "") && classId) {
          const found = (classes || []).find(
            (c: any) =>
              String(c.id ?? c.schoolClassId ?? c.classId) === String(classId)
          );
          if (found)
            className =
              found.name || found.className || found.schoolClassName || "";
        }

        // divisions
        if ((!divisionId || String(divisionId).trim() === "") && divisionName) {
          const found = (divisions || []).find(
            (d: any) => (d.name || d.divisionName || "") === divisionName
          );
          if (found) divisionId = String(found.id ?? found.divisionId ?? "");
        }
        if (
          (!divisionName || String(divisionName).trim() === "") &&
          divisionId
        ) {
          const found = (divisions || []).find(
            (d: any) => String(d.id ?? d.divisionId) === String(divisionId)
          );
          if (found) divisionName = found.name || found.divisionName || "";
        }

        return {
          schoolId,
          schoolName,
          classId,
          className,
          divisionId,
          divisionName,
        };
      };

      const reconciled = reconcile();

      const payload = {
        // Use full ISO timestamp the backend expects
        attendanceDate: dayjs(date).toISOString(),
        studentAttendanceMappings: students.map((s) => {
          const sx: any = s as any;
          const studentId = Number(sx.studentId ?? sx.id ?? null) || null;
          const studentName =
            sx.studentName ?? sx.name ?? sx.fullName ?? sx.displayName ?? "";
          const studentRollNo = sx.studentRollNo ?? sx.rollNo ?? null;
          const attendanceIdForMapping =
            sx.attendanceId ?? attendanceData?.id ?? null;
          return {
            // mapping record id (if present when editing)
            studentId,
            studentName,
            studentRollNo,
            accountId: Number(accountId) || null,
            attendanceId: attendanceIdForMapping,
            vailable: !!sx.vailable,
          };
        }),

        schoolId: reconciled.schoolId ?? null,
        classId: reconciled.classId ?? null,
        divisionId: reconciled.divisionId ?? null,
        schoolName: reconciled.schoolName,
        className: reconciled.className,
        divisionName: reconciled.divisionName,
        teacherId: user?.id,
        subjectId: Number(subjectId) || null,

        accountId,
        id: attendanceData?.id || null,
      };

      try {
        // TEMP LOG: print payload to help debug 500 from backend
        console.debug(
          "[attendance] outgoing payload:",
          JSON.parse(JSON.stringify(payload))
        );

        // @ts-ignore - apiService.saveAttendance may be implemented differently; adjust as needed
        const res = await apiService.saveAttendance(payload);
        showToast(
          res?.message ||
            t("attendance.messages.saveSuccess") ||
            "Attendance saved successfully."
        );
        navigation.goBack();
      } catch (err: any) {
        // Improved error diagnostics
        try {
          const resp = err?.response;
          console.error(
            "Failed to save attendance: status=",
            resp?.status,
            "data=",
            resp?.data || err?.message || err
          );
          showToast(
            (resp?.data &&
              (resp?.data?.message || JSON.stringify(resp?.data))) ||
              err?.message ||
              t("attendance.messages.saveFailed") ||
              "Failed to save attendance."
          );
        } catch (logErr) {
          console.error("Error logging save failure", logErr);
          showToast(
            t("attendance.messages.saveFailed") || "Failed to save attendance."
          );
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error preparing/saving attendance:", err);
      showToast(
        t("attendance.messages.saveFailed") || "Failed to save attendance."
      );
      setLoading(false);
    }
  };

  const TitleText = id ? t("attendance.title.edit") : t("attendance.title.add");
  const listTitle = reqData.className
    ? `${reqData.className} - ${reqData.divisionName} - ${reqData.subjectName}`
    : t("attendance.messages.selectPlaceholder") ||
      "Select criteria above to load students";

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Title style={styles.headerTitle}>{TitleText}</Title>

        {/* Selection Criteria Card */}
        <Card style={styles.card}>
          <Card.Title
            title={t("attendance.selectionCriteria") || "Attendance Criteria"}
            titleStyle={styles.cardTitle}
            left={(props) => (
              <List.Icon {...props} icon="filter-variant" color={DARK_BLUE} />
            )}
          />
          <Card.Content>
            {/* School / Class / Division Selector */}
            {SCDSelector && (
              <SCDSelector
                // @ts-ignore
                formik={scdAdapter}
              />
            )}

            {/* Subject Select (Using List.Accordion for dropdown simulation) */}
            <View style={styles.selectorWrapper}>
              <List.Section style={styles.subjectSelectorSection}>
                <List.Accordion
                  title={
                    subjects.find(
                      (s) => String(s.id) === String(reqData.subjectId)
                    )?.name || "Select Subject"
                  }
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="book-open-variant"
                      color={ACCENT_BLUE}
                    />
                  )}
                  expanded={showSubjectModal}
                  onPress={() => setShowSubjectModal((prev) => !prev)}
                  style={styles.accordion}
                  titleStyle={{ color: reqData.subjectId ? DARK_BLUE : "#999" }}
                >
                  <ScrollView style={styles.subjectScroll}>
                    {subjects.map((s) => (
                      <List.Item
                        key={s.id}
                        title={s.name}
                        onPress={() => {
                          setReqData((f) => ({
                            ...f,
                            subjectId: String(s.id),
                            subjectName: s.name,
                          }));
                          setShowSubjectModal(false);
                        }}
                        right={() =>
                          String(reqData.subjectId) === String(s.id) ? (
                            <List.Icon icon="check" color={ACCENT_BLUE} />
                          ) : null
                        }
                      />
                    ))}
                  </ScrollView>
                </List.Accordion>
              </List.Section>
            </View>

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.pickerTouch}
              disabled={loading}
            >
              <TextInput
                label={t("attendance.fields.date") || "Date *"}
                value={reqData.date || dayjs().format("YYYY-MM-DD")}
                editable={false}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => setShowDatePicker(true)}
                    color={DARK_BLUE}
                  />
                }
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: ACCENT_BLUE } }}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={
                  reqData.date ? dayjs(reqData.date).toDate() : dayjs().toDate()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDatePickerChange}
                maximumDate={dayjs().toDate()} // Attendance can't be future date
              />
            )}
          </Card.Content>
        </Card>

        {/* Student Attendance List Card */}
        <Card style={[styles.card, { opacity: loading ? 0.6 : 1 }]}>
          <Card.Title
            title={listTitle}
            titleStyle={styles.cardTitle}
            left={(props) => (
              <List.Icon {...props} icon="account-group" color={DARK_BLUE} />
            )}
          />
          <Card.Content>
            {loading && students.length === 0 ? (
              <RNActivityIndicator
                size="large"
                color={ACCENT_BLUE}
                style={styles.loadingStudents}
              />
            ) : students.length === 0 ? (
              <Text style={styles.emptyText}>
                {reqData.classId
                  ? t("attendance.messages.noStudents") ||
                    "No students found for the selected criteria."
                  : t("attendance.messages.selectPlaceholder") ||
                    "Select criteria above to load students"}
              </Text>
            ) : (
              <View style={styles.studentListContainer}>
                {students.map((student, index) => (
                  <TouchableOpacity
                    key={student.studentId || student.id}
                    onPress={() => handleToggle(index)}
                    style={[
                      styles.studentItem,
                      {
                        backgroundColor: student.vailable
                          ? "#E0F7FA" // Light Sky Blue
                          : "#FFEBEA", // Light Coral Red
                        borderColor: student.vailable ? ACCENT_BLUE : "#F44336", // Blue/Red Border
                      },
                    ]}
                  >
                    <Avatar.Text
                      size={40}
                      style={{
                        backgroundColor: student.vailable
                          ? ACCENT_BLUE // Blue Avatar
                          : "#F44336", // Red Avatar
                      }}
                      label={
                        student.studentName
                          ? student.studentName.charAt(0).toUpperCase()
                          : "S"
                      }
                      color={BG_WHITE}
                    />
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentNameText} numberOfLines={1}>
                        {student.studentName}
                      </Text>
                      <Text style={styles.studentRollNoText}>
                        Roll No: {student.studentRollNo}
                      </Text>
                    </View>
                    <Chip
                      icon={student.vailable ? "check-circle" : "close-circle"}
                      style={{
                        backgroundColor: student.vailable
                          ? "#4CAF50" // Success Green
                          : "#F44336", // Error Red
                      }}
                      textStyle={{ color: BG_WHITE, fontWeight: "bold" }}
                    >
                      {student.vailable
                        ? t("common.present") || "Present"
                        : t("common.absent") || "Absent"}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Submit Button */}
        {students.length > 0 && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              labelStyle={{ color: DARK_BLUE }}
              style={styles.cancelButton}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              mode="contained"
              onPress={onHandleClickSubmit}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              buttonColor={ACCENT_BLUE}
            >
              {id
                ? t("common.update") || "Update Attendance"
                : t("common.save") || "Save Attendance"}
            </Button>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Close",
          onPress: () => setSnackbarVisible(false),
          labelStyle: { color: ACCENT_BLUE },
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#F0F8FF", // Very light blue tint background
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: DARK_BLUE,
  },
  headerTitle: {
    marginBottom: 20,
    fontWeight: "800",
    color: DARK_BLUE,
    textAlign: "center",
    fontSize: 26,
  },
  card: {
    marginBottom: 20,
    elevation: 6,
    borderRadius: 12,
    backgroundColor: BG_WHITE,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_BLUE,
  },
  input: {
    backgroundColor: BG_WHITE,
    borderRadius: 8,
    // Adjust top margin to compensate for default Paper TextInput padding/margin
  },
  pickerTouch: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 16,
  },
  cancelButton: {
    borderColor: DARK_BLUE,
    minWidth: 120,
    borderRadius: 8,
  },
  saveButton: {
    minWidth: 160,
    borderRadius: 8,
    elevation: 4,
    // buttonColor set directly in component
  },
  // Selector and Subject List styles
  selectorWrapper: {
    marginBottom: 16,
  },
  subjectSelectorSection: {
    borderWidth: 1,
    borderColor: "#E0F0FF",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: BG_WHITE,
  },
  accordion: {
    backgroundColor: BG_WHITE,
    paddingHorizontal: 0,
  },
  subjectScroll: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  // Student List Styles
  studentListContainer: {
    flexDirection: "column",
    gap: 12,
    paddingTop: 10,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 2,
    justifyContent: "space-between",
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  studentNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333", // Dark text
  },
  studentRollNoText: {
    fontSize: 13,
    color: "#666", // Lighter text
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 30,
    fontSize: 16,
    fontStyle: "italic",
  },
  snackbar: {
    backgroundColor: "#333",
    borderRadius: 8,
  },
  loadingStudents: {
    paddingVertical: 40,
  },
});

export default AttendanceEdit;
