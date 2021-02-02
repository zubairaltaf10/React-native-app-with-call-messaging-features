import * as firebase from "firebase";
import "@react-native-firebase/messaging";

var firebaseConfig = {
  apiKey: "AIzaSyCWCLGwOANW4d5A7iSw1WYYDAYVUKZ1tPI",
  authDomain: "pukaar-4988e.firebaseapp.com",
  databaseURL: "https://pukaar-4988e.firebaseio.com",
  projectId: "pukaar-4988e",
  storageBucket: "pukaar-4988e.appspot.com",
  messagingSenderId: "122936602384",
  appId: "1:122936602384:web:57ff99e211f60857163f95",
  measurementId: "G-2H2EJRZDKM",
  messagingSenderId: "122936602384"
};

// Initialize Firebase
const fire = firebase.initializeApp(firebaseConfig);

export default fire;
// firebase.analytics();
