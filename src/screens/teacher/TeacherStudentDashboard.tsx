import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  Chip,
  Avatar,
  ProgressBar,
  Button,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useSCDData } from "../../context/SCDProvider";
import api from "../../api";
import { userDetails } from "../../utils/apiService";
import MainLayout from "../../layout/MainLayout";

type Student = {
  id: string | number;
  firstName?: string;
  lastName?: string;
  rollNumber?: string;
  classId?: string | number;
  divisionId?: string | number;
  todayAttendance?: string;
  attendancePercentage?: number;
  presentDays?: number;
  absentDays?: number;
  averageGrade?: number;
  subjectGrades?: Array<{ name: string; grade: number }>;
  profileImage?: string | null;
};

const TeacherStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { classes = [], divisions = [] } = useSCDData() || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | number | null>(
    null
  );
  const [selectedDivision, setSelectedDivision] = useState<
    string | number | null
  >(null);
  const [tabValue, setTabValue] = useState(0);

  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [teacherDivisions, setTeacherDivisions] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    // derive allocated classes/divisions for teacher
    const allocated = user.allocatedClasses || [];
    const classIds = Array.from(
      new Set(allocated.map((ac: any) => ac.classId).filter(Boolean))
    );
    const divisionIds = Array.from(
      new Set(allocated.map((ac: any) => ac.divisionId).filter(Boolean))
    );

    const matchedClasses = (classes || []).filter((c: any) =>
      classIds.includes(c.id)
    );
    const matchedDivisions = (divisions || []).filter((d: any) =>
      divisionIds.includes(d.id)
    );

    setTeacherClasses(matchedClasses);
    setTeacherDivisions(matchedDivisions);

    if (matchedClasses.length > 0) setSelectedClass(matchedClasses[0].id);
    if (matchedDivisions.length > 0)
      setSelectedDivision(matchedDivisions[0].id);
  }, [user, classes, divisions]);

  useEffect(() => {
    if (selectedClass && selectedDivision && user?.id) {
      fetchStudentsDashboard();
    }
  }, [selectedClass, selectedDivision, user?.id]);

  const augmentStudentsWithDetails = async (
    students: any[],
    accountId: string | number
  ) => {
    const enriched = await Promise.all(
      students.map(async (stu: any) => {
        try {
          const [presentRes, attRes, avgRes, subjectsRes] = await Promise.all([
            api.get("/api/teacher-dashboard/student/today-status", {
              params: {
                accountId,
                classId: selectedClass,
                divisionId: selectedDivision,
                studentId: stu.id,
              },
            }),
            api.get("/api/teacher-dashboard/student/attendance-summary", {
              params: { accountId, studentId: stu.id },
            }),
            api.get("/api/teacher-dashboard/student/average-grade", {
              params: { studentId: stu.id },
            }),
            api.get("/api/teacher-dashboard/student/subject-scores", {
              params: { studentId: stu.id },
            }),
          ]);

          const todayAttendance = presentRes?.data?.present
            ? "PRESENT"
            : "ABSENT";
          const attendancePercentage = Math.round(
            attRes?.data?.percentage ?? 0
          );
          const presentDays = attRes?.data?.present ?? 0;
          const absentDays = attRes?.data?.absent ?? 0;
          const averageGrade = Math.round(avgRes?.data?.average ?? 0);
          const subjectGrades = Array.isArray(subjectsRes?.data)
            ? subjectsRes.data.map((s: any) => ({
                name: s.subject,
                grade: Math.round(s.percentage),
              }))
            : [];

          return {
            ...stu,
            todayAttendance,
            attendancePercentage,
            presentDays,
            absentDays,
            averageGrade,
            subjectGrades,
          } as Student;
        } catch (e) {
          return {
            ...stu,
            todayAttendance: "ABSENT",
            attendancePercentage: 0,
            presentDays: 0,
            absentDays: 0,
            averageGrade: 0,
            subjectGrades: [],
          } as Student;
        }
      })
    );
    return enriched;
  };

  const fetchStudentsDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const accountId = await userDetails.getAccountId();
      const schoolId = user?.schoolId;
      if (!accountId || !schoolId)
        throw new Error("Missing account or school context");

      const paramsCommon = {
        accountId,
        schoolId,
        classId: selectedClass,
        divisionId: selectedDivision,
      };

      const [totalRes, attendanceRes, avgRes, pendingRes, studentsRes] =
        await Promise.all([
          api.get("/api/teacher-dashboard/total-students", {
            params: paramsCommon,
          }),
          api.get("/api/teacher-dashboard/today-attendance-percent", {
            params: {
              accountId,
              classId: selectedClass,
              divisionId: selectedDivision,
            },
          }),
          api.get("/api/teacher-dashboard/class-average-grade", {
            params: { accountId, schoolId, classId: selectedClass },
          }),
          api.get("/api/teacher-dashboard/pending-assignments-count", {
            params: paramsCommon,
          }),
          api.get("/api/teacher-dashboard/students", { params: paramsCommon }),
        ]);

      const rawStudents = Array.isArray(studentsRes?.data)
        ? studentsRes.data
        : [];
      const baseStudents = rawStudents.map((s: any) => {
        const [firstName = "", ...rest] = (s.name || "").split(" ");
        return {
          id: s.id,
          firstName,
          lastName: rest.join(" "),
          rollNumber:
            s.rollNo != null ? `R${String(s.rollNo).padStart(3, "0")}` : "N/A",
          classId: selectedClass,
          divisionId: selectedDivision,
          profileImage: null,
        } as Student;
      });

      const detailedStudents = await augmentStudentsWithDetails(
        baseStudents,
        accountId
      );
      setStudentsData(detailedStudents);

      const totalStudents =
        totalRes?.data?.count ?? detailedStudents.length ?? 0;
      const averageGrade =
        Math.round(((avgRes?.data?.average ?? 0) + Number.EPSILON) * 10) / 10;
      const attendancePercentage = Math.round(
        attendanceRes?.data?.percentage ?? 0
      );
      const pendingAssignments = pendingRes?.data?.count ?? 0;

      setDashboardStats({
        totalStudents,
        presentToday: attendanceRes?.data?.present ?? 0,
        attendancePercentage,
        averageGrade,
        pendingAssignments,
      });
    } catch (err: any) {
      console.error("Error fetching students dashboard:", err);
      setError("Failed to load students data");
      setStudentsData([]);
      setDashboardStats({});
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!selectedClass || !selectedDivision) return [];
    return studentsData.filter(
      (s) =>
        String(s.classId) === String(selectedClass) &&
        String(s.divisionId) === String(selectedDivision)
    );
  }, [studentsData, selectedClass, selectedDivision]);

  if (!user?.allocatedClasses || user.allocatedClasses.length === 0) {
    return (
      <MainLayout title={"Students"} onBack={() => {}}>
        <Card style={styles.card}>
          <Card.Content>
            <Text>No allocated classes for the current user.</Text>
          </Card.Content>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Class - ${selectedClass ?? ""}`} onBack={() => {}}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* Selectors */}
        <View style={styles.selectorRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Class</Text>
            <View style={styles.selectorBox}>
              {teacherClasses.map((c) => (
                <Button
                  key={c.id}
                  mode={
                    String(selectedClass) === String(c.id)
                      ? "contained"
                      : "outlined"
                  }
                  onPress={() => {
                    setSelectedClass(c.id);
                    setTabValue(0);
                  }}
                  style={{ marginRight: 8 }}
                >
                  {c.name}
                </Button>
              ))}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Division</Text>
            <View style={styles.selectorBox}>
              {teacherDivisions.map((d) => (
                <Button
                  key={d.id}
                  mode={
                    String(selectedDivision) === String(d.id)
                      ? "contained"
                      : "outlined"
                  }
                  onPress={() => {
                    setSelectedDivision(d.id);
                    setTabValue(0);
                  }}
                  style={{ marginRight: 8 }}
                >
                  {d.name}
                </Button>
              ))}
            </View>
          </View>
        </View>

        {loading && <ActivityIndicator style={{ marginVertical: 24 }} />}
        {error && <Text style={{ color: "red" }}>{error}</Text>}

        {/* Stats */}
        {!loading && !error && (
          <View>
            <View style={styles.statsRow}>
              <Card style={[styles.statCard, { backgroundColor: "#e6f4ff" }]}>
                <Card.Content>
                  <Text style={styles.statNumber}>
                    {dashboardStats.totalStudents ?? 0}
                  </Text>
                  <Text>Total Students</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: "#e8f7ec" }]}>
                <Card.Content>
                  <Text style={styles.statNumber}>
                    {dashboardStats.attendancePercentage ?? 0}%
                  </Text>
                  <Text>Attendance</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: "#eef6ff" }]}>
                <Card.Content>
                  <Text style={styles.statNumber}>
                    {dashboardStats.averageGrade ?? 0}
                  </Text>
                  <Text>Average Grade</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: "#fff7e6" }]}>
                <Card.Content>
                  <Text style={styles.statNumber}>
                    {dashboardStats.pendingAssignments ?? 0}
                  </Text>
                  <Text>Pending</Text>
                </Card.Content>
              </Card>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              <Button
                mode={tabValue === 0 ? "contained" : "outlined"}
                onPress={() => setTabValue(0)}
              >
                Students
              </Button>
              <Button
                mode={tabValue === 1 ? "contained" : "outlined"}
                onPress={() => setTabValue(1)}
                style={{ marginLeft: 8 }}
              >
                Performance
              </Button>
              <Button
                mode={tabValue === 2 ? "contained" : "outlined"}
                onPress={() => setTabValue(2)}
                style={{ marginLeft: 8 }}
              >
                Attendance
              </Button>
            </View>

            {/* Tab Panels */}
            {tabValue === 0 && (
              <FlatList
                data={filteredStudents}
                keyExtractor={(it) => String(it.id)}
                contentContainerStyle={{ paddingTop: 12 }}
                renderItem={({ item }) => (
                  <Card style={styles.studentCard}>
                    <Card.Content
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Avatar.Text
                        size={48}
                        label={(item.firstName || "S").charAt(0)}
                      />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontWeight: "700" }}>
                          {`${item.firstName || ""} ${
                            item.lastName || ""
                          }`.trim()}
                        </Text>
                        <Text style={{ color: "#666" }}>
                          Roll: {item.rollNumber || "N/A"}
                        </Text>

                        <View style={{ flexDirection: "row", marginTop: 8 }}>
                          <Chip
                            compact
                            style={{ marginRight: 8 }}
                            mode={
                              item.todayAttendance === "PRESENT"
                                ? "flat"
                                : "outlined"
                            }
                          >
                            {item.todayAttendance || "Unknown"}
                          </Chip>
                          <Chip compact mode="outlined">
                            Grade: {item.averageGrade ?? "N/A"}
                          </Chip>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )}
              />
            )}

            {tabValue === 1 && (
              <View style={{ marginTop: 12 }}>
                {filteredStudents.length === 0 ? (
                  <Text>No data</Text>
                ) : (
                  filteredStudents.map((student) => (
                    <Card key={student.id} style={{ marginBottom: 12 }}>
                      <Card.Content>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Avatar.Text
                            size={40}
                            label={(student.firstName || "S").charAt(0)}
                          />
                          <View style={{ marginLeft: 12 }}>
                            <Text style={{ fontWeight: "700" }}>
                              {`${student.firstName || ""} ${
                                student.lastName || ""
                              }`.trim()}
                            </Text>
                            <Text>{`Avg: ${
                              student.averageGrade ?? "N/A"
                            }`}</Text>
                          </View>
                        </View>

                        {student.subjectGrades &&
                          student.subjectGrades.map((sub, idx) => (
                            <View key={idx} style={{ marginBottom: 8 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Text>{sub.name}</Text>
                                <Text style={{ fontWeight: "700" }}>
                                  {sub.grade}%
                                </Text>
                              </View>
                              <ProgressBar
                                progress={(sub.grade ?? 0) / 100}
                                style={{ height: 8, borderRadius: 4 }}
                              />
                            </View>
                          ))}
                      </Card.Content>
                    </Card>
                  ))
                )}
              </View>
            )}

            {tabValue === 2 && (
              <View style={{ marginTop: 12 }}>
                {filteredStudents.length === 0 ? (
                  <Text>No data</Text>
                ) : (
                  filteredStudents.map((student) => (
                    <Card key={student.id} style={{ marginBottom: 12 }}>
                      <Card.Content>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Avatar.Text
                            size={40}
                            label={(student.firstName || "S").charAt(0)}
                          />
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ fontWeight: "700" }}>
                              {`${student.firstName || ""} ${
                                student.lastName || ""
                              }`.trim()}
                            </Text>
                            <Text>{`Attendance: ${
                              student.attendancePercentage ?? 0
                            }%`}</Text>
                          </View>
                        </View>

                        <ProgressBar
                          progress={(student.attendancePercentage ?? 0) / 100}
                          style={{ height: 10, borderRadius: 6, marginTop: 12 }}
                        />

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 8,
                          }}
                        >
                          <Text>Present: {student.presentDays ?? 0}</Text>
                          <Text>Absent: {student.absentDays ?? 0}</Text>
                        </View>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  selectorRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  selectorBox: { flexDirection: "row", flexWrap: "wrap" },
  label: { fontWeight: "700", marginBottom: 6 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: { flex: 1, marginRight: 8 },
  statNumber: { fontSize: 22, fontWeight: "700" },
  tabRow: { flexDirection: "row", marginTop: 12, marginBottom: 12 },
  studentCard: { marginBottom: 8 },
  card: { margin: 8 },
});

export default TeacherStudentDashboard;
