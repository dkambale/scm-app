import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  Searchbar,
  IconButton,
  Divider,
  useTheme,
  FAB,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import api from '../../api';
import { storage } from '../../utils/storage';
import { LoadingSpinner } from './LoadingSpinner';

interface Column {
  key: string;
  header: string;
  renderCell?: (item: any) => React.ReactNode;
}

interface ReusableDataGridProps {
  title: string;
  fetchUrl?: string;
  columns: Column[];
  addActionUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
  entityName?: string;
  searchPlaceholder?: string;
  transformData?: (data: any) => any;
  isPostRequest?: boolean;
  requestMethod?: 'GET' | 'POST';
  filters?: object;
  clientSideData?: any[];
  onDataChange?: (data: any[]) => void;
  defaultPageSize?: number;
  sortBy?: string;
}

export const ReusableDataGrid: React.FC<ReusableDataGridProps> = ({
  title,
  fetchUrl,
  columns,
  addActionUrl,
  editUrl,
  deleteUrl,
  entityName,
  searchPlaceholder = 'Search...',
  transformData,
  isPostRequest = true,
  requestMethod,
  filters = {},
  clientSideData = [],
  onDataChange,
  defaultPageSize = 10,
  sortBy = 'asc',
}) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: defaultPageSize });
  const [rowCount, setRowCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [gridFilters, setGridFilters] = useState(filters);
  const [gridData, setGridData] = useState([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { t } = useTranslation('datagrid');

  const latestFilters = useRef(gridFilters);
  const isInitialLoadRef = useRef(true);

  // --- LOGIC (UNMODIFIED) ---

  useEffect(() => {
    const fetchUser = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed?.data?.user || parsed?.data);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    latestFilters.current = gridFilters;
  }, []);

  const isStudent = user?.type === 'STUDENT';
  const isTeacher = user?.type === 'TEACHER';
  const isAdmin = user?.type === 'ADMIN';
  const teacherSchoolId = user?.schoolId ?? null;

  const fetchData = useCallback(async () => {
    if (!fetchUrl) {
      const filteredData = clientSideData.filter((item) => {
        let isMatch = true;
        if (latestFilters.current.schoolId) {
          isMatch = isMatch && item.schoolId == latestFilters.current.schoolId;
        }
        if (latestFilters.current.classId) {
          isMatch = isMatch && item.classId == latestFilters.current.classId;
        }
        if (latestFilters.current.divisionId) {
          isMatch = isMatch && item.divisionId == latestFilters.current.divisionId;
        }
        if (searchText) {
          isMatch = isMatch && JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase());
        }
        return isMatch;
      });
      const transformed = transformData ? filteredData.map(transformData) : filteredData;
      setGridData(transformed);
      setRowCount(transformed.length);
      if (onDataChange) onDataChange(transformed);
      return;
    }

    setLoading(true);
    try {
      let response;
      const method = (requestMethod || (isPostRequest ? 'POST' : 'GET')).toUpperCase();
      const enforcedFilters: any = {};

      if (isStudent) {
        if (user.schoolId) enforcedFilters.schoolId = user.schoolId;
        if (user.classId) enforcedFilters.classId = user.classId;
        if (user.divisionId) enforcedFilters.divisionId = user.divisionId;
      }

      let teacherClassList = [];
      let teacherDivisionList = [];
      if (isTeacher && Array.isArray(user?.allocatedClasses)) {
        teacherClassList = Array.from(new Set(user.allocatedClasses.map((ac: any) => ac.classId).filter(Boolean)));
        teacherDivisionList = Array.from(new Set(user.allocatedClasses.map((ac: any) => ac.divisionId).filter(Boolean)));
        if (teacherSchoolId != null) enforcedFilters.schoolId = teacherSchoolId;
      }

      const uiFilters: any = {};
      if (!(isAdmin && isInitialLoadRef.current)) {
        Object.assign(uiFilters, latestFilters.current);
      }

      const basePayload = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sortBy: 'id',
        sortDir: sortBy,
        search: searchText
      };

      const payload = { ...basePayload, ...uiFilters, ...enforcedFilters };

      if (uiFilters.classId || uiFilters.divisionId) {
        delete payload.classList;
        delete payload.divisionList;
      } else if (isTeacher) {
        if (teacherClassList.length) payload.classList = teacherClassList;
        if (teacherDivisionList.length) payload.divisionList = teacherDivisionList;
      }

      if (method === 'POST') {
        response = await api.post(fetchUrl, payload);
      } else {
        response = await api.get(fetchUrl, { params: payload });
      }

      const responseData = response.data?.content || response.data?.data || response.data || [];
      const transformed = transformData ? responseData.map(transformData) : responseData;
      setGridData(transformed);
      setRowCount(response.data?.totalElements || responseData.length || 0);
      if (onDataChange) onDataChange(transformed);

    } catch (err: any) {
      console.error(`Failed to fetch data from ${fetchUrl}:`, err);
      Alert.alert('Fetch Error', err.message || 'An unexpected error occurred.');
      setGridData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
      if (isInitialLoadRef.current) isInitialLoadRef.current = false;
    }
  }, [
    fetchUrl, isPostRequest, requestMethod, searchText, transformData,
    clientSideData, paginationModel, isAdmin, isStudent, isTeacher, sortBy,
    teacherSchoolId, user, onDataChange
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const handleAdd = () => addActionUrl && navigation.navigate(addActionUrl as never);
  const handleEdit = (item: any) => editUrl && navigation.navigate(editUrl as never, { id: item.id } as never);
  
  const showDeleteDialog = (id: string) => {
    setDeleteItemId(id);
    setDeleteDialogVisible(true);
  };
  const hideDeleteDialog = () => setDeleteDialogVisible(false);

  const handleDelete = async () => {
    if (deleteUrl && deleteItemId) {
      try {
        await api.post(deleteUrl, { id: deleteItemId });
        Alert.alert('Success', `${entityName} deleted successfully.`);
        fetchData();
      } catch (error: any) {
        Alert.alert('Delete Error', error.message || 'Failed to delete item.');
      } finally {
        hideDeleteDialog();
      }
    }
  };

  // --- UI OVERHAUL (Dark Theme Adaptation) ---

  const renderItem = ({ item }: { item: any }) => {
    const primaryColumnKey = columns[0]?.key;
    const primaryTitle = primaryColumnKey ? item[primaryColumnKey] : entityName || 'Item';
    const secondaryColumn = columns.length > 1 ? columns[1] : null;

    return (
      <Card 
        style={[styles.card, { backgroundColor: theme.colors.surface || '#222222' }]} // Dark Card background
        elevation={4}
        onPress={() => editUrl && handleEdit(item)}
      >
        <Card.Title 
          title={primaryTitle}
          subtitle={secondaryColumn ? `${secondaryColumn.header}: ${item[secondaryColumn.key]}` : entityName}
          titleStyle={[styles.cardTitle, { color: theme.colors.primary }]}
          subtitleStyle={{ color: theme.colors.onSurfaceVariant || 'lightgray' }}
          left={(props) => <IconButton {...props} icon="information-outline" iconColor={theme.colors.primary} />}
        />
        <Card.Content style={styles.cardContent}>
          {columns.slice(secondaryColumn ? 2 : 1).map((col) => ( // Render remaining columns
            <View key={col.key} style={styles.dataRow}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant || 'lightgray' }}>{col.header}</Text>
                <View style={styles.dataValueContainer}>
                  {col.renderCell ? col.renderCell(item) : <Text variant="bodyMedium" style={{ color: theme.colors.onSurface || 'white' }}>{item[col.key]}</Text>}
                </View>
            </View>
          ))}
        </Card.Content>
        <Divider style={{ marginHorizontal: 16, backgroundColor: theme.colors.outlineVariant || 'rgba(255, 255, 255, 0.2)' }} />
        <Card.Actions style={styles.actions}>
            {editUrl && (
              <Button 
                icon="pencil" 
                mode="text" 
                textColor={theme.colors.primary} 
                onPress={(e) => { e.stopPropagation(); handleEdit(item); }} 
              >
                Edit
              </Button>
            )}
            {deleteUrl && (
              <Button 
                icon="delete" 
                mode="text" 
                textColor={theme.colors.error} 
                onPress={(e) => { e.stopPropagation(); showDeleteDialog(item.id); }}
              >
                Delete
              </Button>
            )}
        </Card.Actions>
      </Card>
    );
  };

  const showPagination = rowCount > paginationModel.pageSize;
  const isFirstPage = paginationModel.page === 0;
  const isLastPage = (paginationModel.page + 1) * paginationModel.pageSize >= rowCount;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background || '#000000' }]}>
        
        {/* Sticky Header with Title and Refresh */}
        <View style={[styles.headerContainer, { 
          backgroundColor: theme.colors.elevation.level2 || '#1a1a1a', 
          borderBottomColor: theme.colors.outlineVariant || 'rgba(255, 255, 255, 0.2)' 
        }]}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onSurface || 'white' }}>{title}</Text>
            <IconButton 
              icon="reload" 
              size={24} 
              onPress={onRefresh} 
              loading={refreshing}
              iconColor={theme.colors.primary}
            />
        </View>

        {/* Search Bar with Dark Theme Styling */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder={searchPlaceholder}
            onChangeText={setSearchText}
            value={searchText}
            onBlur={fetchData}
            onSubmitEditing={fetchData}
            // Explicitly set colors for dark theme contrast
            placeholderTextColor={theme.colors.onSurfaceVariant || 'lightgray'}
            iconColor={theme.colors.onSurfaceVariant || 'lightgray'}
            inputStyle={{ 
                color: theme.colors.onSurface || 'white', // Input text color
                minHeight: 0 
            }}
            style={[styles.searchbar, { backgroundColor: theme.colors.surface || '#222222' }]}
          />
        </View>

      {/* Main List Area */}
      {loading && !refreshing ? <LoadingSpinner /> : (
        <FlatList
          data={gridData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium" style={{ color: theme.colors.onBackground || 'white' }}>No {entityName || 'items'} found.</Text>
              <Button icon="reload" mode="text" onPress={onRefresh} style={{ marginTop: 10 }} textColor={theme.colors.primary}>Reload Data</Button>
            </View>
          }
          ListFooterComponent={showPagination ? () => (
            <View style={[styles.pagination, { borderTopColor: theme.colors.outlineVariant || 'rgba(255, 255, 255, 0.2)' }]}>
              <Button 
                disabled={isFirstPage} 
                onPress={() => setPaginationModel(p => ({...p, page: p.page - 1}))}
                icon="chevron-left"
                mode="text"
                compact
                textColor={theme.colors.primary}
              >
                Previous
              </Button>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant || 'lightgray' }}>
                Page {paginationModel.page + 1} of {Math.ceil(rowCount / paginationModel.pageSize)}
              </Text>
              <Button 
                disabled={isLastPage} 
                onPress={() => setPaginationModel(p => ({...p, page: p.page + 1}))}
                icon="chevron-right"
                mode="text"
                compact
                contentStyle={{ flexDirection: 'row-reverse' }}
                textColor={theme.colors.primary}
              >
                Next
              </Button>
            </View>
          ) : null}
        />
      )}

      {/* FAB (Floating Action Button) for Add Action */}
      {addActionUrl && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={handleAdd}
          color={theme.colors.onPrimary || 'white'}
        />
      )}

      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={hideDeleteDialog} style={{ backgroundColor: theme.colors.surface }}>
          <Dialog.Title style={{ color: theme.colors.error }}>Confirm Delete</Dialog.Title>
          <Dialog.Content><Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Are you sure you want to delete this **{entityName || 'item'}**?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog} mode="outlined" textColor={theme.colors.onSurface}>Cancel</Button>
            <Button onPress={handleDelete} mode="contained" buttonColor={theme.colors.error} textColor={theme.colors.onError}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12, 
    paddingTop: 8,
  },
  searchbar: {
    borderRadius: 10,
    elevation: 3,
    height: 48,
  },
  listContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: 'bold', 
  },
  cardContent: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  dataRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 6,
    alignItems: 'center',
  },
  dataValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingRight: 12,
    paddingBottom: 12,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 80,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Light border for dark theme
  },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: 16,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 6,
  },
});