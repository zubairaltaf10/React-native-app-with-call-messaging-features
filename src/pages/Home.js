import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from "react-native";
import firebase from "firebase";
import { styles, theme } from "../styles";
import { Button } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";
import session from "../data/session";
import { ReactReduxContext } from "react-redux";
import fire from "../services/firebase";
import { addActivity } from "../util/addActivity";
import PasscodeModal from "../components/PasscodeModal";
import messaging from "@react-native-firebase/messaging";
import MediaChatTracker from "../components/chat/Audio/tracker";
import NetworkUtils from "../components/NetworkUtil";
import NetworkUtilModal from "../components/NetworkUtilModal";
import { NavigationActions, StackActions } from "react-navigation";
const { width, height } = Dimensions.get("window");
const localStyle = StyleSheet.create({
  image: {
    width: width * 0.75,
    height: width * 0.75
    // borderRadius: theme.radius
    // ...theme.shadow(16)
  }
});

export default class Home extends Component {
  static contextType = ReactReduxContext;
  constructor(props) {
    super(props);
    this.state = {
      loading: true
      // passcodeModalVisible: true
    };
  }

  quitAppNotification = user => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          let id1 = JSON.parse(remoteMessage.data.toUserID)?.id;
          let id2 = JSON.parse(remoteMessage.data.senderData)?.id;
          console.log("yes", id1, id2);
          let channel = {
            id: id1 < id2 ? id1 + id2 : id2 + id1,
            participants: [JSON.parse(remoteMessage.data.senderData)]
          };

