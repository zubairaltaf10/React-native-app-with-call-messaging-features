import { combineReducers } from "redux";

import authReducer from "./authReducer";
import { chat } from "../actions/chatActions";
import { userAuth } from "../actions/userAuth";
import { audioChat } from "../actions/audioActions";

export default combineReducers({
  auth: authReducer,
  chat,
  userAuth,
  audioChat
  // appointment: appointmentReducer,
});
