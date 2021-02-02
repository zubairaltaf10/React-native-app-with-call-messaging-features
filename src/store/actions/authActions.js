// import {AsyncStorage} from 'react-native';
import firebase from "../../services/firebase";
import AsyncStorage from "@react-native-community/async-storage";
import session from "../../data/session";
import moment from "moment";
import { roles } from "../../util/enums/User";
// // export const SIGNUP = 'SIGNUP';
// // export const LOGIN = 'LOGIN';
// export const AUTHENTICATE = 'AUTHENTICATE';
// export const LOGOUT = 'LOGOUT';

// let timer;

// export const authenticate = (userId = null, userEmail = null) => {
//   return dispatch => {
//     dispatch({type: AUTHENTICATE, payload: {userId, userEmail}});
//   };
// };

export const fetchUsers = () => {
  // alert(password)
  let users = [];
  return dispatch => {
    firebase
      .database()
      .ref("users")
      .on("value", snap => {
        if (snap.exists()) {
          const values = snap.val();

          users = Object.keys(values).map(key => ({
            ...values[key],
            _id: key
          }));

          dispatch({ type: "FETCH_USERS", payload: { users } });
        }
      });
  };
};
export const fetchDiary = (userId = null, therapistId = null) => {
  //  alert(therapistDiary)

  let moods = [];
  let loggedInUser;

  return async dispatch => {
    loggedInUser = await session.getUser().then(re => re);
    // alert(loggedInUser.jwt)
    let user = {};
    if (!therapistId) {
      if (userId) {
        user = { jwt: userId };
      } else {
        user = { ...loggedInUser };
      }
      // alert( 'j'+userId+'k')
      await firebase
        .database()
        .ref(`diary/${userId}`)
        .on("value", snapshot => {
          if (snapshot.exists()) {
            moods = snapshot.val();
            // alert( userId)
            // Object.keys(snapshot.val()).map(key => ({
            //   ...snapshot.val()[key],
            //   id: key,
            // }));
            // let date = moment().format('DD');
            // console.log('m', moods);
            // moods = moods.filter(mood => {
            //   return moment(new Date(mood.date)).format('DD') === date;
            // });

            dispatch({ type: "FETCH_MOODS", payload: { moods } });
          } else {
            dispatch({ type: "FETCH_MOODS", payload: { moods } });
          }
        });
    } else {
      user = { ...loggedInUser };
      await firebase
        .database()
        .ref(`therapistDiary/${therapistId}/${userId}`)
        .on("value", snapshot => {
          if (snapshot.exists()) {
            moods = snapshot.val();

            dispatch({ type: "FETCH_MOODS", payload: { moods } });
          } else {
            dispatch({ type: "FETCH_MOODS", payload: { moods } });
          }
        });
    }
  };
};
export const fetchDonateSessionRequests = () => {
  // alert(password)
  let donateSessionRequests = [];
  return dispatch => {
    firebase
      .database()
      .ref("DonateSessionRequests")
      .on("value", snap => {
        if (snap.exists()) {
          const values = snap.val();
          donateSessionRequests = Object.values(values);

          dispatch({
            type: "FETCH_DONATE_SESSION_REQUESTS",
            payload: { donateSessionRequests }
          });
        }
      });
  };
};
export const fetchBuySessionRequests = () => {
  // alert(password)
  let buySessionRequests = [];
  return dispatch => {
    firebase
      .database()
      .ref("BuySessionRequests")
      .on("value", snap => {
        if (snap.exists()) {
          const values = snap.val();
          buySessionRequests = Object.values(values);

          dispatch({
            type: "FETCH_BUY_SESSION_REQUESTS",
            payload: { buySessionRequests }
          });
        }
      });
  };
};
export const fetchOneOnOneSessionRequests = () => {
  // alert(password)
  let oneOnOneSessionRequests = [];
  return dispatch => {
    firebase
      .database()
      .ref("OneOnOneSessionRequests")
      .on("value", snap => {
        if (snap.exists()) {
          const values = snap.val();
          oneOnOneSessionRequests = Object.values(values);

          dispatch({
            type: "FETCH_ONE_ON_ONE_SESSION_REQUESTS",
            payload: { oneOnOneSessionRequests }
          });
        }
      });
  };
};
export const fetchChangeTherapistRequests = () => {
  // alert(password)
  let changeTherapistRequests = [];
  return dispatch => {
    firebase
      .database()
      .ref("ChangeTherapistRequests")
      .on("value", snap => {
        if (snap.exists()) {
          const values = Object.values(snap.val()).map(r=>Object.values(r)[0]);
          changeTherapistRequests = (values);
// alert(JSON.stringify(changeTherapistRequests))
          dispatch({
            type: "FETCH_CHANGE_THERAPIST_REQUESTS",
            payload: { changeTherapistRequests }
          });
        }
      });
  };
};

const fetchPendingRequests = async () => {
  await fetchBuySessionRequests();
  await fetchDonateSessionRequests();
  await fetchChangeTherapistRequests();
  await fetchOneOnOneSessionRequests();
  // alert("ho");
  
  const user = await session.getUser();
  let pendingRequests = [];
  if (user.role === roles.user) {
  }
};
//     if (!response.ok) {
//       console.log(response.json().error);
//       const errorResData = await response.json();
//       const errorId = errorResData.error.message;
//       let message = 'Something went wrong!';
//       if (errorId === 'EMAIL_EXISTS') {
//         message = 'This email exists already!';
//       }
//       throw new Error(message);
//     }

//     const resData = await response.json();
//     console.log(resData);
//     dispatch(
//       authenticate(
//         resData.localId,
//         resData.idToken,
//         parseInt(resData.expiresIn) * 1000,
//       ),
//     );
//     const expirationDate = new Date(
//       new Date().getTime() + parseInt(resData.expiresIn) * 1000,
//     );
//     saveDataToStorage(resData.idToken, resData.localId, expirationDate);
//   };
// };

// export const login = (email, password) => {
//   return async dispatch => {
//     console.log('login');
//     await firebase
//       .database()
//       .ref(`users`)
//       .orderByChild('email')
//       .equalTo(email)
//       .once('value', snapshot => {
//         if (snapshot.exists()) {
//           const userData = snapshot.val();
//           const userId = Object.keys(userData)[0];
//           saveDataToStorage({userId, email: userData[userId].email});
//           dispatch(authenticate(userId, userData[userId].email));
//           console.log('exists!', Object.keys(userData)[0]);
//           return;
//         }
//       })
//       .then(() => {});
//   };
// };

// export const logout = () => {
//   alert('Logiutaction');
//   clearLogoutTimer();
//   AsyncStorage.removeItem('userData');
//   return {type: LOGOUT};
// };

// const clearLogoutTimer = () => {
//   if (timer) {
//     clearTimeout(timer);
//   }
// };

// const setLogoutTimer = expirationTime => {
//   return dispatch => {
//     timer = setTimeout(() => {
//       dispatch(logout());
//     }, expirationTime);
//   };
// };

// const saveDataToStorage = (user, usertType = 'user') => {
//   AsyncStorage.setItem(
//     'userData',
//     JSON.stringify({
//       usertType,
//       ...user,
//     }),
//   );
// };
