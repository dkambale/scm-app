export type UserRole = 'admin' | 'teacher' | 'student';

export type Permission = 
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  profilePic?: string;
}

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

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
  receiptUrl?: string;
}

export interface Role {
  roleId: string;
  roleName: UserRole;
  permissions: Permission[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
