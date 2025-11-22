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
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        {showBack ? <Appbar.BackAction onPress={onBack ?? (() => {})} /> : null}
        <Appbar.Content title={title} />
      </Appbar.Header>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
});

export default MainLayout;