          if (remoteMessage.data.type == "UserChat") {
            this.props.navigation.navigate("UserChat", {
              user: user
            });
          } else if (
            remoteMessage.data.type == "PersonalChat" ||
            remoteMessage.data.type == "PersonalChatMessage"
          ) {
            this.props.navigation.navigate("PersonalChat", {
              user: user,
              channel,
              longPress: false,
              seen: true
            });
          } else if (
            remoteMessage.data.type == "new_user" &&
            user?.role == "ADMIN"
          ) {
            this.props.navigation.navigate("AdminUsers");
          } else if (
            remoteMessage.data.type == "new_user" &&
            user?.role == "THERAPIST"
          ) {
            this.props.navigation.navigate("UnassignedUsers");
          } else if (
            remoteMessage.data.type == "Admin1on1SessionRequests" &&
            user?.role == "ADMIN"
          ) {
            this.props.navigation.navigate("Admin1on1SessionRequests");
          } else if (
            remoteMessage.data.type == "AdminPaymentVerificationRequests" &&
            user?.role == "ADMIN"
          ) {
            this.props.navigation.navigate("AdminPaymentVerificationRequests");
          } else if (
            remoteMessage.data.type == "AdminDonateSessionRequests" &&
            user?.role == "ADMIN"
          ) {
            this.props.navigation.navigate("AdminDonateSessionRequests");
          } else {
            this.props.navigation.navigate("Dashboard");
          }
        } else {
          this.props.navigation.navigate("Dashboard");

          this.setState({ loading: false });
        }
      });
  };

  backgroundAppNotification = user => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        let id1 = JSON.parse(remoteMessage.data.toUserID)?.id;
        let id2 = JSON.parse(remoteMessage.data.senderData)?.id;
        console.log("yes", id1, id2);
        let channel = {
          id: id1 < id2 ? id1 + id2 : id2 + id1,
          participants: [JSON.parse(remoteMessage.data.senderData)]
        };
        // const notificationData = JSON.parse(remoteMessage.data);

        if (remoteMessage.data.type == "UserChat") {
          this.props.navigation.navigate("UserChat", {
            user: user
            // channel,
            // longPress: false
          });
        } else if (
          remoteMessage.data.type == "PersonalChat" ||
          remoteMessage.data.type == "PersonalChatMessage"
        ) {
          this.props.navigation.navigate("PersonalChat", {
            user: user,
            channel,
            longPress: false,
            seen: true
          });
        } else if (
          remoteMessage.data.type == "new_user" &&
          user?.role == "ADMIN"
        ) {
          this.props.navigation.navigate("AdminUsers");
        } else if (
          remoteMessage.data.type == "new_user" &&
          user?.role == "THERAPIST"
        ) {
          this.props.navigation.navigate("UnassignedUsers");
        } else if (
          remoteMessage.data.type == "Admin1on1SessionRequests" &&
          user?.role == "ADMIN"
        ) {
          this.props.navigation.navigate("Admin1on1SessionRequests");
        } else if (
          remoteMessage.data.type == "AdminPaymentVerificationRequests" &&
          user?.role == "ADMIN"
        ) {
          this.props.navigation.navigate("AdminPaymentVerificationRequests");
        } else if (
          remoteMessage.data.type == "AdminDonateSessionRequests" &&
          user?.role == "ADMIN"
        ) {
          this.props.navigation.navigate("AdminDonateSessionRequests");
        } else {
          this.props.navigation.navigate("Dashboard");
        }
      } else {
        this.props.navigation.navigate("Dashboard");

        this.setState({ loading: false });
      }
    });
  };

  async componentDidMount() {
    this.requestPermission();
    const firstTime = await session.getFirstTimeFlag();
    if (!firstTime) {
      this.props.navigation.navigate("Walkthrough");
    }
    const user = await session.getUser();

    if (user) {
      addActivity(user.jwt, "User logged into application");
      let passcode = await session.getPasscode();
      if (!(await NetworkUtils.isNetworkAvailable(false))) {
        this.setState({ NetworkUtilModal: true });
        return;
      }
      if (passcode) {
        let isAuthenticated = await session.isAuthenticated();
        if (!isAuthenticated) {
          this.setState({ passcodeModalVisible: true, loading: false });
          return;
        }
      }

      this.quitAppNotification(user);
      this.backgroundAppNotification(user);
    } else {
      this.setState({ loading: false });
      this.props.navigation.navigate("Login");
    }
    // this.setState({ loading: false });

    // if (user) {
    //   // console.log("User", resp);

    // }
  }

  requestPermission = async () => {
    const granted = messaging().requestPermission();
    const fcmToken = await messaging().getToken();
    await session.setDeviceToken(fcmToken);
    if (granted) {
      // console.log('User granted messaging permissions!');
    } else {
      // console.log('User declined messaging permissions :(');
    }
    // messaging().requestPermission()
    //     .then(resp => console.log(resp))
    //     .catch(err => {
    //         console.log('231')

    //         console.log(err)
    //     })
  };
  afterAuthentication = () => {
    this.setState({
      loading: false,
      // user: { ...resp, ...snap.val() },
      passcodeModalVisible: false
    });
    // this.props.navigation.dispatch(
    //   NavigationActions.reset({
    //     index: 0,
    //     // key: null,
    //     actions: [NavigationActions.navigate({ routeName: "Dashboard" })]
    //   })
    // );
    // this.props.navigation.popToTop() 
    this.props.navigation.navigate('Dashboard')

    // session.getUser().then(async resp => {
    //   if (resp) {
    //     this.props.navigation.navigate("Dashboard");
    //     fire
    //       .database()
    //       .ref(`users/${resp.id}`)
    //       .once("value", snap => {
    //         if (snap.exists()) {
    //           session.loggingIn({ ...resp, ...snap.val() });
    //           this.setState({
    //             loading: false,
    //             user: { ...resp, ...snap.val() },
    //             passcodeModalVisible: false
    //           });
    //         }
    //       });
    //   }
    // });
  };
  render() {
    if (this.state.loading) {
      return (
        <>
          <View
            style={{
              alignSelf: "center"
            }}
          >
            <Image
              style={localStyle.image}
              source={require("../../assets/Logo-pukar.png")}
            />
          </View>
          <ActivityIndicator
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
            color={theme.colorGrey}
            size="large"
          />
          <NetworkUtilModal
            visible={!!this.state.NetworkUtilModal}
            updateVisible={() => {
              this.setState({
                NetworkUtilModal: !this.state.NetworkUtilModal
              });
              // this.forceUpdate();
              this.componentDidMount();
            }}
          />
        </>
      );
    } else if (this.state.passcodeModalVisible) {
      return (
        <PasscodeModal
          isVisible={this.state.passcodeModalVisible}
          navigation={this.props.navigation}
          afterAuthentication={this.afterAuthentication}
        />
      );
    } else {
      return (
        <View style={{ ...styles.fillSpace }}>
          <View
            style={{
              top: theme.size(-150)
            }}
          >
            <Image
              style={localStyle.image}
              source={require("../../assets/Logo-pukar.png")}
            />
          </View>
          <View
            style={{
              top: theme.size(-20),
              width: "80%"
            }}
          >
            <Text
              style={[styles.bodyText, { textAlign: "center" }]}
              // numberOfLines={3}
            >
              Licensed, board-acredited therapist. All PHD or Master with
              counselling certification and years of experience
            </Text>
          </View>
          <View style={{ bottom: theme.size(-100) }}>
            <Button
              buttonStyle={{
                // backgroundColor: theme.colorGrey,
                borderRadius: theme.size(6),
                alignSelf: "center",
                height: 48,
                paddingHorizontal: theme.size(70)
                // width:'90%'
                // paddingVertical: theme.size(10)
                //  margin:10
              }}
              titleStyle={
                {
                  // ...styles.title,
                  // color: theme.colorAccent,
                  // fontFamily: theme.font.medium
                }
              }
              // buttonStyle={{

              // }}
              title="Getting Started"
              onPress={() => this.props.navigation.navigate("signupOptions")}
              ViewComponent={LinearGradient}
            />
          </View>
          <View style={{ bottom: theme.size(-120) }}>
            <Text
              style={[styles.bodyText, { textAlign: "center" }]}
              numberOfLines={2}
            >
              Already have an account?
              <Text
                style={{ color: theme.colorPrimary }}
                onPress={() => this.props.navigation.navigate("Login")}
              >
                &nbsp;Login
              </Text>
            </Text>
          </View>
        </View>
      );
    }
  }
}
