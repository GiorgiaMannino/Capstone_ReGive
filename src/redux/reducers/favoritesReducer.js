import { SET_FAVORITES } from "../actions";

const initialState = {
  favorites: [],
};

const favoritesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
      };
    default:
      return state;
  }
};

export default favoritesReducer;
