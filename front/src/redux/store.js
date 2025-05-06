import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";

// sessionStorage for non‑user state
import storageSession from "redux-persist/lib/storage/session";
// localStorage for user state
import storage from "redux-persist/lib/storage";

import colorModeReducer from "./colorModeSlice";
import languageSlice from "./languageSlice";
import userSlice from "./userSlice";

// persist just the user slice to localStorage
const userPersistConfig = {
  key: "user",
  storage, // <-- localStorage: survives reopen
  // you can whitelist or blacklist fields inside user state if needed
};

const rootReducer = combineReducers({
  colorMode: colorModeReducer,
  language: languageSlice,
  // wrap only `user` in its own localStorage persistReducer:
  user: persistReducer(userPersistConfig, userSlice),
});

const rootPersistConfig = {
  key: "root",
  storage: storageSession, // <-- sessionStorage: clears on tab close
  whitelist: ["language"], // we already persist `user` above, so omit it here
  blacklist: ["colorMode"],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
