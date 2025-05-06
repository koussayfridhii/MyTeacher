import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "en", // Initial language
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    languageReducer: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { languageReducer } = languageSlice.actions;
export default languageSlice.reducer;
