export type UserRole = 'admin' | 'teacher' | 'student';

// Keep the legacy Permission export for compatibility if needed, but define the new structure.
export type PermissionName = 
  | 'VIEW_STUDENTS' 
  | 'EDIT_STUDENTS' 
  | 'DELETE_STUDENTS'
  | 'CREATE_STUDENTS'
  | 'VIEW_TEACHERS'
  | 'EDIT_TEACHERS'
  | 'DELETE_TEACHERS'
  | 'CREATE_TEACHERS'
  | 'VIEW_CLASSES'
  | 'EDIT_CLASSES'
  | 'DELETE_CLASSES'
  | 'CREATE_CLASSES'
  | 'VIEW_ATTENDANCE'
  | 'EDIT_ATTENDANCE'
  | 'CREATE_ATTENDANCE'
  | 'VIEW_ASSIGNMENTS'
  | 'EDIT_ASSIGNMENTS'
  | 'DELETE_ASSIGNMENTS'
  | 'CREATE_ASSIGNMENTS'
  | 'VIEW_ANNOUNCEMENTS'
  | 'EDIT_ANNOUNCEMENTS'
  | 'DELETE_ANNOUNCEMENTS'
  | 'CREATE_ANNOUNCEMENTS'
  | 'VIEW_FEES'
  | 'EDIT_FEES'
  | 'PAY_FEES'
  | 'VIEW_ROLES'
  | 'EDIT_ROLES';
  
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

// --- NEW/UPDATED USER DEFINITIONS BASED ON API RESPONSE ---

export interface PermissionAction {
  id: number;
  edit: boolean;
  add: boolean;
  view: boolean;
  delete: boolean;
}

export interface Permission {
  id: number;
  name: string;
  entityName: string;
  actions: PermissionAction;
  accountId: number;
  // Other fields from API response
  createdBy?: string;
  modifiedBy?: string;
  schoolId?: number;
}

export interface Role {
  id: number;
  name: string; // e.g., "Admin", "Teacher", "Student"
  permissions: Permission[];
  accountId: number;
  // Other fields from API response
  createdBy?: string;
  modifiedBy?: string;
  schoolId?: number;
  schoolName?: string;
}

// Re-defining User to match the detailed API response structure
export interface User {
  id: number; 
  userName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobileNumber: string | null;
  address: string | null;
  dob: string | null;
  
  // Account related IDs/Names
  accountId: number | null;
  schoolId: number | null;
  classId: number | null;
  divisionId: number | null;
  className: string | null;
  divisionName: string | null;
  schoolName: string | null;
  
  // User type and status (using capitalized strings from the API)
  type: 'Admin' | 'Teacher' | 'Student' | 'Parent'; 
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | string; 
  
  // Nested Objects
  role: Role | null;
  
  // Optional/Other fields
  gender?: string | null;
  rollNo?: number | null;
  middleName?: string | null;
  documentIds?: number[] | null;
  allocatedClasses?: any[] | null; 
  educations?: any[] | null; 
  createdBy?: string | null;
  modifiedBy?: string | null;
}
// --- END NEW USER DEFINITIONS ---

// Updated AuthResponse to use the new User type
export interface AuthResponse {
  token: string;
  user: User; // Updated to use the new detailed User interface
}

// ... rest of the file definitions (Student, Teacher, Class, etc.)
// ... existing Student, Teacher, Class, etc. interfaces kept below for file completion.

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  classId: string;
  rollNumber: string;
  dob: string;
  address: string;
  parentContact: string;
  profilePic?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  classAssigned: string[];
  phone: string;
  profilePic?: string;
}

export interface Class {
  id: string;
  className: string;
  section: string;
  subjects: string[];
  teacherAssigned: string;
  schedule: ScheduleItem[];
}

export interface ScheduleItem {
  day: string;
  time: string;
  subject: string;
  teacherId: string;
}

export interface Attendance {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: 'Present' | 'Absent';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  attachmentUrl?: string;
  submissions: Submission[];
}

export interface Submission {
  studentId: string;
  fileUrl?: string;
  grade?: string;
  remarks?: string;
  submittedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  targetAudience: string;
  date: string;
}

export type RNStyle = ViewStyle | TextStyle | ImageStyle;

export interface TimetableEntry {
  id: string;
  time: string;
  subject: string;
  class: string;
  room: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  entityType: string;
}

export interface Birthday {
  id: string;
  name: string;
  role: 'student' | 'teacher';
}

export interface ChartDataSet {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity: number) => string;
  }>;
  legend?: string[];
}

export interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
}

export interface AssignmentChartProps {
  // Assuming a chart component expects processed data
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
    color: string;
  }>;
  loading: boolean;
  error: string | null;
}

export interface ExamStudentResult {
    id: string;
    subjectId: string;
    subjectName: string;
    marksObtained: number | null;
    totalMarks: number | null;
    grade: string | null;
    remarks: string | null;
    passed: boolean | undefined;
    
    // Summary Fields (duplicated across all rows in the API response)
    examName: string;
    studentName: string;
    className: string;
    divisionName: string;
    schoolName: string;
}

export interface ExamSummary {
    examName: string;
    studentName: string;
    className: string;
    divisionName: string;
    schoolName: string;
    totalMax: number;
    totalObtained: number;
    percentage: string;
}
interface FeeInstallment {
  id: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
}

export interface Fee {
  id: number;
  feeId?: number; // Used in updated fees array
  title: string;
  feeTitle?: string; // Used in payment logic/history
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending';
  installments: FeeInstallment[];
}

export interface PaymentHistoryItem {
  id: number | string;
  date: string;
  feeName?: string; // Used in Table
  feeTitle?: string; // Used in PaymentModal logic
  amount: number;
  receiptNumber: string;
  paymentMethod?: string;
  paymentMode?: string;
  studentFeeId?: number;
  studentId?: number;
  transactionId?: string;
}

export interface StudentInfo {
  id: string | number;
  firstName: string;
  lastName: string;
  rollNo: string;
  schoolName: string;
  className: string;
  type: string;
}