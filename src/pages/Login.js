import React, { Component } from "react";
import {
  View,
  Text,
  BackHandler,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
  Button as BtnRN
} from "react-native";
import { styles, theme } from "../styles/index";
import Input from "../components/Input";
import { Button, Avatar, CheckBox } from "react-native-elements";
import { Divider, Badge } from "react-native-elements";
//import { http } from "../util/http";
import Snack from "../components/Snackbar";
import session from "../data/session";
import firebase from "../services/firebase";
import LinearGradient from "react-native-linear-gradient";
import messaging from "@react-native-firebase/messaging";
import NetworkUtils from "../components/NetworkUtil";

const { width, height } = Dimensions.get("window");

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ".",
      password: "",
      checked: false,
      loading: false,
      viewPass: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.state.email === ".") {
        this.setState({ email: "" });
      }
      if (this.state.password === ".") {
        this.setState({ password: "" });
      }
    }, 1);
    session.getRememberMe().then(resp => {
      this.setState({
        email: resp.email,
        password: resp.password,
        checked: resp.email && resp.email.length > 0 ? true : false
      });
    });
  }

  onSubmit = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    // this.props.navigation.navigate('AppPasscode'); Testing purpose
    // return;
    const pushToken = await this.fetchPushTokenIfPossible();
    this.setState({ loading: true });
    if (this.valid()) {
      const { email, password } = this.state;
      let deviceToken = await session.getDeviceToken();
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async resp => {
          Snack("success", "Login successful");
          console.log(resp.user.uid);
          await firebase
            .database()
            .ref(`users/${resp.user.uid}`)
            .once("value", async snapshot => {
              if (snapshot.exists()) {
                //  await session.loggingOut()
                session.loggingIn({
                  ...snapshot.val(),
                  jwt: resp.user.uid,
                  id: resp.user.uid,
                  role: snapshot.val().role,
                  pushToken: pushToken,
                  allowNotification: true
                });
              }
            })
            .then(() => {
              firebase
                .database()
                .ref(`users/${resp.user.uid}`)
                .update({
                  pushToken: pushToken,
                  id: resp.user.uid,
                  allowNotification: true
                })
                .then(() => console.log("SUCCESS UPDATE"));
              setTimeout(() => {
                this.props.navigation.navigate("Dashboard", { update: true });
              }, 200);
            });

          this.state.checked
            ? session.setRememberMe(email, password)
            : session.setRememberMe("", "");
          this.setState({ loading: false, email: "", password: "" });
        })
        .catch(error => {
          this.setState({ loading: false });
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == "auth/weak-password") {
            Snack("error", "The password is too weak.");
          } else {
            Snack("error", errorMessage);
          }
          this.setState({ loading: false });
          console.log(error);
        });
    } else {
      this.setState({ loading: false });
    }
  };

  fetchPushTokenIfPossible = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await messaging().registerDeviceForRemoteMessages();

      console.log("Authorization status:", authStatus);
      return await messaging().getToken();
    }
  };

  valid() {
    const { email, password } = this.state;
    if ((email && email.length === 0) || !emailRegex.test(email)) {
      Snack("error", "Please enter valid email");
      return false;
    }
    if (password && password.length > 0) {
      return true;
    } else {
      Snack("error", "All fields must be filled");
      return false;
    }
  }

  rememberMe = () => {
    this.setState({ checked: !this.state.checked });
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{ flex: 1 }}
      >
        {/* <KeyboardAvoidingView behavior={'position'} style={{flex:1}}> */}
        <View style={[styles.fillSpace, styles.bodyPadding]}>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <KeyboardAvoidingView behavior="position">
              <View
                style={{
                  marginTop: theme.size(50),
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* <View style={{top: theme.size(-100)}}> */}
                <Image
                  style={{
                    width: width * 0.75,
                    height: width * 0.75,
                    borderRadius: theme.radius
                    // ...theme.shadow(16)
                  }}
                  source={require("../../assets/Logo-pukar.png")}
                />
                {/* </View> */}
                {/* <Text
              style={[
                {
                  textAlign: "center",
                  color: theme.colorPrimary,
                  top: theme.size(-10),
                  fontSize: 20
                }
              ]}
              numberOfLines={1}
            >
              Sign In
            </Text> */}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: theme.paddingBodyVertical
                }}
              >
                <Input
                  placeholder={"E-mail"}
                  leftIcon={{ name: "mail-outline", color: theme.colorGrey }}
                  keyboardType={"email-address"}
                  onChange={this.onChange}
                  propertyName={"email"}
                  value={this.state.email}
                  autoCapitalize="none"
                  value={this.state.email}
                />
                <Input
                  placeholder={"Password"}
                  leftIcon={{ name: "lock-outline", color: theme.colorGrey }}
                  secureTextEntry={!this.state.viewPass}
                  onChange={this.onChange}
                  propertyName={"password"}
                  value={this.state.password}
                  autoCapitalize="none"
                  rightIcon={{
                    name: this.state.viewPass
                      ? "eye-outline"
                      : "eye-off-outline",
                    type: "material-community",
                    color: theme.colorGrey,
                    onPress: () =>
                      this.setState({ viewPass: !this.state.viewPass }),
                    containerStyle: { padding: 10 }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <CheckBox
                    containerStyle={{ marginLeft: 0, paddingLeft: 0 }}
                    checked={this.state.checked}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    onPress={() => this.rememberMe()}
                  />
                  <Text style={[styles.subtitle, { marginLeft: -10 }]}>
                    Remember
                  </Text>
                </View>
                <Text
                  style={[styles.subtitle]}
                  onPress={() =>
                    this.props.navigation.navigate("ForgotPassword")
                  }
                >
                  Forgot Password?
                </Text>
              </View>
              <View style={{ bottom: theme.size(-30) }}>
                <Button
                  buttonStyle={{
                    // paddingVertical: theme.size(10),
                    height: 48,
                    borderRadius: 6
                  }}
                  containerStyle={{ marginVertical: theme.size(20) }}
                  title="Sign In"
                  // onLongPress={() => this.onSubmit()}
                  onPress={() => {
                    // alert("hello Salman");
                    this.onSubmit();
                  }}
                  loading={this.state.loading}
                  ViewComponent={LinearGradient}
                />

                {/* <Button
                buttonStyle={{
                  // paddingVertical: theme.size(10),
                  height: 48,
                  borderRadius: 6
                }}
                containerStyle={{ marginVertical: theme.size(60) }}
                title="Sign In"
                onLongPress={() => this.onSubmit()}
                onPress={() => this.onSubmit()}
                loading={this.state.loading}
                ViewComponent={LinearGradient}
              /> */}
              </View>
              <View style={{ marginVertical: theme.size(20) }}>
                <Text
                  style={[styles.bodyText, { textAlign: "center" }]}
                  numberOfLines={2}
                >
                  Dont have account?
                  <Text
                    style={{ color: theme.colorPrimary }}
                    onPress={() =>
                      this.props.navigation.navigate("signupOptions")
                    }
                  >
                    &nbsp;Create account
                  </Text>
                </Text>
              </View>
              <View style={{ marginBottom: theme.size(20) }}>
                <Text
                  style={[styles.bodyText, { textAlign: "center" }]}
                  numberOfLines={2}
                >
                  {/* Pukaar is free for a limited time only. */}
                </Text>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
        {/* </KeyboardAvoidingView> */}
      </TouchableWithoutFeedback>
    );
  }
}
