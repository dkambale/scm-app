import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

interface MainLayoutProps {
  title?: string;
  children?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  title,
  children,
  showBack = true,
  onBack,
}) => {
  const theme = useTheme();
  // Use white background and dark text with accent back button for consistent mobile UI
  const ACCENT = "#007AFF";
  const TEXT_DARK = "#111827";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#ffffff" }]}>
      <Appbar.Header style={{ backgroundColor: "#ffffff" }}>
        {showBack ? (
          <Appbar.BackAction onPress={onBack ?? (() => {})} color={ACCENT} />
        ) : null}
        <Appbar.Content title={title ?? ""} titleStyle={{ color: TEXT_DARK }} />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: "#ffffff" }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
});

export default MainLayout;
