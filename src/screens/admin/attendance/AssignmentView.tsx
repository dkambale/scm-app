import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Assignment } from '../../../types';

type Props = {
  assignment: Assignment;
};

export const AssignmentView: React.FC<Props> = ({ assignment }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Text variant="titleLarge">{assignment.title}</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>Due Date: {assignment.dueDate}</Text>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Text variant="titleMedium">Description</Text>
          <Text style={{ marginTop: 8 }}>{assignment.description}</Text>
        </Card.Content>
      </Card>
      
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Text variant="titleMedium">Details</Text>
          <Text>Class ID: {assignment.classId}</Text>
          <Text>Teacher ID: {assignment.teacherId}</Text>
          <Text>Submissions: {assignment.submissions.length}</Text>
          {assignment.attachmentUrl && <Text>Attachment: Yes</Text>}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AssignmentView;