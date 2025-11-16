import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { useTranslation } from 'react-i18next';

const columnsConfig = [
  { key: 'name', header: 'Class Name' },
  { key: 'description', header: 'Description' },
  { key: 'section', header: 'Section' },
];

const transformClassData = (classItem: any) => ({
  ...classItem,
  name: classItem.name || classItem.className || 'N/A',
  description: classItem.description || 'N/A',
  section: classItem.section || 'N/A',
});

export const ClassList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');
  const { t } = useTranslation('title');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/schoolClasses/getAll/${accountId}`);
      }
    };
    initialize();
  }, []);

  if (!fetchUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title={t('classes.title')}
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        entityName="CLASS"
        searchPlaceholder="Search classes..."
        transformData={transformClassData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ClassList;
