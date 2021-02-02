import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { styles, theme } from "../../styles";
import { Avatar, Divider, Icon } from "react-native-elements";
import Header from "../../components/Header";
//import { http } from '../../util/http';
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import { roles } from "../../util/enums/User";
import BottomBar from "../../components/BottomBar";
import Badge from "../../components/Badge";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
import NetworkUtilModal from "../../components/NetworkUtilModal";
export default class PatientProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.navigation.getParam("userId"),
      user: null,
      loading: true,
      loggedInUser: props.navigation.getParam("user")
    };
  }

  getUser = async id => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    await firebase
      .database()
      .ref(`users/${id}`)
      .on("value", snap => {
        if (snap.val()) {
          this.setState({ user: snap.val(), loading: false });
        }
      });
    console.log("userProfi", this.state.user);
  };

  // isTherapist = () => {
  //     return this.state.loggedInUser.role === roles.therapist
  // }

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.userId !== this.props.navigation.getParam("userId")) {
      this.setState({
        userId: this.props.navigation.getParam("userId"),
        loading: true
      });
      await this.getUser(this.props.navigation.getParam("userId"));
    }
  }

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    await this.getUser(this.props.navigation.getParam("userId"));
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
            //role={this.state.user?.role || "ADMIN"}
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
        <Header
          title={"Profile"}
          changeDrawer={this.goBack}
          icon={"arrow-back"}
          customStyles={{
            height: (76 * Dimensions.get("window").height) / 896
          }}
          //  iconRight={"exit-to-app"}
          // logout={this.logout}
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
        {this.state.loading && !user ? (
          <View style={styles.fillSpace}>
            <ActivityIndicator color={theme.colorGrey} />
          </View>
        ) : (
          <View style={styles.fillSpace}>
            <View
              style={{ flex: 1, justifyContent: "space-between", width: "95%" }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    flexDirection: "row",
                    width: "80%",
                    marginLeft: "10%",
                    // justifyContent: 'space-evenly',
                    marginTop: theme.size(30)
                  }}
                >
                  <Avatar
                    rounded
                    size={85}
                    source={{ uri: user?.photo ? user.photo : "" }}
                  />

                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      marginLeft: 10
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start"
                        // margin: -5,
                        // marginTop:0
                        // marginLeft: theme.size(-5),
                      }}
                    >
                      <Text
                        style={[
                          styles.h2,
                          {
                            // fontFamily: theme.font.regular,
                            // fontSize: 18,
                            marginLeft: 5
                          }
                        ]}
                      >
                        {user.name}
                      </Text>
                      {this.state.loggedInUser.role === "USER" && (
                        <Icon
                          name="square-edit-outline"
                          type="material-community"
                          color={theme.colorPrimary}
                          underlayColor="transparent"
                          size={20}
                          style={{ paddingTop: -15, marginLeft: 8 }}
                          containerStyle={{ marginLeft: 8, marginTop: -5 }}
                          onPress={() => {
                            this.props.navigation.navigate("signup", {
                              user: this.state.loggedInUser,
                              userId: this.state.userId
                            });
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          // fontFamily: theme.font.medium,
                          color: theme.colorGrey,
                          // fontSize: 18,
                          marginLeft: 5
                          // marginTop: -5
                        }
                      ]}
                    >
                      {user.email || ""}
                    </Text>
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          // fontFamily: theme.font.medium,
                          color: theme.colorGrey,
                          // fontSize: 18,
                          marginLeft: 5
                          // marginTop: -5
                        }
                      ]}
                    >
                      {user.phone || ""}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        // margin: -5,
                        marginTop: -5
                        // marginLeft: theme.size(-5),
                      }}
                    >
                      <Icon
                        name="info"
                        color="#F2BC3B"
                        size={15}
                        underlayColor="transparent"
                      />
                      <Text
                        style={[
                          styles.subtitle,
                          {
                            // fontFamily: theme.font.regular,
                            color: theme.colorGrey
                          }
                        ]}
                      >
                        {this.state.user.sessionsTaken || 0}
                        {"/"}
                        {(parseInt(this.state.user.sessionsTaken) || 0) +
                          (parseInt(this.state.user.sessionsLeft) || 0)}{" "}
                        Sessions Taken
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={[
                    styles.h1,
                    {
                      textAlign: "center",
                      color: theme.colorPrimary,
                      marginTop: theme.size(30)
                    }
                  ]}
                >
                  Questions/Answers
                </Text>
                <View
                  style={{
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.inputBordercolor,
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    marginBottom: theme.size(20),
                    paddingBottom: 20
                  }}
                >
                  <Text
                    style={[
                      styles.subtitle,
                      styles.bodyPadding,
                      { marginTop: theme.size(20) }
                    ]}
                  >
                    What is your orientation?
                  </Text>
                  <Badge value={user.orientation} />
                  <Divider
                    style={{
                      alignSelf: "center",
                      backgroundColor: theme.colorGrey,
                      marginTop: theme.size(20),
                      height: theme.size(0.5),
                      width: "80%"
                    }}
                  />

                  <Text
                    style={[
                      styles.subtitle,
                      styles.bodyPadding,
                      { marginTop: theme.size(20) }
                    ]}
                  >
                    What do you think your are suffering from?
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {user.selectedDiseases?.map(item => <Badge value={item} />)}
                  </View>

                  <Divider
                    style={{
                      alignSelf: "center",
                      backgroundColor: theme.colorGrey,
                      marginTop: theme.size(20),
                      height: theme.size(0.5),
                      width: "80%"
                    }}
                  />

                  <Text style={[styles.subtitle, styles.bodyPadding]}>
                    Do you consider yourself to be religious?
                  </Text>
                  <Badge value={user.religious ? "Yes" : "No"} />
                  <Divider
                    style={{
                      alignSelf: "center",
                      backgroundColor: theme.colorGrey,
                      marginTop: theme.size(20),
                      height: theme.size(0.5),
                      width: "80%"
                    }}
                  />

                  <Text
                    style={[
                      styles.subtitle,
                      styles.bodyPadding,
                      { marginTop: theme.size(20) }
                    ]}
                  >
                    What religion do you identify with?
                  </Text>
                  <Badge value={user.religion} />
                  <Divider
                    style={{
                      alignSelf: "center",
                      backgroundColor: theme.colorGrey,
                      marginTop: theme.size(20),
                      height: theme.size(0.5),
                      width: "80%"
                    }}
                  />

                  <Text
                    style={[
                      styles.subtitle,
                      styles.bodyPadding,
                      { marginTop: theme.size(20) }
                    ]}
                  >
                    How would you rate your current sleeping habits?
                  </Text>
                  <Badge value={user.sleepingHabits} />
                  <Divider
                    style={{
                      alignSelf: "center",
                      backgroundColor: theme.colorGrey,
                      marginTop: theme.size(20),
                      height: theme.size(0.5),
                      width: "80%"
                    }}
                  />

                  <Text
                    style={[
                      styles.subtitle,
                      styles.bodyPadding,
                      { marginTop: theme.size(20) }
                    ]}
                  >
                    Are you currently taking any medication?
                  </Text>
                  <Badge value={user.onMedication ? "Yes" : "No"} />
                </View>
              </ScrollView>
            </View>
          </View>
        )}
        {this.state.loggedInUser.role === roles.therapist ? (
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
        ) : null}
        {this.state.loggedInUser.role === roles.admin ? (
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
        ) : null}
      </Drawer>
    );
  }
}
