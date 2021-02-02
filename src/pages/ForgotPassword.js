import React, { Component } from "react";
import {
  ScrollView,
  View,
  Text,
  BackHandler,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { styles, theme } from "../styles/index";
import Input from "../components/Input";
import { Button, Avatar, CheckBox } from "react-native-elements";
import { Divider, Badge } from "react-native-elements";
//import {http} from '../util/http';
import firebase from "../services/firebase";
import Snack from "../components/Snackbar";
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
import LinearGradient from "react-native-linear-gradient";
import NetworkUtils from "../components/NetworkUtil";
export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      loading: false
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    // console.log(this.props)
    this.props.navigation.goBack();
    return true;
  };

  onSubmit = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    this.setState({ loading: true });
    var actionCodeSettings = {
      // url: 'https://www.google.com',
      // iOS: {
      //   bundleId: 'com.example.ios'
      // },
      // android: {
      //   packageName: 'com.pukaar.v1',
      //   installApp: true,
      //   minimumVersion: '12'
      // },
      // handleCodeInApp: true
    };

    if (this.valid()) {
      const { email } = this.state;
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(resp => {
          console.log(resp);

          this.setState({ loading: false });
          Snack("success", "Password reset request successfull, check mail");
          this.props.navigation.navigate("Login");
        })
        .catch(err => {
          this.setState({ loading: false });
          if (err.message) {
            Snack("error", err.message);
          } else {
            Snack("error", "Unknown error occured, please contact an Admin");
          }
        });
    } else {
      this.setState({ loading: false });
    }
  };

  valid() {
    const { email } = this.state;
    if (email.length === 0 || !emailRegex.test(email)) {
      Snack("error", "Please enter valid email");
      return false;
    }
    return true;
  }

  rememberMe = () => {
    this.setState({ checked: !this.state.checked });
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[styles.fillSpace, styles.bodyPadding]}>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View
              style={{
                marginBottom: theme.size(10),
                marginTop: theme.size(100)
              }}
            >
              <Text
                style={[
                  styles.h1,
                  { textAlign: "center", color: theme.colorPrimary }
                ]}
                numberOfLines={1}
              >
                Forgot Password
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: theme.size(-100)
              }}
            >
              <Input
                placeholder={"E-mail"}
                leftIcon={{ name: "mail-outline" }}
                keyboardType={"email-address"}
                onChange={this.onChange}
                propertyName={"email"}
                autoCapitalize="none"
              />
            </View>
            <View style={{ bottom: theme.size(30) }}>
              {this.state.loading ? (
                <Button loading ViewComponent={LinearGradient} />
              ) : (
                <Button
                  title="Forgot password"
                  onPress={() => this.onSubmit()}
                  ViewComponent={LinearGradient}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
