const initialState = {
  showRegisterModal: false,
  showLoginModal: false,
};

function modalReducer(state = initialState, action) {
  switch (action.type) {
    case "SHOW_REGISTER_MODAL":
      return { ...state, showRegisterModal: true };
    case "HIDE_REGISTER_MODAL":
      return { ...state, showRegisterModal: false };
    case "SHOW_LOGIN_MODAL":
      return { ...state, showLoginModal: true };
    case "HIDE_LOGIN_MODAL":
      return { ...state, showLoginModal: false };
    default:
      return state;
  }
}

export default modalReducer;
