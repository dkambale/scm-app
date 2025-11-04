# School Management Application

## Overview
A comprehensive React Native mobile application built with Expo for managing school operations. The app supports three user roles (Admin, Teacher, Student) with role-based access control and complete CRUD operations for managing students, teachers, classes, attendance, assignments, announcements, and fees.

## Tech Stack
- **Frontend**: React Native with Expo SDK
- **Navigation**: React Navigation v7 (Drawer + Bottom Tabs)
- **State Management**: Context API (AuthContext)
- **API Calls**: Axios with JWT interceptor
- **Storage**: Expo SecureStore for token persistence
- **UI Framework**: React Native Paper
- **Form Handling**: Formik + Yup
- **Authorization**: Role-based access control (RBAC)

## Project Structure
```
/src
  /screens
    /auth          - Login and authentication screens
    /admin         - Admin-specific screens
    /teacher       - Teacher-specific screens
    /student       - Student-specific screens
    /common        - Shared screens across roles
  /components
    /common        - Reusable UI components
    /forms         - Form components
  /context         - React Context for state management
  /navigation      - Navigation configuration by role
  /api             - API services and mock data
  /utils           - Utility functions and HOCs
  /hooks           - Custom React hooks
  /types           - TypeScript type definitions
```

## User Roles and Access

### Admin
- Full CRUD access to all entities
- Dashboard with system statistics
- Manage students, teachers, classes
- View all attendance and assignments
- Manage fees and announcements
- Role and permission management

### Teacher
- View and manage assigned students
- Take and manage attendance
- Create and grade assignments
- Post announcements for classes
- View timetable

### Student
- View personal timetable
- View and submit assignments
- Check attendance history
- View and pay fees
- Read announcements

## Demo Accounts
- **Admin**: admin@school.com / password123
- **Teacher**: teacher@school.com / password123
- **Student**: student@school.com / password123

## Features Implemented
- ✅ JWT-based authentication with SecureStore
- ✅ Role-based navigation (Drawer for Admin, Tabs for Teacher/Student)
- ✅ Permission-based access control
- ✅ CRUD operations for all entities
- ✅ Mock API with simulated network delays
- ✅ Pull-to-refresh functionality
- ✅ Search functionality
- ✅ Clean Material Design UI with React Native Paper
- ✅ Form validation with Formik and Yup
- ✅ Loading states and error handling

## Development
The app uses Expo for development and supports web, iOS, and Android platforms. The mock API simulates a real backend with JWT authentication and CRUD operations stored in memory.

## Recent Changes
- Initial project setup with Expo and React Navigation
- Implemented authentication context and mock API service with cross-platform storage
- Created role-based navigation structure (Drawer for Admin, Tabs for Teacher/Student)
- Built comprehensive screens for all three roles:
  - Admin: Dashboard, Students, Teachers, Classes, Fees, Assignments, Attendance, Announcements, Profile
  - Teacher: Dashboard, Attendance, Assignments, Announcements, Profile
  - Student: Dashboard, Timetable, Assignments, Attendance, Fees, Announcements, Profile
- Integrated React Native Paper for consistent Material Design UI
- Added form validation with Formik and Yup
- Implemented cross-platform storage (LocalStorage for web, SecureStore for native)
- Added pull-to-refresh, search functionality, and loading states
