// import 'react-native-gesture-handler';
// import { NavigationNativeContainer } from '@react-navigation/native';
import React, { Component } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "react-native-elements";
import { theme as themee } from "./src/styles";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import ReduxThunk from "redux-thunk";
import rootReducer from "./src/store/reducers";
import { ScrollView, View, LogBox, Button, Platform, StatusBar } from "react-native";
import firebase from "firebase";
const enhancers = [];
import messaging from "@react-native-firebase/messaging";
import NavigationService from "./src/util/navigationService";
import FlashMessage, {
  showMessage,
  hideMessage
} from "react-native-flash-message";

if (process.env.NODE_ENV === "development") {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === "function") {
    enhancers.push(devToolsExtension());
  }
}
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(ReduxThunk),
    ...enhancers
  )
);
const prefix = "pukaar://";
const theme = {
  Button: {
    raised: true,
    buttonStyle: {
      width: "100%"
    },
    titleStyle: {
      fontFamily: themee.font.medium
    },
    linearGradientProps: {
      colors: [themee.colorGradientStart, themee.colorGradientEnd],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 }
    }
  },
  Icon: {
    containerStyle: {
      padding: 5
    }
  }
};

export default class App extends Component {
  componentDidMount() {
    LogBox.ignoreLogs(["Animated: `useNativeDriver`", "Setting a timer"]);
    LogBox.ignoreAllLogs();
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   console.log(
    //     "A new FCM message arrivedsdfdssdsfd!",
    //     JSON.stringify(remoteMessage)
    //   );

    // });

    this.createNotificationListeners();
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = messaging().onMessage(async notification => {
      console.log(
        "A new FCM message arrived! NEW ",
        notification,
        notification.notification.body,
        notification.data.senderData
      );
      return showMessage({
        message: JSON.parse(notification.data.senderData).name,
        description: notification.notification.body,
        backgroundColor: "black", // background color
        color: "white" // text color
      });
    });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    // this.notificationOpenedListener = messaging().onNotificationOpenedApp(
    //   async notificationOpen => {
    //     console.log(notificationOpen, "notificationOpen");
    //     NavigationService.navigate(notificationOpen.notification._data.url);
    //   }
    // );

    // /*
    //  * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    //  * */
    // const notificationOpen = await messaging().getInitialNotification();
    // if (notificationOpen) {
    //   navigationDeferred.promise.then(() => {
    //     NavigationService.navigate(notificationOpen.notification._data.url);
    //   });
    // }
    // /*
    //  * Triggered for data only payload in foreground
    //  * */
    // this.messageListener = messaging().onMessage(message => {
    //   //process data message
    //   console.log(JSON.stringify(message));
    // });
  }

  render() {
    return (
      <View style={{ flex: 1 ,paddingTop: Platform.OS === 'android' ? 0 : 0 }}>
        {/* <StatusBar></StatusBar> */}
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <AppNavigator uriPrefix={prefix} />
            <FlashMessage
              position="top"
              animated={true}
              icon="info"
              style={{ borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}
              textStyle={{ marginLeft: 5 }}
              titleStyle={{ marginLeft: 5 }}
              duration={5000}
              hideOnPress={true}
              // renderFlashMessageIcon={() => {
              //   return <Icon name="menu" />;
              // }}
            />
          </ThemeProvider>
        </Provider>
      </View>
    );
  }
}
