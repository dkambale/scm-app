import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { TimetableScreen } from '../screens/student/TimetableScreen';
import { AssignmentsScreen } from '../screens/common/AssignmentsScreen';
import { AttendanceScreen } from '../screens/common/AttendanceScreen';
import { FeesScreen } from '../screens/student/FeesScreen';
import { AnnouncementsScreen } from '../screens/common/AnnouncementsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
// ADDED Text IMPORT
import { Text } from 'react-native-paper'; 

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
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>📊</Text>,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Timetable"
        component={TimetableScreen}
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
        name="Fees"
        component={FeesScreen}
        options={{
          // REPLACED <span> WITH <Text>
          tabBarIcon: ({ color }) => <Text>💰</Text>,
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
    </Tab.Navigator>
  );
};