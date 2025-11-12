import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import RNDashboardCard from '../../components/common/RNDashboardCard';
import { Notification } from '../../types/dashboard';
import { useNavigation } from '@react-navigation/native';
// import { userDetails } from 'utils/apiService'; // Assuming you have an RN-compatible userDetails util

// --- MOCK DATA/API SIMULATION ---
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'New policy update on attendance', message: 'Admin updated the attendance policy.', entityType: 'POLICY' },
  { id: 2, title: 'New holiday declared', message: 'School will be closed next Monday.', entityType: 'NOTIFICATION' },
  { id: 3, title: 'Fee payment reminder sent', message: 'Accountant sent fee reminders to parents.', entityType: 'FEE' },
];
// --- END MOCK DATA/API SIMULATION ---

const NotificationItem: React.FC<{ item: Notification }> = ({ item }) => {
  return (
    <View style={styles.notificationItem}>
        <MaterialIcons name="notifications" size={24} color="#1976d2" style={styles.icon} />
        <View style={styles.textContainer}>
            <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message || `A change occurred on entity type: ${item.entityType}.`}
            </Text>
        </View>
    </View>
  );
};

const LatestNotifications: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // const accountId = userDetails.getAccountId(); // Placeholder for actual user check

        setLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            setLatestNotifications(MOCK_NOTIFICATIONS);
            setLoading(false);
        }, 800);
    }, []);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No new notifications.</Text>
        </View>
    );

    const handleViewAll = () => {
        // @ts-ignore - Assuming 'NotificationsScreen' is defined in your router
        navigation.navigate('NotificationsScreen' as never);
    };

    return (
        <RNDashboardCard title={t('dashboard.latestNotificationsTitle')}>
            {loading ? (
                <ActivityIndicator size="large" color="#1976d2" style={{ paddingVertical: 20 }} />
            ) : latestNotifications.length > 0 ? (
                <View>
                    <FlatList
                        data={latestNotifications}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <NotificationItem item={item} />}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        scrollEnabled={false}
                    />
                    <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
                        <Text style={styles.viewAllText}>{t('dashboard.viewAllNotifications')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                renderEmpty()
            )}
        </RNDashboardCard>
    );
};

const styles = StyleSheet.create({
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 5,
    },
    icon: {
        marginRight: 10,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    notificationMessage: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 5,
    },
    viewAllButton: {
        marginTop: 15,
        alignItems: 'flex-end',
        paddingVertical: 5,
    },
    viewAllText: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: 'bold',
    },
    emptyContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6c757d',
        fontSize: 14,
    }
});

export default LatestNotifications;