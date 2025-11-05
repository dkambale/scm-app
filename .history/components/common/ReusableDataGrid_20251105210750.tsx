// app/src/components/common/ReusableDataGrid.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import {
  // Gluestack-UI Imports
  Card,
  Text,
  Button,
  ButtonText,
  ButtonIcon,
  HStack, // Horizontal Stack
  VStack, // Vertical Stack
  Box, // Generic container (replaces View)
  Spinner, // Replaces ActivityIndicator
  Pressable, // Used for interactive elements
  Icon, // For displaying icons
  Heading, // Replaces Text for title/header
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@gluestack-ui/themed";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PackageXIcon,
} from "lucide-react-native"; // Lucide icons for gluestack
import { useNavigation } from "@react-navigation/native";
// Assuming 'api' is the axios client instance exported from your utility file
import { api } from "../../utils/apiService";
import { LoadingSpinner } from "./LoadingSpinner"; // Keep this for initial full-screen load

// --- TYPES ---

interface Column {
  key: string; // Key in the data object (must match API field name)
  header: string; // Displayed label for the column
  renderCell?: (item: any) => React.ReactNode; // Custom renderer for cell content
  isAction?: boolean; // If true, this column contains action buttons (Edit/Delete)
}

interface DataGridProps {
  title: string;
  columns: Column[];
  fetchUrl: string; // API endpoint for fetching data (e.g., '/api/students')
  deleteUrl?: string; // API endpoint prefix for deleting (e.g., '/api/students/')
  addRoute?: string; // Name of the React Navigation route for the Add/Create screen
  editRoute?: string; // Name of the React Navigation route for the Edit screen
  initialFilters?: Record<string, any>; // Optional filters to send with fetch API
  pageSize?: number;
}

// --- CONSTANTS ---
const PAGE_SIZE = 10;

