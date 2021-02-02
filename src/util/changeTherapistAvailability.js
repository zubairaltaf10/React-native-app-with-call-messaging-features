import moment from "moment";
import Snackbar from "../components/Snackbar";
import session from "../data/session";
import firebase from "../services/firebase";
import { roles } from "./enums/User";
import { fetchUsers } from "./fetchAllUsers";

export const changeTherapistAvailabilty = async therapist => {
  let users = await fetchUsers();

  //   alert(JSON.stringify(therapist));
  //   return;
  let id = therapist.id;

  var updates = {};

  therapist = null;
  let patients = [];

  //Taking currently selected therapist
  therapist = users.filter(user => user._id === id);
  therapist = Array.isArray(therapist) ? therapist[0] : therapist;

  let therapistPatients = [];
  if (therapist.status === "available") {
    if (therapist.patients) {
      //Changing status for all connected patients
      therapist.patients.forEach(p => {
        therapistPatients.push({
          ...p,
          status: "inactive"
        });
        //Checking status for all connected and live patients
        if (p.status === "active") {
          let patient = users.filter(user => user._id === p.id);
          patient = Array.isArray(patient) ? patient[0] : patient;
          console.log(patient.therapists);
          patient = {
            ...patient,
            status: "reassigned",
            reassigned: true,
            therapists: patient.therapists?.map(t =>
              t.id === therapist._id ? { ...t, status: "inactive" } : t
            )
          };
          console.log(patient.therapists);
          patient ? patients.push(patient) : null;
        }
      });
      patients?.forEach(p => (updates["users/" + p._id] = p));
    }

    // updates['/posts/' + newPostKey] = postData;
    // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
    therapist = {
      ...therapist,
      patients: therapist.patients ? therapistPatients : null,
      available: false,
      status: "unavailable"
    };
    session.loggingIn({ ...therapist });
    updates["users/" + therapist._id] = therapist;
  } else {
    updates["users/" + therapist._id + "/status"] = "available";
    updates["users/" + therapist._id + "/available"] = true;
    session.loggingIn({ ...therapist, available: true, status: "available" });
  }

  console.log("updates", updates);

  try {
    // alert(JSON.stringify(updates));
    await firebase
      .database()
      .ref()
      .update(updates);
    // this.setState({
    //   confirmationModalVisible: false,
    //   therapistIndex: null
    //   // users: array,
    // });
    // this.getTherapists(!this.state.searchToggle);
    Snackbar("success", "Status Changed Succesfully");
    let loggedInUser = await session.getUser();
    if (loggedInUser.role === roles.therapist) {
      session.loggingIn({
        ...loggedInUser,
        available: !loggedInUser.available,
        status:
          loggedInUser.status === "available" ? "unavailable" : "available"
      });
    }
  } catch (error) {
    console.log("error", error);
  }
};
