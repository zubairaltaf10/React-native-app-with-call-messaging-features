import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  ScrollView,
  Share,
  Platform
} from "react-native";
import { styles, theme } from "../../styles";
import { Icon, Divider } from "react-native-elements";

import Header from "../../components/Header";
import BottomBar from "../../components/BottomBar";
import LinearGradient from "react-native-linear-gradient";
import session from "../../data/session";
import PrivacyPolicy from "../../pages/PrivacyPolicy";
import TermsModal from "../../pages/Terms";
import SessionModal from "../../pages/Session";

import { roles } from "../../util/enums/User";
import DashboardButton from "../../components/DashboardButton";

const { height, width } = Dimensions.get("window");

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privacyPolicyModalVisible: false,
      termsModalVisible: false,
      user: { role: "none" },
      donateSessionVisible: false
    };
  }

  componentDidMount() {
    session.getUser().then(user => {
      this.setState({ user: { ...user } });
    });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  updateDonateSessionVisiblity = () => {
    this.setState({
      donateSessionVisible: !this.state.donateSessionVisible
    });
  };

  updateVisible = () => {
    this.setState({
      privacyPolicyModalVisible: !this.state.privacyPolicyModalVisible
    });
  };

  updateTermsVisible = () => {
    this.setState({
      termsModalVisible: !this.state.termsModalVisible
    });
  };

  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
  };
  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          Platform.OS == "android"
            ? "Try out Pukaar Community.\nLink to application https://play.google.com/store/apps/details?id=com.pukaar.v1"
            : null,
        url:
          Platform.OS == "android"
            ? "https://play.google.com/store/apps/details?id=com.pukaar.v1"
            : null
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      // alert("ser", error.message);
      console("", error);
    }
  };
  render() {
    return (
      <View style={styles.fillSpace}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Header
            title={"Settings"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{ paddingTop: theme.size(0), height: theme.size(56) }}
            // iconRight={"exit-to-app"}
            // logout={this.logout}
          />
          <ScrollView>
            <View
              style={{
                flexDirection: "row",
                // flexWrap: 'wrap',
                justifyContent: "center",
                alignItems: "center",
                height: width * 0.5,
                width: "100%",
                backgroundColor: "#fff"
              }}
            >
              <DashboardButton
                title="App Passcode"
                subtitle=""
                icon={[
                  {
                    name: "key-outline",
                    type: "material-community"
                  }
                ]}
                onPress={() => this.props.navigation.navigate("AppPasscode")}
              />
              <DashboardButton
                title="Terms Of Use"
                // subtitle="Payment, Passcode ..."
                icon={{
                  name: "note-outline",
                  type: "material-community"
                }}
                onPress={() => this.props.navigation.navigate("Terms")}
              />
              {/* <DashboardButton
                title="Donate A Session"
                // subtitle="View Your Chats"
                icon={{name: 'gift-outline', type: 'material-community'}}
                onPress={() =>
                  this.setState({donateSessionVisible: true})
                }
              /> */}
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                // justifyContent: 'center',
                alignItems: "center",
                height: width * 0.5,
                width: "100%",
                backgroundColor: "#fff"
              }}
            >
              <DashboardButton
                title="Subscribe"
                // subtitle="View Available Users"
                icon={{
                  name: "bell-ring-outline",
                  type: "material-community"
                }}
                onPress={() => this.props.navigation.navigate("Subscribe")}
              />
              <DashboardButton
                title="Privacy Policy"
                // subtitle="Pukaar Forum"
                icon={{
                  name: "shield-account-outline",
                  type: "material-community"
                }}
                onPress={() => this.props.navigation.navigate("PrivacyPolicy")}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                // justifyContent: 'center',
                alignItems: "center",
                height: width * 0.5,
                width: "100%",
                backgroundColor: "#fff"
              }}
            >
              <DashboardButton
                title="Share"
                // subtitle="View Available Users"
                icon={{
                  name: "share-variant",
                  type: "material-community"
                }}
                onPress={() => this.onShare()}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                // justifyContent: 'center',
                alignItems: "center",
                height: height * 0.25,
                width: "100%",
                backgroundColor: "#fff"
              }}
            />
          </ScrollView>

          {/* </View> */}
        </View>
        <BottomBar
          options={[
            {
              title: "Home",
              icon: {
                name: "home-outline",
                color: "white",
                type: "material-community"
              },
              onPress: () => this.props.navigation.navigate("Dashboard")
            }
          ]}
        />
      </View>
    );
  }
}
