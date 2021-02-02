import { AUTHENTICATE, LOGOUT } from "../actions";

const initialState = {
  userType: "user",
  userEmail: null,
  userId: null,
  users: [],
  diary: [],
  changeTherapistRequests: [],
  buySessionRequests: [],
  donateSessionRequests: [],
  oneOnOneSessionRequests: [],
  pendingRequests:[]
};

export default (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATE:
      return {
        ...state,
        userId: action.payload.userId,
        userEmail: action.payload.userEmail
      };
    case LOGOUT:
      return initialState;
    // case SIGNUP:
    //   return {
    //     token: action.token,
    //     userId: action.userId
    //   };
    case "FETCH_USERS":
      return { ...state, users: action.payload.users };
    case "FETCH_MOODS":
      return { ...state, diary: action.payload.moods };
    case "FETCH_BUY_SESSION_REQUESTS":
      return {
        ...state,
        buySessionRequests: action.payload.buySessionRequests
      };
    case "FETCH_DONATE_SESSION_REQUESTS":
      return {
        ...state,
        donateSessionRequests: action.payload.donateSessionRequests
      };
    case "FETCH_ONE_ON_ONE_SESSION_REQUESTS":
      return {
        ...state,
        oneOnOneSessionRequests: action.payload.oneOnOneSessionRequests
      };
    case "FETCH_CHANGE_THERAPIST_REQUESTS":
      return {
        ...state,
        changeTherapistRequests: action.payload.changeTherapistRequests
      };
    default:
      return state;
  }
};
