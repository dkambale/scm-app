import {
  User,
  Student,
  Teacher,
  Class,
  Attendance,
  Assignment,
  Announcement,
  Fee,
  Role,
  Permission,
} from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@school.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: [
      'VIEW_STUDENTS', 'EDIT_STUDENTS', 'DELETE_STUDENTS', 'CREATE_STUDENTS',
      'VIEW_TEACHERS', 'EDIT_TEACHERS', 'DELETE_TEACHERS', 'CREATE_TEACHERS',
      'VIEW_CLASSES', 'EDIT_CLASSES', 'DELETE_CLASSES', 'CREATE_CLASSES',
      'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE', 'CREATE_ATTENDANCE',
      'VIEW_ASSIGNMENTS', 'EDIT_ASSIGNMENTS', 'DELETE_ASSIGNMENTS', 'CREATE_ASSIGNMENTS',
      'VIEW_ANNOUNCEMENTS', 'EDIT_ANNOUNCEMENTS', 'DELETE_ANNOUNCEMENTS', 'CREATE_ANNOUNCEMENTS',
      'VIEW_FEES', 'EDIT_FEES',
      'VIEW_ROLES', 'EDIT_ROLES'
    ],
  },
  {
    id: '2',
    email: 'teacher@school.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'teacher',
    permissions: [
      'VIEW_STUDENTS', 'EDIT_STUDENTS',
      'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE', 'CREATE_ATTENDANCE',
      'VIEW_ASSIGNMENTS', 'EDIT_ASSIGNMENTS', 'CREATE_ASSIGNMENTS',
      'VIEW_ANNOUNCEMENTS', 'CREATE_ANNOUNCEMENTS',
      'VIEW_CLASSES'
    ],
  },
  {
    id: '3',
    email: 'student@school.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'student',
    permissions: [
      'VIEW_ATTENDANCE',
      'VIEW_ASSIGNMENTS',
      'VIEW_ANNOUNCEMENTS',
      'VIEW_FEES',
      'PAY_FEES',
      'VIEW_CLASSES'
    ],
  },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'student@school.com',
    classId: 'c1',
    rollNumber: '101',
    dob: '2010-05-15',
    address: '123 Main St, City',
    parentContact: '+1234567890',
  },
  {
    id: 's2',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@school.com',
    classId: 'c1',
    rollNumber: '102',
    dob: '2010-08-22',
    address: '456 Oak Ave, City',
    parentContact: '+1234567891',
  },
  {
    id: 's3',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@school.com',
    classId: 'c2',
    rollNumber: '201',
    dob: '2011-03-10',
    address: '789 Pine Rd, City',
    parentContact: '+1234567892',
  },
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 't1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'teacher@school.com',
    subject: 'Mathematics',
    classAssigned: ['c1', 'c2'],
    phone: '+1234567893',
  },
  {
    id: 't2',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily@school.com',
    subject: 'Science',
    classAssigned: ['c1'],
    phone: '+1234567894',
  },
];

