const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };

    case "LOGOUT":
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
      };

    case "UPDATE_AUTH_USER_PROFILE_IMAGE": {
      const updatedUser = {
        ...state.user,
        profileImage: action.payload,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };
    }

    default:
      return state;
  }
};

export default authReducer;
