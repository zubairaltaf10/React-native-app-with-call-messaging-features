import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Dimensions
} from "react-native";
import { styles, theme } from "../../styles";
import { Badge, Avatar, ListItem, Icon } from "react-native-elements";
import Header from "../../components/Header";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import { roles } from "../../util/enums/User";
import Drawer from "react-native-drawer";
import List from "../../components/List";

let moodList = [
  {
    title: "Crying",
    icon: "emoticon-cry-outline"
  },
  {
    title: "Depressed",
    icon: "emoticon-dead-outline"
  },
  {
    title: "Excited",
    icon: "emoticon-excited-outline"
  },
  {
    title: "Ok",
    icon: "emoticon-neutral-outline"
  },
  {
    title: "Sad",
    icon: "emoticon-sad-outline"
  }
];

export default class SetMood extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.navigation.getParam("user"),
      loading: false,
      selectedMood: "Crying"
    };
  }

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
    return true;
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  updateSelectedMood = mood => {
    this.setState({ selectedMood: mood });
    this.props.navigation.navigate("SetNote", { mood: mood });
  };

  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
  };

  render() {
    const { user } = this.state;
    return (
      <Drawer
        open={this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={this.logout}
            ////role={this.state.user?.role || "USER"}
            // modalFunction={this.changeTherapistUserModal}
            // comingSoonModal={this.changeComingSoonModal}
          />
        }
        tapToClose={true}
        openDrawerOffset={0.2} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        closedDrawerOffset={-3}
        styles={{
          drawer: {
            shadowColor: "#000000",
            shadowOpacity: 0.8,
            shadowRadius: 3
          },
          main: { paddingLeft: 3 }
        }}
        tweenHandler={ratio => ({
          main: { opacity: (2 - ratio) / 2 }
        })}
        captureGestures={true}
        onClose={() => {
          this.setState({ drawer: false });
        }}
      >
        <View style={styles.fillSpace}>
          <Header
            title={"Set mood"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            // iconRight={"exit-to-app"}
            // logout={this.logout}
          />
          <View
            style={{ flex: 1, justifyContent: "space-between", width: "100%" }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* <View style={{ alignItems: "center", marginTop: theme.size(20) }}>
                <Avatar rounded size={100} source={{ uri: user.photo }} />
              </View> */}
              <Text
                style={[
                  styles.h1,
                  {
                    textAlign: "center",
                    color: theme.colorPrimary,
                    marginTop: theme.size(20)
                  }
                ]}
              >
                Select one option
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  {
                    textAlign: "center",
                    color: "black",
                    marginBottom: theme.size(25),
                    fontFamily: theme.font.medium
                  }
                ]}
              >
                Select the correct option
              </Text>
              {moodList.map(mood => {
                let borderBottom =
                  this.state.selectedMood === mood.title
                    ? {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colorGradientEnd
                      }
                    : {
                        borderBottomWidth: 1,
                        borderBottomColor: "#f6f6f6"
                      };
                return (
                  <TouchableOpacity
                    onPress={() => this.updateSelectedMood(mood.title)}
                    style={[
                      { flexDirection: "row", alignItems: "center" },
                      borderBottom
                    ]}
                    key={mood.title}
                  >
                    {this.state.selectedMood === mood.title ? (
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={[
                          theme.colorGradientStart,
                          theme.colorGradientEnd
                        ]}
                        style={{
                          // backgroundColor: "blue",
                          width: theme.size(70),

                          height: theme.size(70),
                          justifyContent: "center"
                        }}
                      >
                        <Icon
                          name="check"
                          color="white"
                          type="material-community"
                          underlayColor="transparent"
                        />
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          width: theme.size(70),

                          height: theme.size(70),
                          justifyContent: "center",
                          backgroundColor: "#f8f8f8"
                        }}
                      />
                    )}
                    <Text
                      style={[
                        styles.bodyText,
                        {
                          color: theme.colorGrey,
                          marginLeft: theme.size(15),
                          width: "60%"
                        }
                      ]}
                    >
                      {mood.title}
                    </Text>
                    <Icon
                      name={mood.icon}
                      underlayColor="transparent"
                      color={
                        this.state.selectedMood === mood.title
                          ? theme.colorPrimary
                          : "black"
                      }
                      type="material-community"
                      size={50}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <BottomBar
            options={[
              {
                title: "More",
                icon: {
                  name: "more-horiz",
                  color: "white",
                  type: "material-icons"
                },
                onPress: () => this.setState({ drawer: true })
              },
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
      </Drawer>
    );
  }
}
