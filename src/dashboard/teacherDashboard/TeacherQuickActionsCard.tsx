import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import RNDashboardCard from '../../components/common/RNDashboardCard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Helper component for an individual action button
interface ActionButtonProps {
    iconName: string;
    label: string;
    onPress: () => void;
    color: string;
    bgColor: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ iconName, label, onPress, color, bgColor }) => (
  <TouchableOpacity style={[styles.actionButton, {backgroundColor: bgColor}]} onPress={onPress}>
    <View style={[styles.iconContainer, {backgroundColor: bgColor}]}>
        {/* Using a custom style for the icon size and color */}
        <MaterialIcons name={iconName} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const TeacherQuickActionsCard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const navigation = useNavigation();

    // Map the web actions to React Native screens
    const actions = [
        {
            label: t('teacher.addNewAssignment'), 
            iconName: 'assignment',
            color: '#1976d2', // Primary
            bgColor: '#e3f2fd', // Primary Light
            route: 'AddAssignmentScreen'
        },
        {
            label: t('teacher.takeAttendance'), 
            iconName: 'check-circle-outline', 
            color: '#4CAF50', // Success
            bgColor: '#e8f5e9', // Success Light
            route: 'AddAttendance'
        },
        
        {
            label: t('teacher.createQuiz'),
            iconName: 'quiz',
            color: '#FF9800', // Warning
            bgColor: '#fff8e1', // Warning Light
            route: 'CreateQuizScreen'
        },
        {
            label: t('teacher.gradeAssignments'), 
            iconName: 'grading', 
            color: '#9C27B0', // Secondary
            bgColor: '#f3e5f5', // Secondary Light
            route: 'GradeAssignmentsScreen'
        },
    ];

    const handleAction = (screenName: string) => {
        // You MUST ensure these screen names are defined in your navigation stack
        // @ts-ignore - Ignoring type warning since we don't know the exact route list
        navigation.navigate(screenName as never); 
    };

    return (
        <RNDashboardCard title={t('teacherDashboard.quickActionsTitle')}>
            <View style={styles.actionsContainer}>
                {actions.map((action, index) => (
                    <ActionButton 
                        key={index}
                        iconName={action.iconName}
                        label={action.label}
                        onPress={() => handleAction(action.route)}
                        color={action.color}
                        bgColor={action.bgColor}
                    />
                ))}
            </View>
        </RNDashboardCard>
    );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#eee',
    // Mimics the hover/shadow transition 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, 
  },
  iconContainer: {
    // Replaces MUI Avatar styling
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});

export default TeacherQuickActionsCard;