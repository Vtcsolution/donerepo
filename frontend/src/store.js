// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from './redux/slices/authSlice';

// Configure store with the auth reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
