import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TeacherDashboardScreen } from '../screens/teacher/TeacherDashboardScreen';
import { AssignmentsScreen } from '../screens/common/AssignmentsScreen';
import { AttendanceScreen } from '../screens/common/AttendanceScreen';
import { AnnouncementsScreen } from '../screens/common/AnnouncementsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
// ADDED Text IMPORT
import { Text } from 'react-native-paper'; 
import StudentListScreen from '../screens/common/StudentListScreen';

const Tab = createBottomTabNavigator();

export const TeacherNavigation: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#6200ee',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TeacherDashboardScreen}
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>📢</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>👤</Text>,
        }}
      />
      <Tab.Screen 
        name="Extra"
        component={StudentListScreen} // Placeholder component
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>⭐</Text>,
        }}
      />
    </Tab.Navigator>
  );
};