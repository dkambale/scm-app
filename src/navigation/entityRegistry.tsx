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
import RoleList from "../screens/admin/roles/roleslist";
import { StudentFeeView } from "../screens/admin/fees/MyFees";
import TeacherExamView from "../screens/admin/exam/TeacherExamView";

import SchoolList from "../screens/admin/schools/SchoolList";
import ClassList from "../screens/admin/classes/ClassList";
import InstituteList from "../screens/admin/institutes/InstituteList";
import DivisionsList from "../screens/admin/divisions/divisionsList";
import SubjectsList from "../screens/admin/subjects/SubjectList";
// import TeacherTimetableCard from
// Map permission entity names to a screen component and a friendly title.
const entityRegistry: Record<
  string,
  { id: string; title: string; component: any }
> = {
   INSTITUTE: {
    id: "INSTITUTE",
    title: "INSTITUTES",
    component: InstituteList,
    icon: "account-group",
  },
   SCHOOL: {
    id: "SCHOOL",
    title: "SCHOOLS",
    component: SchoolList,
    icon: "account-group",
  },
   CLASSES: {
    id: "CLASSES",
    title: "CLASSES",
    component: ClassList,
    icon: "account-group",
  },
   DIVISION: {
    id: "DIVISION",
    title: "DIVISIONS",
    component: DivisionsList ,
    icon: "account-group",
  },
  SUBJECT: {
    id: "SUBJECT",
    title: "SUBJECTS",
    component: SubjectsList , // Placeholder, replace with actual SubjectList component
    icon: "book-open-variant",
  },
  STUDENT: {
    id: "STUDENT",
    title: "Students",
    component: StudentsScreen,
    icon: "account-group",
  },

  TEACHER: {
    id: "TEACHER",
    title: "Teachers",
    component: TeachersScreen,
    icon: "account-tie",
  },
  // CLASS: { id: "CLASS", title: "Divisions", component: ClassesScreen },
  TIMETABLE: {
    id: "TIMETABLE",
    title: "Timetables",
    component: TimetablesScreen,
    icon: "calendar-clock",
  },
  ASSIGNMENT: {
    id: "ASSIGNMENT",
    title: "Assignments",
    component: AssignmentsScreen,
    icon: "book-open-variant",
  },
  ATTENDANCE: {
    id: "ATTENDANCE",
    title: "Attendance",
    component: AttendancesScreen,
    icon: "clipboard-check-outline",
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
    icon: "cash",
  },
  // ANNOUNCEMENT: {
  //   id: "ANNOUNCEMENT",
  //   title: "Announcements",
  //   component: AnnouncementsScreen,
  // },
  PROFILE: {
    id: "PROFILE",
    title: "Profile",
    component: ProfileScreen,
    icon: "account-circle",
  },
  TEACHER_DASHBOARD: {
    id: "TEACHER_DASHBOARD",
    title: "Dashboard",
    component: TeacherDashboardScreen,
    icon: "view-dashboard",
  },
  STUDENT_DASHBOARD: {
    id: "STUDENT_DASHBOARD",
    title: "Student Dashboard",
    component: StudentDashboardScreen,
    icon: "school",
  },
  EXAM: {
    id: "EXAM",
    title: "Examinations",
    component: StudentExamListScreen, // Placeholder for Examination Screen
    icon: "file-document-outline",
  },
  ROLE: {
    id: "ROLE",
    title: "Roles",
    component: RoleList,
    icon: "account-key",
  },
  EXAM_TEACHER_VIEW: {
    id: "EXAM_TEACHER_VIEW",
    title: "Teacher Examination View",
    component: TeacherExamView, // Placeholder for Examination Screen
    icon: "account-tie",
  },
};

export default entityRegistry;
