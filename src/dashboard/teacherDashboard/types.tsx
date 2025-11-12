import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

// --- General Dashboard Types ---
export type RNStyle = ViewStyle | TextStyle | ImageStyle;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student' | 'admin';
  attendancePercentage?: number;
  presentDays?: number;
  absentDays?: number;
}

export interface TeacherAssignmentData {
  category: string;
  total: number;
  graded: number;
}

export interface ClassInfo {
  id: string;
  name: string;
}

// --- Specific Card Data Types ---

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