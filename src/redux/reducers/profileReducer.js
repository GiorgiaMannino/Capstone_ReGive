const initialState = {
  userProfile: null,
  articles: [],
  error: null,
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER_PROFILE":
      return { ...state, userProfile: action.payload };
    case "SET_USER_ARTICLES":
      return { ...state, articles: action.payload };
    case "SET_PROFILE_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

export default profileReducer;
