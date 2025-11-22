import React from "react";
import { StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const BackButton: React.FC<{ backUrl?: string }> = ({ backUrl }) => {
  const nav = useNavigation();
  const ACCENT = "#007AFF";
  return (
    <IconButton
      icon="arrow-left"
      size={24}
      color={ACCENT}
      onPress={() => {
        if (backUrl) {
          // try navigate to named route, else goBack
          try {
            (nav as any).navigate(backUrl);
          } catch (err) {
            nav.goBack();
          }
        } else {
          nav.goBack();
        }
      }}
      style={styles.btn}
    />
  );
};

const styles = StyleSheet.create({
  btn: { margin: 0 },
});

export default BackButton;
