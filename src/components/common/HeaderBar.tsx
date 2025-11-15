import React from "react";
import { StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

type Props = {
  title?: string;
  subtitle?: string;
  showCancel?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  backgroundColor?: string;
};

const HeaderBar: React.FC<Props> = ({
  title,
  subtitle,
  showCancel = false,
  onBack,
  onCancel,
  backgroundColor = "#0b5fff",
}) => {
  const navigation: any = useNavigation();

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation && typeof navigation.goBack === "function")
      return navigation.goBack();
  };

  const handleCancel = () => {
    if (onCancel) return onCancel();
    if (navigation && typeof navigation.goBack === "function")
      return navigation.goBack();
  };

  return (
    <Appbar.Header style={[styles.header, { backgroundColor }]}>
      <Appbar.BackAction onPress={handleBack} />
      <Appbar.Content
        title={title ?? ""}
        subtitle={subtitle ?? ""}
        titleStyle={styles.title}
      />
      {showCancel ? (
        <Appbar.Action icon="close" onPress={handleCancel} />
      ) : null}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 2,
  },
  title: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

export default HeaderBar;
