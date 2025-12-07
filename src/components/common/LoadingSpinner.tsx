import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingSpinnerProps {
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  color = "#0071e3",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
