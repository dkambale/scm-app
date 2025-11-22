import React from "react";
import { StyleSheet } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";

interface Props {
  children?: React.ReactNode;
  onPress?: () => void;
  mode?: "contained" | "outlined" | "text";
  style?: any;
  loading?: boolean;
}

const Button: React.FC<Props> = ({
  children,
  onPress,
  mode = "contained",
  style,
  loading,
}) => {
  const theme = useTheme();
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      style={[styles.button, style]}
      loading={loading}
      buttonColor={theme.colors.primary}
      textColor={theme.colors.onPrimary}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
  },
});

export default Button;
