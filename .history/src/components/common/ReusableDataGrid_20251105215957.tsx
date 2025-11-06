import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView, // Added for better screen handling
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  Searchbar,
  ActivityIndicator,
  IconButton,
  Divider, // Added for visual separation
  useTheme, // Added for theme support
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
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
  const theme = useTheme(); // Use theme for better styling integration
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

  // Language modal logic removed as requested to not interrupt in login/auth flow.

  const latestFilters = useRef(gridFilters);
  const isInitialLoadRef = useRef(true);

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
  }, [gridFilters]);

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
  }, []); // Dependency array updated to include fetchData

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const handleAdd = () => addActionUrl && navigation.navigate(addActionUrl as never);
  // FIX: Pass item.id as a parameter object
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

  const renderItem = ({ item }: { item: any }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <Card.Content>
            {columns.map((col, index) => (
                <View key={col.key} style={styles.row}>
                    <Text variant="labelLarge" style={[styles.headerText, { color: theme.colors.onSurfaceVariant }]}>{col.header}:</Text>
                    <View style={styles.valueContainer}>
                      {col.renderCell ? col.renderCell(item) : <Text style={[styles.valueText, { color: theme.colors.onSurface }]}>{item[col.key]}</Text>}
                    </View>
                </View>
            ))}
            <Divider style={{ marginVertical: 10 }} />
            <View style={styles.actions}>
                {editUrl && <Button icon="pencil" mode="contained" onPress={() => handleEdit(item)} style={styles.actionButton}>Edit</Button>}
                {deleteUrl && <Button icon="delete" mode="outlined" buttonColor={theme.colors.error} textColor={theme.colors.onError} onPress={() => showDeleteDialog(item.id)} style={styles.actionButton}>Delete</Button>}
            </View>
        </Card.Content>
    </Card>
  );

  const showPagination = rowCount > paginationModel.pageSize;
  const isFirstPage = paginationModel.page === 0;
  const isLastPage = (paginationModel.page + 1) * paginationModel.pageSize >= rowCount;


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContainer}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{title}</Text>
            <IconButton 
              icon="refresh" 
              size={24} 
              onPress={onRefresh} 
              loading={refreshing}
              iconColor={theme.colors.primary}
            />
        </View>
        <View style={styles.searchAndAddContainer}>
          <Searchbar
            placeholder={searchPlaceholder}
            onChangeText={setSearchText}
            value={searchText}
            onBlur={fetchData} // Trigger fetch on search blur for better performance
            onSubmitEditing={fetchData} // Trigger fetch on enter
            style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
            inputStyle={{ minHeight: 0 }} // Reduce searchbar height
          />
          {addActionUrl && (
              <Button 
                icon="plus" 
                mode="contained" 
                onPress={handleAdd} 
                style={[styles.addButton, { backgroundColor: theme.colors.secondaryContainer }]}
                contentStyle={styles.addButtonContent}
                labelStyle={{ color: theme.colors.onSecondaryContainer }}
                // compact // Removed to keep button size consistent
              />
          )}
        </View>
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
              <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>No {entityName || 'items'} found.</Text>
              <Button icon="reload" mode="text" onPress={onRefresh} style={{ marginTop: 10 }}>Reload Data</Button>
            </View>
          }
          ListFooterComponent={showPagination ? () => (
            <View style={styles.pagination}>
              <Button 
                disabled={isFirstPage} 
                onPress={() => setPaginationModel(p => ({...p, page: p.page - 1}))}
                icon="chevron-left"
                mode="outlined"
              >
                Previous
              </Button>
              <Text variant="bodyLarge" style={{ color: theme.colors.onBackground }}>Page {paginationModel.page + 1} of {Math.ceil(rowCount / paginationModel.pageSize)}</Text>
              <Button 
                disabled={isLastPage} 
                onPress={() => setPaginationModel(p => ({...p, page: p.page + 1}))}
                icon="chevron-right"
                mode="outlined"
              >
                Next
              </Button>
            </View>
          ) : null}
        />
      )}
      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title style={{ color: theme.colors.error }}>Confirm Delete</Dialog.Title>
          <Dialog.Content><Text variant="bodyMedium">Are you sure you want to delete this **{entityName || 'item'}**?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog} mode="text">Cancel</Button>
            <Button onPress={handleDelete} mode="contained" buttonColor={theme.colors.error} textColor={theme.colors.onError}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create