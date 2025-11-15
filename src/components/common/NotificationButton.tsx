import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native'; 

const NotificationButton: React.FC = () => {
    const navigation = useNavigation<any>(); 
    const { colors } = useTheme(); 

    const handlePress = () => {
        // Navigate to the screen registered in RootNavigation.tsx
        navigation.navigate('NotificationScreen'); 
    };
    
    // Placeholder for unread count, replace with actual logic (e.g., global state or Redux)
    const unreadCount = 5; 

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
            {/* Using Ionicons as a stand-in for IconBell */}
            <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={colors.text} 
            />
            {unreadCount > 0 && (
                <View style={[styles.badge]}>
                    <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 8,
        marginRight: 10,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        // Warning color from web code
        backgroundColor: '#FF9800', 
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        zIndex: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default NotificationButton;