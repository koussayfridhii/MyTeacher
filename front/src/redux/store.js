import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import colorModeReducer from "./colorModeSlice";
import languageSlice from "./languageSlice";
import userSlice from "./userSlice";

const persistConfig = {
  key: "root",
  storage: storageSession,
  whitelist: ["user", "language"],
  blacklist: ["colorMode"],
};

const rootReducer = combineReducers({
  colorMode: colorModeReducer,
  language: languageSlice,
  user: userSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});
export const persistor = persistStore(store);
