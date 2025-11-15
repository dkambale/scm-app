import { StudentsScreen } from "../screens/admin/StudentsScreen";
import { TeachersScreen } from "../screens/admin/TeachersScreen";
import { ClassesScreen } from "../screens/admin/ClassesScreen";
import { TimetablesScreen } from "../screens/admin/TimetablesScreen";
import { AssignmentsScreen } from "../screens/admin/AssignmentsScreen";
import { AttendancesScreen } from "../screens/admin/AttendancesScreen";
import { FeesScreen as AdminFeesScreen } from "../screens/admin/FeesScreen";
import { AnnouncementsScreen } from "../screens/common/AnnouncementsScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";
import { FeesScreen as StudentFeesScreen } from "../screens/student/FeesScreen";
import TeacherDashboardScreen from "../screens/teacher/TeacherDashboardScreen";
import { StudentDashboardScreen } from "../dashboard/studentDashboard/StudentDashboardScreen";
import StudentExamResultScreen from "../screens/admin/exam/StudentExamResult";
import StudentExamListScreen from "../screens/admin/exam/StudentExamListScreen"; 
import { StudentFeeView } from "../screens/admin/fees/MyFees";
// import TeacherTimetableCard from
// Map permission entity names to a screen component and a friendly title.
const entityRegistry: Record<
  string,
  { id: string; title: string; component: any }
> = {
  STUDENT: { id: "STUDENT", title: "Students", component: StudentsScreen },
  TEACHER: { id: "TEACHER", title: "Teachers", component: TeachersScreen },
  // CLASS: { id: "CLASS", title: "Classes", component: ClassesScreen },
  TIMETABLE: {
    id: "TIMETABLE",
    title: "Timetables",
    component: TimetablesScreen,
  },
  ASSIGNMENT: {
    id: "ASSIGNMENT",
    title: "Assignments",
    component: AssignmentsScreen,
  },
  ATTENDANCE: {
    id: "ATTENDANCE",
    title: "Attendance",
    component: AttendancesScreen,
  },
  // FEE: { id: "FEE", title: "Fees (Student)", component: StudentFeesScreen },
  // FEE_MANAGEMENT: {
  //   id: "FEE_MANAGEMENT",
  //   title: "Fees (Admin)",
  //   component: AdminFeesScreen,
  // },
   MYFEE: {
    id: "MY fees",
    title: "Fees (Student)",
    component: StudentFeeView,
  },
  // ANNOUNCEMENT: {
  //   id: "ANNOUNCEMENT",
  //   title: "Announcements",
  //   component: AnnouncementsScreen,
  // },
  PROFILE: { id: "PROFILE", title: "Profile", component: ProfileScreen },
  TEACHER_DASHBOARD: {
    id: "TEACHER_DASHBOARD",
    title: "Admin Dashboard",
    component: TeacherDashboardScreen,
  },
   STUDENT_DASHBOARD: {
    id: "STUDENT_DASHBOARD",
    title: "Student Dashboard",
    component: StudentDashboardScreen,
  },
  EXAM : {
    id: "EXAM",
    title: "Examinations",
    component: StudentExamListScreen, // Placeholder for Examination Screen
  },
};

export default entityRegistry;