export const MOCK_CLASSES: Class[] = [
  {
    id: 'c1',
    className: 'Grade 5',
    section: 'A',
    subjects: ['Mathematics', 'Science', 'English', 'History'],
    teacherAssigned: 't1',
    schedule: [
      { day: 'Monday', time: '09:00 AM', subject: 'Mathematics', teacherId: 't1' },
      { day: 'Monday', time: '10:00 AM', subject: 'Science', teacherId: 't2' },
      { day: 'Tuesday', time: '09:00 AM', subject: 'English', teacherId: 't1' },
      { day: 'Wednesday', time: '09:00 AM', subject: 'Mathematics', teacherId: 't1' },
    ],
  },
  {
    id: 'c2',
    className: 'Grade 6',
    section: 'A',
    subjects: ['Mathematics', 'Science', 'English'],
    teacherAssigned: 't1',
    schedule: [
      { day: 'Monday', time: '11:00 AM', subject: 'Mathematics', teacherId: 't1' },
      { day: 'Tuesday', time: '10:00 AM', subject: 'Science', teacherId: 't2' },
    ],
  },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  {
    id: 'a1',
    date: '2025-10-24',
    classId: 'c1',
    studentId: 's1',
    status: 'Present',
  },
  {
    id: 'a2',
    date: '2025-10-24',
    classId: 'c1',
    studentId: 's2',
    status: 'Present',
  },
  {
    id: 'a3',
    date: '2025-10-23',
    classId: 'c1',
    studentId: 's1',
    status: 'Absent',
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'as1',
    title: 'Math Homework - Chapter 5',
    description: 'Complete exercises 1-10 from chapter 5',
    classId: 'c1',
    teacherId: 't1',
    dueDate: '2025-10-30',
    submissions: [
      {
        studentId: 's1',
        fileUrl: 'submission1.pdf',
        grade: 'A',
        remarks: 'Excellent work!',
        submittedAt: '2025-10-23',
      },
    ],
  },
  {
    id: 'as2',
    title: 'Science Project',
    description: 'Create a model of the solar system',
    classId: 'c1',
    teacherId: 't2',
    dueDate: '2025-11-05',
    submissions: [],
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an1',
    title: 'Parent-Teacher Meeting',
    message: 'Parent-teacher meeting scheduled for next week',
    createdBy: '1',
    targetAudience: 'all',
    date: '2025-10-24',
  },
  {
    id: 'an2',
    title: 'Sports Day',
    message: 'Annual sports day on November 15th',
    createdBy: '1',
    targetAudience: 'all',
    date: '2025-10-23',
  },
];

export const MOCK_FEES: Fee[] = [
  {
    id: 'f1',
    studentId: 's1',
    amount: 500,
    dueDate: '2025-11-01',
    status: 'Paid',
  },
  {
    id: 'f2',
    studentId: 's2',
    amount: 500,
    dueDate: '2025-11-01',
    status: 'Pending',
  },
];

export const MOCK_ROLES: Role[] = [
  {
    roleId: 'r1',
    roleName: 'admin',
    permissions: [
      'VIEW_STUDENTS', 'EDIT_STUDENTS', 'DELETE_STUDENTS', 'CREATE_STUDENTS',
      'VIEW_TEACHERS', 'EDIT_TEACHERS', 'DELETE_TEACHERS', 'CREATE_TEACHERS',
      'VIEW_CLASSES', 'EDIT_CLASSES', 'DELETE_CLASSES', 'CREATE_CLASSES',
      'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE', 'CREATE_ATTENDANCE',
      'VIEW_ASSIGNMENTS', 'EDIT_ASSIGNMENTS', 'DELETE_ASSIGNMENTS', 'CREATE_ASSIGNMENTS',
      'VIEW_ANNOUNCEMENTS', 'EDIT_ANNOUNCEMENTS', 'DELETE_ANNOUNCEMENTS', 'CREATE_ANNOUNCEMENTS',
      'VIEW_FEES', 'EDIT_FEES',
      'VIEW_ROLES', 'EDIT_ROLES'
    ],
  },
  {
    roleId: 'r2',
    roleName: 'teacher',
    permissions: [
      'VIEW_STUDENTS', 'EDIT_STUDENTS',
      'VIEW_ATTENDANCE', 'EDIT_ATTENDANCE', 'CREATE_ATTENDANCE',
      'VIEW_ASSIGNMENTS', 'EDIT_ASSIGNMENTS', 'CREATE_ASSIGNMENTS',
      'VIEW_ANNOUNCEMENTS', 'CREATE_ANNOUNCEMENTS',
      'VIEW_CLASSES'
    ],
  },
  {
    roleId: 'r3',
    roleName: 'student',
    permissions: [
      'VIEW_ATTENDANCE',
      'VIEW_ASSIGNMENTS',
      'VIEW_ANNOUNCEMENTS',
      'VIEW_FEES',
      'PAY_FEES',
      'VIEW_CLASSES'
    ],
  },
];
