import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { IconButton, Dialog, Portal, Button, Text } from 'react-native-paper';
import i18n from '../../../i18n';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'sp', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

const LanguageSelector: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <IconButton
        icon="translate"
        accessibilityLabel="Change language"
        onPress={() => setVisible(true)}
        size={24}
        style={styles.icon}
      />
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Change language</Dialog.Title>
          <Dialog.Content>
            {languages.map((lang) => (
              <Button
                key={lang.code}
                mode={i18n.language === lang.code ? 'contained' : 'text'}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 8 : 40,
    right: 10,
    zIndex: 9999,
  },
  icon: {
    backgroundColor: 'transparent',
  },
});

export default LanguageSelector;
