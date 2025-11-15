import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// Assuming you use @expo/vector-icons (Ionicons is common in Expo)
import { Ionicons } from '@expo/vector-icons'; 
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface NotificationItem {
    id: string | number;
    entityType?: 'STUDENT' | 'TEACHER' | 'ASSIGNMENT' | 'SCHOOL' | 'EXAM' | string;
    action?: string;
    user?: string;
    entityName?: string;
    createdAt?: string; // ISO date string
}

interface NotificationListItemProps {
    notification: NotificationItem;
    onPress?: (notification: NotificationItem) => void;
}

// Helper function to map entity types to icons and colors
const getNotificationConfig = (entityType: string | undefined) => {
    // Simplified color approximations for React Native styling
    const colors = {
        primary: '#2196F3', // Blue
        secondary: '#9C27B0', // Purple
        success: '#4CAF50', // Green
        warning: '#FF9800', // Orange
        error: '#F44336', // Red
        defaultGrey: '#757575',
        lightPrimary: '#E3F2FD',
        lightSecondary: '#F3E5F5',
        lightSuccess: '#E8F5E9',
        lightWarning: '#FFF3E0',
        lightError: '#FFEBEE',
        lightGrey: '#F5F5F5'
    };

    switch (entityType?.toUpperCase()) {
        case 'STUDENT':
            return { iconName: 'person', color: colors.primary, bgColor: colors.lightPrimary };
        case 'TEACHER':
            return { iconName: 'people', color: colors.secondary, bgColor: colors.lightSecondary };
        case 'ASSIGNMENT':
            return { iconName: 'clipboard', color: colors.success, bgColor: colors.lightSuccess };
        case 'SCHOOL':
            return { iconName: 'school', color: colors.warning, bgColor: colors.lightWarning };
        case 'EXAM':
            return { iconName: 'document-text', color: colors.error, bgColor: colors.lightError };
        default:
            return { iconName: 'book', color: colors.defaultGrey, bgColor: colors.lightGrey };
    }
};

// Helper to format the message (direct translation from web code)
const formatNotificationMessage = (notification: NotificationItem) => {
    const { entityType, action, user, entityName } = notification;
    const userName = user || 'A user';
    const actionText = action ? action.toLowerCase().replace(/_/g, ' ') : 'modified';
        
    // Note: The original message format seems slightly broken: `...system.with name ${entityName}`
    // I am fixing it to look better on a mobile screen.
    return `${userName} ${actionText} a record in ${entityType || 'the system'} ${entityName ? `(Name: ${entityName})` : ''}`;
};


const NotificationListItem: React.FC<NotificationListItemProps> = ({ notification, onPress }) => {
    const config = getNotificationConfig(notification.entityType);
    const message = formatNotificationMessage(notification);
    const timeAgo = notification.createdAt ? dayjs(notification.createdAt).fromNow() : '';
    
    const textColor = '#212121'; // Dark text color

    return (
        <TouchableOpacity 
            style={[styles.itemContainer]}
            onPress={() => onPress && onPress(notification)}
        >
            <View style={[styles.avatarContainer, { backgroundColor: config.bgColor }]}>
                {/* Use the dynamically determined icon */}
                <Ionicons name={config.iconName as any} size={24} color={config.color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.entityType, { color: textColor }]}>
                    {notification.entityType}
                </Text>
                <Text style={[styles.message, { color: textColor }]}>
                    {message}
                </Text>
                <Text style={[styles.timeAgo, { color: textColor }]}>
                    {timeAgo}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0', // Light border
        backgroundColor: 'white', 
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        // Shadow for a card-like effect if desired
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    entityType: {
        fontSize: 14,
        fontWeight: '700', 
    },
    message: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 18,
    },
    timeAgo: {
        fontSize: 10,
        marginTop: 4,
        opacity: 0.6,
    }
});

export default NotificationListItem;