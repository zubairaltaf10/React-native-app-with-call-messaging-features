import firebase from "../services/firebase";
export const fetchUsers = async () => {
  // alert(password)
  let users = [];

//   console.log("hto util");
  await firebase
    .database()
    .ref("users")
    .on("value", snap => {
      if (snap.exists()) {
        const values = snap.val();

        users = Object.keys(values).map(key => ({
          ...values[key],
          _id: key
        }));
        // console.log("fetch", users);
        // dispatch({ type: "FETCH_USERS", payload: { users } });
      }
    });
  return users;
};
