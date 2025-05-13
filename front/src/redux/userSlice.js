import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isLoggedIn: localStorage.getItem("user"),
  user: null,
  role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    attendClass(state, action) {
      state.isLoggedIn;
      state.user = {
        ...state.user,
        attendedClasses: action.payload.attendedClasses,
      };
      state.wallet = { ...state.wallet, balance: action.payload.balance };
    },
    login(state, action) {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.wallet = action.payload.wallet;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const { login, logout, attendClass } = userSlice.actions;
export default userSlice.reducer;
