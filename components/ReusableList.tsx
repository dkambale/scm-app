import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Button, Text, ActivityIndicator, IconButton, Portal, Dialog, List } from 'react-native-paper';

type FilterOption = { label: string; value: string };

type FilterDef = {
  key: string;
  label: string;
  options: FilterOption[];
};

type FetchParams = {
  page: number;
  size: number;
  search: string;
  filters: Record<string, string | undefined>;
};

type FetchResult<T> = {
  items: T[];
  total: number;
};

type Props<T> = {
  title?: string;
  pageSize?: number;
  filterDefs?: FilterDef[];
  onFetch: (params: FetchParams) => Promise<FetchResult<T>>;
  renderItem: (item: T) => React.ReactElement;
  headerRight?: React.ReactNode;
};

export function ReusableList<T>(props: Props<T>) {
  const { pageSize = 10, filterDefs = [], onFetch, renderItem, headerRight } = props;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await onFetch({ page, size: pageSize, search, filters });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search, JSON.stringify(filters)]);

  const applyFilter = (key: string, value: string | undefined) => {
    setPage(0);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search..."
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setPage(0);
          }}
          style={styles.search}
        />
        {!!filterDefs.length && (
          <Button mode="outlined" style={styles.filterBtn} onPress={() => setShowFilters(true)}>
            Filters
          </Button>
        )}
        {headerRight}
      </View>

      {loading ? (
        <View style={styles.loader}> 
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item }) => renderItem(item)}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={<Text style={styles.empty}>No records found</Text>}
        />
      )}

      <View style={styles.pager}>
        <IconButton icon="chevron-left" disabled={page <= 0 || loading} onPress={() => setPage((p) => Math.max(0, p - 1))} />
        <Text style={styles.pageText}>{page + 1} / {totalPages}</Text>
        <IconButton icon="chevron-right" disabled={loading || page + 1 >= totalPages} onPress={() => setPage((p) => p + 1)} />
      </View>

      <Portal>
        <Dialog visible={showFilters} onDismiss={() => setShowFilters(false)}>
          <Dialog.Title>Filters</Dialog.Title>
          <Dialog.Content>
            {filterDefs.map((fd) => (
              <View key={fd.key} style={{ marginBottom: 8 }}>
                <Text style={{ marginBottom: 4 }}>{fd.label}</Text>
                <List.Section>
                  {fd.options.map((opt) => (
                    <List.Item
                      key={opt.value}
                      title={opt.label}
                      right={() => (filters[fd.key] === opt.value ? <List.Icon icon="check" /> : null)}
                      onPress={() => applyFilter(fd.key, opt.value)}
                    />
                  ))}
                  <List.Item
                    title="Clear"
                    onPress={() => applyFilter(fd.key, undefined)}
                  />
                </List.Section>
              </View>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFilters(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  search: {
    flex: 1,
  },
  filterBtn: {
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pager: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)'
  },
  pageText: {
    marginHorizontal: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
});

export default ReusableList;