const ReusableDataGrid: React.FC<DataGridProps> = ({
  title,
  columns,
  fetchUrl,
  deleteUrl,
  addRoute,
  editRoute,
  initialFilters = {},
  pageSize = PAGE_SIZE,
}) => {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Function to fetch data from the API
  const fetchData = useCallback(
    async (pageToFetch: number, isRefreshing = false) => {
      if (pageToFetch > totalPages && !isRefreshing) return;

      if (isRefreshing || pageToFetch === 1) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }

      try {
        const params = {
          page: pageToFetch,
          limit: pageSize,
          ...initialFilters,
        };

        const response = await api.get(fetchUrl, { params });

        const newItems = response.data?.data || [];
        const totalPagesFromApi = response.data?.totalPages || 1;

        setData((prevData) => {
          if (isRefreshing || pageToFetch === 1) {
            return newItems;
          } else {
            return [...prevData, ...newItems];
          }
        });
        setTotalPages(totalPagesFromApi);
        setPage(pageToFetch);
      } catch (err: any) {
        console.error("Data Fetch Error:", err.response?.data || err.message);
        const errorMessage =
          err.response?.data?.message || "Failed to fetch data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchUrl, pageSize, initialFilters, totalPages]
  );

  useEffect(() => {
    fetchData(1, true);
  }, [fetchUrl]);

  const handleLoadMore = () => {
    if (!loading && !refreshing && page < totalPages) {
      fetchData(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchData(1, true);
  };

  // --- CRUD HANDLERS ---
  const handleEdit = (item: any) => {
    if (editRoute) {
      navigation.navigate(
        editRoute as never,
        { id: item._id, data: item } as never
      );
    } else {
      Alert.alert(
        "Configuration Error",
        "Edit route not configured for this data grid."
      );
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || !deleteUrl) {
      setShowDeleteDialog(false);
      return;
    }

    setLoading(true);
    setShowDeleteDialog(false);

    try {
      await api.delete(`${deleteUrl}${itemToDelete._id}`);

      Alert.alert("Success", `${title.slice(0, -1)} deleted successfully.`);
      fetchData(1, true);
    } catch (err: any) {
      console.error("Delete Error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message ||
        `Failed to delete ${title.slice(0, -1)}.`;
      Alert.alert("Error", errorMessage);
      setLoading(false);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };
  // -------------------------

  // Custom component for each row/card
  const renderItem = ({ item }: { item: any }) => (
    <Card
      size="md"
      variant="elevated"
      className="mb-3 p-3 bg-white" // Gluestack styling with NativeWind
      onPress={() => editRoute && handleEdit(item)}
    >
      <VStack space="xs">
        {columns.map((column) => (
          <HStack
            key={column.key}
            // Two-column layout with separator
            className="justify-between items-start py-1 border-b border-b-gray-200"
          >
            {/* Header/Label */}
            <Text className="font-bold text-gray-700 w-2/5 text-sm">
              {column.header}:
            </Text>

            {/* Value/Actions Container */}
            <Box className="w-3/5 flex-row justify-end items-center">
              {column.isAction ? (
                // Render Action Buttons
                <HStack space="sm">
                  {/* Default Edit Action */}
                  {editRoute && (
                    <Pressable
                      onPress={() => handleEdit(item)}
                      className="p-1"
                    >
                      <Icon as={PencilIcon} className="w-5 h-5 text-blue-500" />
                    </Pressable>
                  )}
                  {/* Default Delete Action */}
                  {deleteUrl && (
                    <Pressable
                      onPress={() => handleOpenDeleteDialog(item)}
                      className="p-1"
                    >
                      <Icon as={TrashIcon} className="w-5 h-5 text-red-500" />
                    </Pressable>
                  )}
                  {/* Custom renderCell for the action column can add more buttons */}
                  {column.renderCell && column.renderCell(item)}
                </HStack>
              ) : // Render Data Cell
              column.renderCell ? (
                column.renderCell(item) // Use custom renderer if provided
              ) : (
                <Text className="text-right text-sm">
                  {item[column.key] ? String(item[column.key]) : "N/A"}
                </Text>
              )}
            </Box>
          </HStack>
        ))}
      </VStack>
    </Card>
  );

  // Render Footer for FlatList (loading indicator/error/end of list)
  const renderFooter = () => {
    if (loading && data.length === 0) return null;

    if (refreshing)
      return (
        <Spinner
          size="small"
          className="my-5"
        />
      );

    if (error && data.length > 0) {
      return (
        <Text className="text-red-500 text-center my-5 px-5">
          Data loading error: {error}
        </Text>
      );
    }

    if (page >= totalPages && data.length > 0) {
      return (
        <Text className="text-center text-gray-500 my-5 italic">
          --- End of {title} List ---
        </Text>
      );
    }

    return null;
  };

  // --- MAIN RENDER LOGIC ---

  if (loading && data.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box className="flex-1 bg-gray-100">
      {/* Header Section */}
      <HStack className="justify-between items-center p-3">
        <Heading size="lg" className="font-bold">
          {title}
        </Heading>
        {addRoute && (
          <Button
            size="md"
            action="primary"
            variant="solid"
            onPress={() => navigation.navigate(addRoute as never)}
          >
            <ButtonIcon as={PlusIcon} className="w-4 h-4 mr-1" />
            <ButtonText>Add</ButtonText>
          </Button>
        )}
      </HStack>

      {/* Empty State */}
      {data.length === 0 && !loading && !error ? (
        <VStack className="flex-1 justify-center items-center py-12">
          <Icon as={PackageXIcon} className="w-12 h-12 text-gray-400 mb-3" />
          <Text className="text-lg mb-3 text-gray-600">No {title} found.</Text>
          <Button variant="outline" action="secondary" onPress={handleRefresh}>
            <ButtonText>Reload</ButtonText>
          </Button>
        </VStack>
      ) : (
        /* Data List */
        <FlatList
          data={data}
          keyExtractor={(item) =>
            item._id || item.id || Math.random().toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing && page === 1}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      {/* Delete Confirmation Dialog (using Gluestack's AlertDialog) */}
      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Confirm Deletion</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>Are you sure you want to delete this record?</Text>
            {loading && <Spinner className="mt-2" />}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowDeleteDialog(false)}
              isDisabled={loading}
              className="mr-3"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button action="negative" onPress={handleDelete} isDisabled={loading}>
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default ReusableDataGrid;