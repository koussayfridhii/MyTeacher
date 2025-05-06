import { createSlice } from "@reduxjs/toolkit";

const lightTheme = {
  colors: {
    white: "#DFF1FF",
    whiteHover: "#F9F871",
    background: "#f8f8f8", // Light background color
    text: "#222222", // Dark text color
    textSecondary: "#718096",
    primary: "#004080", // Ocean Blue for primary elements
    primaryHover: "#008275",
    secondary: "#2F81C4", // Blue for secondary elements
    bgGray: "#E0E1DD", //gray background
    bgTransparentGreen: "#0fa23933",
  },
};

const darkTheme = {
  colors: {
    white: "#DFF1FF",
    whiteHover: "#F9F871",
    background: "#1A202C", // Light background color
    text: "#f8f8f8", // Dark text
    textSecondary: "#c3dbe9 ",
    primary: "#004080", // Ocean Blue for primary elements
    primaryHover: "#00935F",
    secondary: "#2F81C4", // Blue for secondary elements
    bgGray: "#2D3748", //gray background
    bgTransparentGreen: "#0fa239a7",
  },
};
const initialState = {
  colorMode: localStorage.getItem("chakra-ui-color-mode") || "light", // Initial color mode
  theme:
    localStorage.getItem("chakra-ui-color-mode") === "dark"
      ? darkTheme
      : lightTheme,
};

const colorModeSlice = createSlice({
  name: "colorMode",
  initialState,
  reducers: {
    colorModeReducer: (state) => {
      state.colorMode = state.colorMode === "light" ? "dark" : "light";
    },
    themeReducer: (state) => {
      state.theme = state.colorMode === "light" ? lightTheme : darkTheme;
    },
  },
});
export const { colorModeReducer, themeReducer } = colorModeSlice.actions;
export default colorModeSlice.reducer;
