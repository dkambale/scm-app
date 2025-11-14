import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  List,
  ProgressBar,
  Chip,
  Avatar,
  Title,
} from "react-native-paper";
import /* useAuth, */ "../../context/AuthContext"; // keep import line in case other code expects it
import { apiService } from "../../api/apiService"; // Assuming you have this service
import { userDetails } from "../../utils/apiService";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Using MaterialCommunityIcons
import { useTranslation } from "react-i18next";

// Define types for the fetched data (optional but recommended)
interface SummaryData {
  totalAssignments: number;
  upcomingExams: number;
  enrolledCourses: number;
  pendingSubmissions: number;
  attendancePercentage: number;
}

interface TimetableSlot {
  id: string | number;
  subjectName: string;
  type: string;
  hour: string;
  minute: string;
  teacherName: string;
}

interface Course {
  id: string | number;
  courseId: string | number;
  courseName: string;
  description: string;
  completionPercent: number;
}

interface Exam {
  id: string | number;
  examName: string;
  startDate: string;
}

interface Document {
  id: string | number;
  fileName: string;
  createdDate: string;
  fileType: string;
}

export const StudentDashboardScreen: React.FC = () => {
  // Load user from persisted storage via userDetails.getUser() instead of useAuth
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await userDetails.getUser();
        if (mounted) setUser(u);
      } catch (err) {
        console.error("Failed to load user from storage", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const { t } = useTranslation("dashboard");
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for all dashboard sections
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (
        !user?.id ||
        !user?.accountId ||
        !user?.schoolId ||
        !user?.classId ||
        !user?.divisionId
      ) {
        setError(t("common.userNotAuthenticated"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const now = new Date().toISOString();
      const futureDate = "2099-12-31T23:59:59.999Z";

      try {
        const [
          totalAssignmentsRes,
          pendingSubmissionsRes,
          upcomingExamsRes,
          enrolledCoursesRes,
          timetableRes,
          documentsRes,
          attendanceRes,
        ] = await Promise.all([
          // 1. Total Assignments
          apiService.api.post(`/api/assignments/getAllBy/${user.accountId}`, {
            page: 0,
            size: 1,
            sortBy: "deadLine",
            sortDir: "desc",
            fromDate: now,
            toDate: futureDate,
            classId: user.classId,
            divisionId: user.divisionId,
            schoolId: user.schoolId,
          }),
          // 2. Pending Submissions
          apiService.api.get(
            `/api/assignments/pendingAssignments/${user.accountId}/student?studentId=${user.id}&schoolId=${user.schoolId}&classId=${user.classId}&divisionId=${user.divisionId}`
          ),
          // 3. Upcoming Exams
          apiService.api.post(`/api/exams/getAllBy/${user.accountId}`, {
            page: 0,
            size: 1000,
            sortBy: "startDate",
            sortDir: "asc",
            fromDate: now,
            toDate: futureDate,
          }),
          // 4. Enrolled Courses
          apiService.api.get(
            `/api/lms/courses/${user.accountId}/get/enrollFor/${user.id}`
          ),
          // 5. Timetable
          apiService.api.post(`/api/timetable/getAllBy/${user.accountId}`, {
            page: 0,
            size: 1000,
            sortBy: "id",
            sortDir: "asc",
            search: "",
            userId: user.id,
          }),
          // 6. Documents
          apiService.api.post(
            `/api/documents/getAllBy/${user.accountId}?userType=STUDENT`,
            {
              page: 0,
              size: 10,
              sortBy: "createdDate",
              sortDir: "asc",
              schoolId: user.schoolId,
              classId: user.classId,
              divisionId: user.divisionId,
              userId: user.id,
            }
          ),
          // 7. Attendance
          apiService.api.post(
            `/api/attendance/getStudentAttendance/${user.accountId}/${user.id}`,
            {
              page: 0,
              size: 1000,
              sortBy: "id",
              sortDir: "asc",
            }
          ),
        ]);

        // Process Timetable
        const today = new Date();
        const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
        const timetableContent = timetableRes?.data?.content || [];
        // Ensure we only flatMap arrays and skip undefined dayTimeTable entries
        const dayTimeTables = timetableContent.flatMap((tt: any) =>
          Array.isArray(tt?.dayTimeTable) ? tt.dayTimeTable : []
        );
        const todaySchedule = dayTimeTables.filter(
          (day: any) => day && day.dayName === dayName
        );
        const formattedTimetable: TimetableSlot[] =
          todaySchedule[0] && Array.isArray(todaySchedule[0].tsd)
            ? todaySchedule[0].tsd
            : [];
        setTimetable(formattedTimetable);

        // Process Attendance
        const attendanceRecords = attendanceRes.data?.content || [];
        let presentCount = 0;
        let absentCount = 0;
        attendanceRecords.forEach((record: any) => {
          if (
            record.studentAttendanceMappings &&
            record.studentAttendanceMappings.length > 0
          ) {
            const status = record.studentAttendanceMappings[0].vailable;
            if (status === true) presentCount++;
            else if (status === false) absentCount++;
          }
        });
        const totalDays = presentCount + absentCount;
        const attendancePercentage =
          totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

        // Process Summary
        setSummaryData({
          totalAssignments: totalAssignmentsRes.data.totalElements || 0,
          pendingSubmissions: pendingSubmissionsRes.data.length || 0,
          upcomingExams: upcomingExamsRes.data.totalElements || 0,
          enrolledCourses: enrolledCoursesRes.data.length || 0,
          attendancePercentage: attendancePercentage,
        });

        // Set other states
        setUpcomingExams(upcomingExamsRes.data.content || []);
        setCourses(enrolledCoursesRes.data || []);
        setDocuments(documentsRes.data.content || []);
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        setError(t("student.loadDashboardError"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, t]);

  // --- Render Helper Components ---

  const renderSummaryCard = (
    title: string,
    value: string | number,
    icon: string
  ) => (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <Avatar.Icon icon={icon} size={40} style={styles.summaryIcon} />
        <Text variant="headlineLarge" style={styles.summaryNumber}>
          {value}
        </Text>
        <Text variant="titleMedium" style={styles.summaryTitle}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderCourseCard = ({ item }: { item: Course }) => {
    const completionPercent = item.completionPercent || 0;
    const isCompleted = completionPercent >= 100;
    const progressColor = "#1976d2"; // teacher primary blue

    return (
      <Card
        style={styles.courseCard}
        onPress={() =>
          navigation.navigate("CourseView", { courseId: item.courseId })
        } // Update route as needed
      >
        <Card.Content>
          <View style={styles.courseHeader}>
            <Text variant="titleMedium" style={styles.courseTitle}>
              {item.courseName}
            </Text>
            <Chip
              style={{ backgroundColor: "#E3F2FD" }}
              textStyle={{ color: progressColor }}
            >
              {isCompleted ? t("common.completed") : t("common.inProgress")}
            </Chip>
          </View>
          <Text
            variant="bodyMedium"
            style={styles.courseDescription}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View style={styles.progressContainer}>
            <Text variant="bodySmall">{t("common.progress")}</Text>
            <Text variant="bodySmall">{completionPercent}%</Text>
          </View>
          <ProgressBar
            progress={completionPercent / 100}
            color={progressColor}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>
    );
  };

  // --- Main Render ---

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {t("common.welcome")}, {user?.firstName}!
      </Text>

      {/* --- Student Summary --- */}
      {summaryData && (
        <View style={styles.grid}>
          {renderSummaryCard(
            t("student.pendingSubmissions"),
            summaryData.pendingSubmissions,
            "file-clock-outline"
          )}
          {renderSummaryCard(
            t("student.attendanceChartLabel"),
            `${summaryData.attendancePercentage}%`,
            "check-circle-outline"
          )}
          {renderSummaryCard(
            t("student.upcomingExams"),
            summaryData.upcomingExams,
            "calendar-alert"
          )}
          {renderSummaryCard(
            t("student.enrolledCourses"),
            summaryData.enrolledCourses,
            "book-open-variant"
          )}
        </View>
      )}

      {/* --- Quick Links --- */}
      <Card style={styles.card}>
        <Card.Title title={t("student.quickLinksTitle")} />
        <Card.Content style={styles.quickLinksContainer}>
          <Pressable
            style={styles.quickLinkButton}
            onPress={() => navigation.navigate("StudentFees")}
          >
            <Avatar.Icon
              icon="credit-card"
              size={48}
              style={{ backgroundColor: "#E3F2FD" }}
              color="#1976d2"
            />
            <Text style={styles.quickLinkText}>{t("student.myFees")}</Text>
          </Pressable>
          <Pressable
            style={styles.quickLinkButton}
            onPress={() => navigation.navigate("StudentGrades")}
          >
            <Avatar.Icon
              icon="star-circle"
              size={48}
              style={{ backgroundColor: "#E3F2FD" }}
              color="#1976d2"
            />
            <Text style={styles.quickLinkText}>{t("student.myGrades")}</Text>
          </Pressable>
          <Pressable
            style={styles.quickLinkButton}
            onPress={() => navigation.navigate("LmsScreen")}
          >
            <Avatar.Icon
              icon="book-open-page-variant"
              size={48}
              style={{ backgroundColor: "#E3F2FD" }}
              color="#1976d2"
            />
            <Text style={styles.quickLinkText}>{t("student.myCourses")}</Text>
          </Pressable>
        </Card.Content>
      </Card>

      {/* --- Today's Timetable --- */}
      <Card style={styles.card}>
        <Card.Title title={t("student.todaysTimetable")} />
        <Card.Content>
          <FlatList
            data={timetable}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <List.Item
                title={`${item.subjectName} (${item.type})`}
                description={`${t("common.time")}: ${item.hour}:${
                  item.minute
                } - ${t("common.teacher")}: ${item.teacherName}`}
                left={() => <List.Icon icon="timetable" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {t("student.noClassesScheduled")}
              </Text>
            }
          />
        </Card.Content>
      </Card>

      {/* --- My Courses (LMS) --- */}
      <Card style={styles.card}>
        <Card.Title title={t("student.myCourses")} />
        <Card.Content>
          <FlatList
            data={courses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {t("student.noCoursesEnrolled")}
              </Text>
            }
          />
        </Card.Content>
      </Card>

      {/* --- Upcoming Exams --- */}
      <Card style={styles.card}>
        <Card.Title title={t("student.upcomingExamsTitle")} />
        <Card.Content>
          <FlatList
            data={upcomingExams}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <List.Item
                title={item.examName}
                description={`${t("common.date")}: ${new Date(
                  item.startDate
                ).toLocaleDateString()}`}
                left={() => <List.Icon icon="calendar-check" />}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {t("student.noUpcomingExams")}
              </Text>
            }
          />
        </Card.Content>
      </Card>

      {/* --- My Documents --- */}
      <Card style={styles.card}>
        <Card.Title title={t("student.myDocumentsTitle")} />
        <Card.Content>
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <List.Item
                title={item.fileName}
                description={`${t("common.uploaded")}: ${new Date(
                  item.createdDate
                ).toLocaleDateString()} | ${t("common.type")}: ${
                  item.fileType
                }`}
                left={() => <List.Icon icon="file-document-outline" />}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {t("student.noDocumentsFound")}
              </Text>
            }
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    marginBottom: 24,
    fontWeight: "bold",
    color: "#1976d2",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    marginBottom: 16,
    elevation: 3,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
  },
  summaryIcon: {
    backgroundColor: "transparent",
    alignSelf: "flex-start",
    marginLeft: -8,
  },
  summaryNumber: {
    fontWeight: "bold",
    color: "#1976d2",
    marginTop: 8,
  },
  summaryTitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6c757d",
  },
  card: {
    marginBottom: 20,
    elevation: 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  quickLinksContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  quickLinkButton: {
    alignItems: "center",
  },
  quickLinkText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6c757d",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#6c757d",
  },
  courseCard: {
    marginBottom: 12,
    elevation: 1,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  courseTitle: {
    flex: 1,
    marginRight: 8,
    fontWeight: "bold",
  },
  courseDescription: {
    color: "#6c757d",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
