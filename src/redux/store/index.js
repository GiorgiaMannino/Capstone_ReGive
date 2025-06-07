import { configureStore, combineReducers } from "@reduxjs/toolkit";
import modalReducer from "../reducers/modalReducer";
import authReducer from "../reducers/authReducer";
import profileReducer from "../reducers/profileReducer";
import favoritesReducer from "../reducers/favoritesReducer";

const rootReducer = combineReducers({
  modal: modalReducer,
  auth: authReducer,
  profile: profileReducer,
  favorites: favoritesReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
