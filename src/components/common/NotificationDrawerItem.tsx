import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationDrawerItemProps {
    unreadCount: number; // For the badge
}

const NotificationDrawerItem: React.FC<NotificationDrawerItemProps> = ({ unreadCount }) => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
        // This navigates to the screen we registered in RootNavigation.tsx
        // And importantly, it closes the drawer automatically.
        navigation.navigate('NotificationScreen');
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.innerContainer}>
                <View style={styles.iconBox}>
                    <Ionicons name="notifications-outline" size={24} color="#0A0A0A" />
                </View>
                <Text style={styles.label}>Notifications</Text>
            </View>
            
            {/* Notification Badge / Count */}
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f2f8fb', // Light background to make it stand out
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    label: {
        color: '#0A0A0A',
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: '#FF9800', // Warning color
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default NotificationDrawerItem;