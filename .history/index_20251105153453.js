import React from "react";
import { registerRootComponent } from "expo";
import App from "./App";
import { Provider as ReduxProvider } from "react-redux";
import store from "./src/store/store";

const Root = () => (
  <ReduxProvider store={store}>
    <App />


    
  </ReduxProvider>
);

registerRootComponent(Root);
