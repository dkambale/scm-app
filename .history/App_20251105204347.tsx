import React from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import { RootNavigation } from "./src/navigation/RootNavigation";
// import './i18n';
// import SCDProvider from './src/context/SCDContext';
// import SCDProvider from './context/SCDContext';
import { SCDProvider } from "./src/context/SCDProvider";
import { Provider as ReduxProvider } from "react-redux";
import store from "./src/store/store";
import './i18n'
export default function App() {
  return (
    <GluestackUIProvider config={config></GluestackUIProvider>
    <PaperProvider>
      <ReduxProvider store={store}>
        <AuthProvider>
          <SCDProvider>
            <RootNavigation />
          </SCDProvider>
        </AuthProvider>
      </ReduxProvider>
    </PaperProvider>
  );
}
