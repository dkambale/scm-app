import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, FAB, Chip } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Announcement } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const AnnouncementsScreen: React.FC = () => {
  const { hasPermission } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await apiService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnnouncements();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {announcements.map((announcement) => (
          <Card key={announcement.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleLarge">{announcement.title}</Text>
                <Chip mode="outlined">{announcement.date}</Chip>
              </View>

              <Text variant="bodyMedium" style={styles.message}>
                {announcement.message}
              </Text>

              <View style={styles.footer}>
                <Chip icon="account-group" mode="flat">
                  {announcement.targetAudience === 'all' ? 'All' : announcement.targetAudience}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}

        {announcements.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No announcements yet</Text>
          </View>
        )}
      </ScrollView>

      {hasPermission('CREATE_ANNOUNCEMENTS') && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => console.log('Create announcement')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  message: {
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
