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

// Map permission entity names to a screen component and a friendly title.
const entityRegistry: Record<
  string,
  { id: string; title: string; component: any }
> = {
  STUDENT: { id: "STUDENT", title: "Students", component: StudentsScreen },
  TEACHER: { id: "TEACHER", title: "Teachers", component: TeachersScreen },
  CLASS: { id: "CLASS", title: "Classes", component: ClassesScreen },
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
  FEE: { id: "FEE", title: "Fees (Student)", component: StudentFeesScreen },
  FEE_MANAGEMENT: {
    id: "FEE_MANAGEMENT",
    title: "Fees (Admin)",
    component: AdminFeesScreen,
  },
  ANNOUNCEMENT: {
    id: "ANNOUNCEMENT",
    title: "Announcements",
    component: AnnouncementsScreen,
  },
  PROFILE: { id: "PROFILE", title: "Profile", component: ProfileScreen },
};

export default entityRegistry;
