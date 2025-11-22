import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface Props {
  label?: string;
  onPress?: () => void;
  loading?: boolean;
}

const SaveBar: React.FC<Props> = ({ label = 'Save', onPress, loading = false }) => {
  const theme = useTheme();
  const ACCENT = '#007AFF';
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={onPress}
        loading={loading}
        buttonColor={ACCENT}
        textColor={theme.colors.onPrimary}
        contentStyle={styles.content}
        style={styles.button}
      >
        {label}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#eef2ff',
  },
  button: {
    borderRadius: 10,
    height: 48,
  },
  content: {
    height: 48,
    justifyContent: 'center',
  },
});

export default SaveBar;
