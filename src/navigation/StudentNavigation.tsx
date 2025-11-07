import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { AssignmentsScreen } from '../screens/admin/AssignmentsScreen';
import { AttendancesScreen } from '../screens/admin/AttendancesScreen';
import { FeesScreen } from '../screens/student/FeesScreen';
import { AnnouncementsScreen } from '../screens/common/AnnouncementsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

export const StudentNavigation: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#6200ee',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={StudentDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <span>📊</span>,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{
          tabBarIcon: ({ color }) => <span>📅</span>,
        }}
      />
   
      <Tab.Screen
        name="Fees"
        component={FeesScreen}
        options={{
          tabBarIcon: ({ color }) => <span>💰</span>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <span>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
};
