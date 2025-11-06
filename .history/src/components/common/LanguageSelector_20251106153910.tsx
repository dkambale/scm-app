import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import {
  IconButton,
  Dialog,
  Portal,
  Button,
  Text,
  List,
} from "react-native-paper";
import i18n from "../../../i18n";

const languages = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिन्दी" },
  { code: "sp", label: "Español" },
  { code: "fr", label: "Français" },
];

const LanguageSelector: React.FC = () => {
  const [visible, setVisible] = useState(false);

  // compute a safe top offset so the button is tappable on phones (status bar / notch)
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

  return (
    <View
      style={[styles.container, { top: statusBarHeight + 8 }]}
      pointerEvents="box-none"
    >
      <IconButton
        icon="translate"
        accessibilityLabel="Change language"
        onPress={() => setVisible(true)}
        size={28}
        style={styles.icon}
        accessibilityRole="button"
      />
      {Platform.OS === "android" ? (
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.androidModalOverlay}>
            <View style={styles.androidModalContent}>
              <Text style={{ marginBottom: 8, fontWeight: "700" }}>
                Change language
              </Text>
              <ScrollView>
                {languages.map((lang) => (
                  <List.Item
                    key={lang.code}
                    title={lang.label}
                    onPress={() => {
                      i18n.changeLanguage(lang.code);
                      setVisible(false);
                    }}
                    right={() =>
                      i18n.language === lang.code ? <Text>✓</Text> : null
                    }
                  />
                ))}
              </ScrollView>
              <Button
                onPress={() => setVisible(false)}
                style={{ marginTop: 8 }}
              >
                Close
              </Button>
            </View>
          </View>
        </Modal>
      ) : (
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Change language</Dialog.Title>
            <Dialog.Content>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  mode={i18n.language === lang.code ? "contained" : "text"}
                  onPress={() => {
                    i18n.changeLanguage(lang.code);
                    setVisible(false);
                  }}
                  style={{ marginBottom: 6 }}
                >
                  {lang.label}
                </Button>
              ))}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "web" ? 8 : 40,
    right: 10,
    zIndex: 9999,
  },
  icon: {
    backgroundColor: "transparent",
  },
  androidModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  androidModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "70%",
    padding: 12,
  },
});

export default LanguageSelector;
