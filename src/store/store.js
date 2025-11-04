import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer";

const store = configureStore({
  reducer,
  // You can add middleware or devTools config here if needed
});

export default store;
