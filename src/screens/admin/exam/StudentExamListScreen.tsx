import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { userDetails } from "../../../utils/apiService";

const columnsConfig = [
  { key: 'examName', header: 'Exam Name' },
  { key: 'status', header: 'status' },
  { key: 'maxMarksOverall', header: 'Max Marks Overall' },
  { key: 'examType', header: 'Type' },
  { key: 'academicYear', header: 'academic Year' },
  { key: 'schoolName', header: 'School' },
  { key: 'className', header: 'Class' },
  { key: 'divisionName', header: 'Division' },
];

const transformExamData = (exam: any) => ({
  ...exam,
  examName: exam.examName,
  
});

export const ExamList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const accountId = await userDetails.getAccountId();
      // const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/exams/getAllBy/${accountId}`);
      }
    };
    initialize();
  }, []);

  if (!fetchUrl) {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title="Exams"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
    
        
        
        entityName="Exam"
        searchPlaceholder="Search exams..."
        transformData={transformExamData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ExamList;
