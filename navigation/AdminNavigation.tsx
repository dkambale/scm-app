import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { StudentsScreen } from '../screens/admin/StudentsScreen';
import { TeachersScreen } from '../screens/admin/TeachersScreen';
import { ClassesScreen } from '../screens/admin/ClassesScreen';
import { FeesScreen } from '../screens/admin/FeesScreen';
import { AssignmentsScreen } from '../screens/common/AssignmentsScreen';
import { AttendanceScreen } from '../screens/common/AttendanceScreen';
import { AnnouncementsScreen } from '../screens/common/AnnouncementsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Drawer = createDrawerNavigator();

export const AdminNavigation: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#6200ee',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          drawerIcon: ({ color }) => '📊',
        }}
      />
      <Drawer.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          drawerIcon: ({ color }) => '👨‍🎓',
        }}
      />
      <Drawer.Screen
        name="Teachers"
        component={TeachersScreen}
        options={{
          drawerIcon: ({ color }) => '👨‍🏫',
        }}
      />
      <Drawer.Screen
        name="Classes"
        component={ClassesScreen}
        options={{
          drawerIcon: ({ color }) => '🏫',
        }}
      />
      <Drawer.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          drawerIcon: ({ color }) => '📚',
        }}
      />
      <Drawer.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          drawerIcon: ({ color }) => '📅',
        }}
      />
      <Drawer.Screen
        name="Fees"
        component={FeesScreen}
        options={{
          drawerIcon: ({ color }) => '💰',
        }}
      />
      <Drawer.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          drawerIcon: ({ color }) => '📢',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => '👤',
        }}
      />
    </Drawer.Navigator>
  );
};
