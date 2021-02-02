/**
 * @format
 */
import "react-native-get-random-values";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-community/async-storage";
import PushNotification from "react-native-push-notification";
import CallPage from "./src/pages/CallPage";

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   await AsyncStorage.setItem(
//     "push_notification",
//     JSON.stringify({
//       message: remoteMessage.data.message, // (required)
//       playSound: false, // (optional) default: true
//       soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
//       importance: "high",
//       fromUser: JSON.parse(remoteMessage.data.fromUser),
//       type: remoteMessage.data.type
//     })
//   );
//   console.log(
//     "Message handled in the background!",
//     JSON.parse(remoteMessage.data.fromUser)
//   );
// });

// messaging().onNotificationOpenedApp(async remoteMessage => {
//   // Update a users messages list using AsyncStorage
//   console.log(remoteMessage, "updateMessage");
//   const currentMessages = await AsyncStorage.getItem("messages");
//   const messageArray = JSON.parse(currentMessages);
//   messageArray.push(remoteMessage.data);
//   await AsyncStorage.setItem("messages", JSON.stringify(messageArray));
// });

AppRegistry.registerComponent(appName, () => App);
