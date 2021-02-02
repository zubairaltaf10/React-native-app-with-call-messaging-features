import moment from "moment";
import Snackbar from "../components/Snackbar";
import session from "../data/session";
import firebase from "../services/firebase";
import { roles } from "./enums/User";
import { fetchUsers } from "./fetchAllUsers";

export const addActivity = async (id, message = "No Activity") => {
  const user = await session.getUser();
  if (id === null) {
    id = user.jwt;
  }
  try {
    // alert(JSON.stringify(updates));
    let ref = await firebase.database().ref(`ActivityHistory/${id}`);
    ref.once("value", snap => {
      if (snap.exists()) {
        ref.child(`${snap.val().length}`).set({ message, date: Date() });
      } else {
        ref.set([{ message, date: Date() }]);
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};
