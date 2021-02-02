// import {AsyncStorage} from 'react-native';
// import Snackbar from '../../components/Snackbar';
// import firebase from '../services/firebase';

// export const addAppointment = (date, appointment) => {
//   return async (dispatch, getState) => {
//     console.log('addAppointment');

//     let userData = await AsyncStorage.getItem('userData');
//     // await dispatch(actions.authenticate(userData.userId));
//     const {userId} = JSON.parse(userData);

//     //   .database()
//     //   .ref(`users/${userData.userId}/appointments/${date}/appointments`)
//     //   .once('value', snapshot => {
//     //     if (snapshot.exists()) {
//     //       console.log('h', Object.values(snapshot.val()).length);

//     //   }
//     // });
//     //       const userData = snapshot.val();
//     //       const UUID = Object.keys(userData)[0];
//     //       saveDataToStorage(UUID);
//     //       dispatch(authenticate(UUID, userData[UUID].email));
//     //       console.log('exists!', Object.keys(userData)[0]);
//     //       return;
//     //     }
//     //   })
//     //   .then(() => {});
//   };
// };

// export const getAppointments = () => {
//   return async (dispatch, getState) => {
//     console.log('getAppointment');

//     //       const userData = snapshot.val();
//     //       const UUID = Object.keys(userData)[0];
//     //       saveDataToStorage(UUID);
//     //       dispatch(authenticate(UUID, userData[UUID].email));
//     //       console.log('exists!', Object.keys(userData)[0]);
//     //       return;
//     //     }
//     //   })
//     //   .then(() => {});
//   };
// };
// export const getAppointmentsById = id => {
//   return async (dispatch, getState) => {
//     console.log('getAppointment');

//     //       const userData = snapshot.val();
//     //       const UUID = Object.keys(userData)[0];
//     //       saveDataToStorage(UUID);
//     //       dispatch(authenticate(UUID, userData[UUID].email));
//     //       console.log('exists!', Object.keys(userData)[0]);
//     //       return;
//     //     }
//     //   })
//     //   .then(() => {});
//   };
// };
