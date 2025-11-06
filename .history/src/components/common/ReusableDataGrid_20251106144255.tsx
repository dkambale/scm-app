import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Portal,
  Dialog,
  Searchbar,
  IconButton,
  useTheme,
  FAB, // Added FAB for the action button
  Menu,
  Chip,
} from "react-native-paper";
import ListGridFilters from "./ListGridFilters";
// translation helper removed (not used)
import { useNavigation } from "@react-navigation/native";
import api from "../../api";
import { storage } from "../../utils/storage";
import { LoadingSpinner } from "./LoadingSpinner";

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
  requestMethod?: "GET" | "POST";
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
  searchPlaceholder = "Search...",
  transformData,
  isPostRequest = true,
  requestMethod,
  filters = {},
  clientSideData = [],
  onDataChange,
  defaultPageSize = 10,
  sortBy = "asc",
}) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [gridFilters, setGridFilters] = useState<any>(filters);
  const [gridData, setGridData] = useState<any[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuVisibleFor, setMenuVisibleFor] = useState<Record<string, boolean>>(
    {}
  );
  const [pageSizeMenuVisible, setPageSizeMenuVisible] = useState(false);
  // translation hook removed (not used here)
  const latestFilters = useRef<any>(gridFilters);
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
  }, [gridFilters ,]);

  const isStudent = user?.type === "STUDENT";
  const isTeacher = user?.type === "TEACHER";
  const isAdmin = user?.type === "ADMIN";
  const teacherSchoolId = user?.schoolId ?? null;

  const fetchData = useCallback(async () => {
    if (!fetchUrl) {
      const filteredData = clientSideData.filter((item) => {
        let isMatch = true;
        if ((latestFilters.current as any).schoolId) {
          isMatch =
            isMatch &&
            item.schoolId === (latestFilters.current as any).schoolId;
        }
        if ((latestFilters.current as any).classId) {
          isMatch =
            isMatch && item.classId === (latestFilters.current as any).classId;
        }
        if ((latestFilters.current as any).divisionId) {
          isMatch =
            isMatch &&
            item.divisionId === (latestFilters.current as any).divisionId;
        }
        if (searchText) {
          isMatch =
            isMatch &&
            JSON.stringify(item)
              .toLowerCase()
              .includes(searchText.toLowerCase());
        }
        return isMatch;
      });
      const transformedFull = transformData
        ? filteredData.map(transformData)
        : filteredData;
      // Apply client-side pagination
      const page = paginationModel.page || 0;
      const size = paginationModel.pageSize || defaultPageSize;
      const start = page * size;
      const paged = transformedFull.slice(start, start + size);
      setGridData(paged);
      setRowCount(transformedFull.length);
      if (onDataChange) onDataChange(paged);
      return;
    }

    setLoading(true);
    try {
      let response;
      const method = (
        requestMethod || (isPostRequest ? "POST" : "GET")
      ).toUpperCase();
      const enforcedFilters: any = {};

      if (isStudent) {
        if (user.schoolId) enforcedFilters.schoolId = user.schoolId;
        if (user.classId) enforcedFilters.classId = user.classId;
        if (user.divisionId) enforcedFilters.divisionId = user.divisionId;
      }

      let teacherClassList: any[] = [];
      let teacherDivisionList: any[] = [];
      if (isTeacher && Array.isArray(user?.allocatedClasses)) {
        teacherClassList = Array.from(
          new Set(
            user.allocatedClasses.map((ac: any) => ac.classId).filter(Boolean)
          )
        );
        teacherDivisionList = Array.from(
          new Set(
            user.allocatedClasses
              .map((ac: any) => ac.divisionId)
              .filter(Boolean)
          )
        );
        if (teacherSchoolId != null) enforcedFilters.schoolId = teacherSchoolId;
      }

      const uiFilters: any = {};
      if (!(isAdmin && isInitialLoadRef.current)) {
        Object.assign(uiFilters, latestFilters.current);
      }

      const basePayload = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sortBy: "id",
        sortDir: sortBy,
        search: searchText,
      };

      const payload = { ...basePayload, ...uiFilters, ...enforcedFilters };

      if (uiFilters.classId || uiFilters.divisionId) {
        delete payload.classList;
        delete payload.divisionList;
      } else if (isTeacher) {
        if (teacherClassList.length) payload.classList = teacherClassList;
        if (teacherDivisionList.length)
          payload.divisionList = teacherDivisionList;
      }

      if (method === "POST") {
        response = await api.post(fetchUrl, payload);
      } else {
        response = await api.get(fetchUrl, { params: payload });
      }

      const responseData =
        response.data?.content || response.data?.data || response.data || [];
      const transformed = transformData
        ? responseData.map(transformData)
        : responseData;
      setGridData(transformed);
      setRowCount(response.data?.totalElements || responseData.length || 0);
      if (onDataChange) onDataChange(transformed);
    } catch (err: any) {
      console.error(`Failed to fetch data from ${fetchUrl}:`, err);
      Alert.alert(
        "Fetch Error",
        err.message || "An unexpected error occurred."
      );
      setGridData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
      if (isInitialLoadRef.current) isInitialLoadRef.current = false;
    }
  }, [
    fetchUrl,
    isPostRequest,
    requestMethod,
    searchText,
    transformData,
    clientSideData,
    paginationModel,
    isAdmin,
    isStudent,
    isTeacher,
    sortBy,
    teacherSchoolId,
    user,
    onDataChange,
    defaultPageSize,
  ]);

  useEffect(() => {
    // Ensure initial load and re-run when fetchData changes
    fetchData();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setGridFilters(newFilters);
    latestFilters.current = newFilters;
    setPaginationModel((p) => ({ ...p, page: 0 }));
    fetchData();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const handleAdd = () =>
    addActionUrl && navigation.navigate(addActionUrl as never);
  const handleEdit = (item: any) =>
    editUrl && (navigation as any).navigate(editUrl, { id: item.id });

  const showDeleteDialog = (id: string) => {
    setDeleteItemId(id);
    setDeleteDialogVisible(true);
  };
  const hideDeleteDialog = () => setDeleteDialogVisible(false);

  const handleDelete = async () => {
    if (deleteUrl && deleteItemId) {
      try {
        await api.post(deleteUrl, { id: deleteItemId });
        Alert.alert("Success", `${entityName} deleted successfully.`);
        fetchData();
      } catch (error: any) {
        Alert.alert("Delete Error", error.message || "Failed to delete item.");
      } finally {
        hideDeleteDialog();
      }
    }
  };

  // --- UI OVERHAUL ---

  const renderItem = ({ item }: { item: any }) => {
    const idKey =
      item.id || item._id || String(item[columns[0]?.key] || Math.random());
    const isExpanded = expandedId === idKey;

    const primaryColumnKey = columns[0]?.key;
    const primaryTitle = primaryColumnKey
      ? item[primaryColumnKey]
      : entityName || "Item";

    const openMenu = (key: string) =>
      setMenuVisibleFor((p) => ({ ...p, [key]: true }));
    const closeMenu = (key: string) =>
      setMenuVisibleFor((p) => ({ ...p, [key]: false }));

    return (
      <Card style={[styles.card, { backgroundColor: "#ffffff" }]} elevation={4}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text
                variant="labelLarge"
                style={{ color: "#111111", fontWeight: "700" }}
              >
                {primaryTitle}
              </Text>
              {/* small meta row */}
              <View style={styles.metaRow}>
                <Chip
                  mode="outlined"
                  style={[styles.idChip, { backgroundColor: "#f3f3f3" }]}
                >
                  {item.id || item._id || ""}
                </Chip>
                <Text style={{ marginLeft: 8, color: "#6b6b6b" }}>
                  {item.visibility || ""}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Menu
                visible={!!menuVisibleFor[idKey]}
                onDismiss={() => closeMenu(idKey)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => openMenu(idKey)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    closeMenu(idKey);
                    handleEdit(item);
                  }}
                  title="Edit"
                />
                <Menu.Item
                  onPress={() => {
                    closeMenu(idKey); /* manage visibility */
                  }}
                  title="View"
                />
                {deleteUrl && (
                  <Menu.Item
                    onPress={() => {
                      closeMenu(idKey);
                      showDeleteDialog(item.id || item._id);
                    }}
                    title="Delete"
                  />
                )}
              </Menu>
            </View>
          </View>

          {/* compact rows: show first 3 columns, expand to show rest */}
          {columns.slice(1, 4).map((col) => (
            <View key={col.key} style={styles.dataRow}>
              <Text variant="labelSmall" style={{ color: "#6b6b6b" }}>
                {col.header}
              </Text>
              <Text variant="bodyMedium" style={{ color: "#111111" }}>
                {item[col.key] ?? "—"}
              </Text>
            </View>
          ))}

          {isExpanded &&
            columns.slice(4).map((col) => (
              <View key={col.key} style={styles.dataRow}>
                <Text variant="labelSmall" style={{ color: "#6b6b6b" }}>
                  {col.header}
                </Text>
                <Text variant="bodyMedium" style={{ color: "#111111" }}>
                  {item[col.key] ?? "—"}
                </Text>
              </View>
            ))}

          <View style={styles.viewMoreRow}>
            <Button
              mode="text"
              onPress={() => setExpandedId(isExpanded ? null : idKey)}
            >
              {isExpanded ? "View less" : "View more"}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const showPagination = rowCount > paginationModel.pageSize;
  const isFirstPage = paginationModel.page === 0;
  const isLastPage =
    (paginationModel.page + 1) * paginationModel.pageSize >= rowCount;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#ffffff" }]}>
      {/* Search Bar with Shadow */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={searchPlaceholder}
          onChangeText={setSearchText}
          value={searchText}
          onBlur={fetchData}
          onSubmitEditing={fetchData}
          style={[styles.searchbar, { backgroundColor: "#ffffff" }]}
          inputStyle={{ minHeight: 0 }}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Filters: School / Class / Division */}
      <ListGridFilters
        filters={gridFilters}
        onFiltersChange={handleFiltersChange}
        schools={[]}
        classes={[]}
        divisions={[]}
        loading={loading}
      />

      {/* Main List Area */}
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={gridData}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.id?.toString() ?? Math.random().toString()
          }
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
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onBackground }}
              >
                No {entityName || "items"} found.
              </Text>
              <Button
                icon="reload"
                mode="text"
                onPress={onRefresh}
                style={{ marginTop: 10 }}
              >
                Reload Data
              </Button>
            </View>
          }
          ListFooterComponent={
            showPagination
              ? () => (
                  <View
                    style={[
                      styles.pagination,
                      { borderTopColor: theme.colors.outlineVariant },
                    ]}
                  >
                    <Button
                      disabled={isFirstPage}
                      onPress={() =>
                        setPaginationModel((p) => ({ ...p, page: p.page - 1 }))
                      }
                      icon="chevron-left"
                      mode="text"
                      compact
                    >
                      Previous
                    </Button>
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Page {paginationModel.page + 1} of{" "}
                      {Math.ceil(rowCount / paginationModel.pageSize)}
                    </Text>
                    <Button
                      disabled={isLastPage}
                      onPress={() =>
                        setPaginationModel((p) => ({ ...p, page: p.page + 1 }))
                      }
                      icon="chevron-right"
                      mode="text"
                      compact
                      contentStyle={{ flexDirection: "row-reverse" }} // Right-align icon on next button
                    >
                      Next
                    </Button>
                  </View>
                )
              : null
          }
        />
      )}

      {/* FAB (Floating Action Button) for Add Action */}
      {addActionUrl && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={handleAdd}
          color={theme.colors.onPrimary}
        />
      )}

      {/* Floating Prev/Next pager (centered above FAB) */}
      <View style={styles.pagerContainer} pointerEvents="box-none">
        <IconButton
          icon="chevron-left"
          size={28}
          onPress={() =>
            setPaginationModel((p) => ({ ...p, page: Math.max(0, p.page - 1) }))
          }
          disabled={isFirstPage}
          accessibilityLabel="Previous page"
          iconColor={isFirstPage ? "#cccccc" : theme.colors.primary}
        />
          <View style={styles.pagerCenter}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
              Page {paginationModel.page + 1} of {Math.max(1, Math.ceil(rowCount / paginationModel.pageSize))}
            </Text>
            <Menu
              visible={pageSizeMenuVisible}
              onDismiss={() => setPageSizeMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setPageSizeMenuVisible(true)} compact>
                  {paginationModel.pageSize} / page
                </Button>
              }
            >
              {[10, 25, 50].map((s) => (
                <Menu.Item
                  key={s}
                  onPress={() => {
                    // change page size and reset to first page; fetch will occur via effect
                    setPaginationModel((p) => ({ ...p, page: 0, pageSize: s }));
                    setPageSizeMenuVisible(false);
                  }}
                  title={`${s} per page`}
                />
              ))}
            </Menu>
          </View>
          <IconButton
            icon="chevron-right"
            size={28}
            onPress={() =>
              setPaginationModel((p) => ({ ...p, page: p.page + 1 }))
            }
            disabled={isLastPage}
            accessibilityLabel="Next page"
            iconColor={isLastPage ? "#cccccc" : theme.colors.primary}
          />
      </View>

      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title style={{ color: theme.colors.error }}>
            Confirm Delete
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this **{entityName || "item"}**?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog} mode="outlined">
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              mode="contained"
              buttonColor={theme.colors.error}
            >
              Delete
            </Button>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, // Subtle separator
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  searchbar: {
    borderRadius: 10,
    elevation: 3, // Floating search bar effect
    height: 48,
  },
  pagerContainer: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for the FAB
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2, // Lighter shadow for a modern flat look
    overflow: "hidden",
  },
  cardContent: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "center",
  },
  dataValueContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 12,
    paddingBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 10, // Ensure FAB floats above the list
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  idChip: {
    borderRadius: 6,
    paddingHorizontal: 6,
    height: 26,
    alignSelf: "flex-start",
  },
  headerActions: {
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  viewMoreRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  pagerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    elevation: 4,
    marginHorizontal: 8,
  },
  pagerCenter: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
  },
});
