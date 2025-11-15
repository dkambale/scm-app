import React from "react";
import { StyleSheet } from "react-native";
import { Snackbar, Text } from "react-native-paper";

type Props = {
  visible: boolean;
  type: "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
  duration?: number;
};

const StatusMessage: React.FC<Props> = ({
  visible,
  type,
  message,
  onDismiss,
  duration = 3000,
}) => {
  const style =
    type === "success"
      ? styles.success
      : type === "error"
      ? styles.error
      : styles.info;
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss || (() => {})}
      duration={duration}
      style={[styles.container, style]}
    >
      <Text style={styles.text}>{message}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
  },
  text: {
    color: "#ffffff",
    fontWeight: "600",
  },
  success: {
    backgroundColor: "#28a745",
  },
  error: {
    backgroundColor: "#d9534f",
  },
  info: {
    backgroundColor: "#0b5fff",
  },
});

export default StatusMessage;
