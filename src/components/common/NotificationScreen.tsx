import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import apiService, { userDetails } from '../../utils/apiService'; 
import NotificationListItem from '../../components/common/NotificationListItem'; 
// Assuming this is the correct default export based on your file list:
import { LoadingSpinner } from './LoadingSpinner';

interface NotificationItem {
    id: string | number;
    entityType?: string;
    action?: string;
    user?: string;
    entityName?: string;
    createdAt?: string;
}

const PAGE_SIZE = 5;

const NotificationScreen: React.FC = () => {
    const { colors } = useTheme(); 
    
    const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchNotifications = useCallback(async (page: number, append: boolean = false) => {
        // --- FIX for [object Promise] START ---
        // Await the asynchronous call to getAccountId()
        const accountId = await userDetails.getAccountId(); 
        if (!accountId) {
             console.error("Account ID not available. Cannot fetch notifications.");
             setIsLoading(false);
             setIsFetchingMore(false);
             return;
        }
        // --- FIX for [object Promise] END ---
        
        if (page === 0) setIsLoading(true);
        else setIsFetchingMore(true);

        const pagination = {
            page: page, 
            size: PAGE_SIZE,
            sortBy: "id",
            sortDir: "desc",
            search: ""
        };

        try {
            // Use the awaited accountId in the URL
            const response = await apiService.post(`api/auditlogs/getAll/${accountId}`, pagination);
            const newNotifications = response.data?.content || [];
            
            setNotificationList(prevList => append ? [...prevList, ...newNotifications] : newNotifications);
            setRowCount(response.data?.totalElements || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            Alert.alert("Error", "Failed to load notifications.");
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, []); // Empty dependency array is fine since userDetails.getAccountId is a stable utility

    // The handleMarkAllAsRead function also needs the same fix
    const handleMarkAllAsRead = async () => {
        const accountId = await userDetails.getAccountId();
        if (!accountId) {
            Alert.alert("Error", "User account not logged in.");
            return;
        }

        setIsLoading(true);
        try {
            await apiService.post(`/api/auditlogs/markallread/${accountId}`);
            Alert.alert("Success", "All notifications marked as read.");
            // Refresh the list after marking as read
            fetchNotifications(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            Alert.alert("Error", "Failed to mark notifications as read.");
            setIsLoading(false); 
        } 
    };

    useEffect(() => {
        // Run initial fetch
        fetchNotifications(0);
    }, [fetchNotifications]);

    const handleLoadMore = () => {
        const hasMore = notificationList.length < rowCount;
        if (!isLoading && !isFetchingMore && hasMore) {
            fetchNotifications(currentPage + 1, true); 
        }
    };

    const handleNotificationPress = (notification: NotificationItem) => {
        Alert.alert("Notification Clicked", `You pressed notification ID: ${notification.id}`);
    };

    const renderFooter = () => {
        if (isFetchingMore) {
            return (
                <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ marginLeft: 8, color: colors.text }}>Loading More...</Text>
                </View>
            );
        }
        
        if (notificationList.length > 0 && notificationList.length === rowCount) {
             return (
                <View style={styles.endOfListContainer}>
                    <Text style={{color: colors.text, opacity: 0.5}}>No more notifications</Text>
                </View>
             )
        }
        return <View style={{height: 40}}/>;
    };

    if (isLoading && notificationList.length === 0) {
        // This relies on LoadingSpinner being correctly exported as default
        return <LoadingSpinner />; 
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>All Notification</Text>
                    <View style={[styles.badge]}>
                        <Text style={styles.badgeText}>{rowCount}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleMarkAllAsRead} disabled={isLoading || notificationList.length === 0}>
                    <Text style={[styles.markAllRead, { color: colors.primary }]}>
                        Mark as all read
                    </Text>
                </TouchableOpacity>
            </View>

            {notificationList.length > 0 ? (
                <FlatList
                    data={notificationList}
                    renderItem={({ item }) => <NotificationListItem notification={item} onPress={handleNotificationPress} />}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleLoadMore} 
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={{ color: colors.text }}>You have no notifications.</Text>
                </View>
            )}
        </View>
    );
};

// ... (Styles)


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: 'white', 
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF9800', // Warning color from web code
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    markAllRead: {
        fontSize: 14,
        fontWeight: '500',
    },
    loadingMoreContainer: {
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    endOfListContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default NotificationScreen;