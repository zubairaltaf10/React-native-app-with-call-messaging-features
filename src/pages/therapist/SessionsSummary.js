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
import { Badge, Avatar, ListItem, Icon, Divider } from "react-native-elements";
import Header from "../../components/Header";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import { roles } from "../../util/enums/User";
import ConfirmationModal from "../../components/ConfirmationModal";
import fire from "../../services/firebase";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import moment from "moment";
import NetworkUtils from "../../components/NetworkUtil";
let sessionsList = [
  {
    name: "Patient1",
    time: "20:00",
    date: "12/20/2020"
  }
];

export default class SessionsSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.navigation.getParam("user"),
      loading: false,
      selectedSession: "",
      sessionDetailModalVisible: false
    };
  }

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    await this.getSessions();
    await this.getUser();
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

  updateSelectedSession = session => {
    this.setState({
      selectedSession: session,
      sessionDetailModalVisible: true
    });
    // this.props.navigation.navigate('SetNote', {mood: mood});
  };

  getUser = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    await fire
      .database()
      .ref(`users/${this.state.user._id}`)
      .once("value", snap => {
        if (snap.exists()) {
          this.setState({
            loading: false,
            user: { ...this.state.user, ...snap.val() }
          });
        }
      });
  };
  getSessions = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    const therapist = await session.getUser();
    let sessionsList = [];
    await fire
      .database()
      .ref(`SessionsSummary/${therapist.id}/ ${this.state.user._id}`)
      .on("value", snap => {
        if (snap.exists()) {
          sessionsList = Object.entries(snap.val()).map(entry => ({
            sessionId: entry[0],
            ...entry[1]
          }));
          // alert()
          this.setState({ sessionsList });
        }
      });
  };
  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
  };

  render() {
    const { user } = this.state;
    return (
      <Drawer
        open={!!this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={this.logout}
           //role={user.role}
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
            title={"Sessions Summary"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            //    iconRight={"exit-to-app"}
            //    logout={this.logout}
          />
          <View
            style={{ flex: 1, justifyContent: "space-between", width: "100%" }}
          >
            {this.state.user ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={[
                    styles.bodyText,
                    {
                      textAlign: "center",
                      color: theme.colorPrimary,
                      margin: 20
                    }
                  ]}
                >
                  Sessions Taken = {user.sessionsTaken || 0}
                </Text>
                <Text
                  style={[
                    styles.bodyText,
                    {
                      textAlign: "center",
                      color: theme.colorPrimary,
                      margin: 20,
                      marginTop: 0
                    }
                  ]}
                >
                  Sessions Left = {user.sessionsLeft || 0}
                </Text>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                  style={{
                    backgroundColor: "blue",
                    width: "100%",
                    height: theme.size(70),
                    justifyContent: "center"
                  }}
                >
                  <Text
                    style={[
                      styles.bodyText,
                      {
                        textAlign: "center",
                        color: "white",
                        // marginBottom: theme.size(25),
                        textAlignVertical: "center"
                      }
                    ]}
                  >
                    Session Details
                  </Text>
                </LinearGradient>
                <>
                  {this.state.sessionsList ? (
                    this.state.sessionsList?.map((session, index) => {
                      return (
                        <TouchableOpacity
                          onPress={() => this.updateSelectedSession(session)}
                          style={[
                            {
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderLeftWidth: 3,

                              borderLeftColor: theme.colorGrey,
                              borderBottomWidth: 0.5,

                              borderBottomColor: theme.colorLightGrey,
                              height: 80,
                              marginVertical: 1
                            }
                          ]}
                          key={session.sessionId}
                        >
                          <Text
                            style={[
                              styles.bodyText,
                              {
                                color: theme.colorDarkGrey,
                                marginLeft: theme.size(15),
                                width: "60%",

                                fontFamily: theme.font.medium
                              }
                            ]}
                          >
                            {session.feedback || "k"}
                          </Text>
                          <View>
                            <Text
                              style={[
                                styles.bodyText,
                                {
                                  color: theme.colorGrey,
                                  marginRight: theme.size(15),
                                  // width: '60%',
                                  fontSize: 10
                                }
                              ]}
                            >
                              {moment(session.startTime).format("HH:mm A") ||
                                ""}
                            </Text>
                            <Text
                              style={[
                                styles.bodyText,
                                {
                                  color: theme.colorPrimary,
                                  marginRight: theme.size(15),
                                  //   width: '60%',
                                  fontSize: 12
                                }
                              ]}
                            >
                              {moment(session.date).format("DD/MM/YYYY")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={{ ...styles.fillSpace, height: "100%" }}>
                      <Text
                        style={[
                          styles.h2,
                          {
                            textAlign: "center",
                            color: theme.colorPrimary,
                            textAlignVertical: "center",
                            alignSelf: "center",
                            marginTop: 100
                          }
                        ]}
                      >
                        No Sessions Found
                      </Text>
                    </View>
                  )}
                </>
              </ScrollView>
            ) : null}
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

          <ConfirmationModal
            visible={this.state.sessionDetailModalVisible}
            updateVisible={() =>
              this.setState({ sessionDetailModalVisible: false })
            }
            //   message={'Are you sure you want to'}
            title={"Session Details"}
            close={() => this.setState({ sessionDetailModalVisible: false })}
            removeTherapist={() => {}}
            data={{
              name: this.state.user.name || "",
              photo: this.state.user.photo || ""
            }}
            // horizontalButtons={true}
            singleButton={true}
          >
            {[
              {
                label: "Date Taken:",
                value:
                  moment(this.state.selectedSession.date).format(
                    "DD/MM/YYYY"
                  ) || "No Date"
              },
              {
                label: "Start time:",
                value:
                  moment(this.state.selectedSession.startTime).format(
                    "HH:mm A"
                  ) || "No Time"
              },
              {
                label: "End Time:",
                value:
                  moment(this.state.selectedSession.endTime).format(
                    "HH:mm A"
                  ) || "No Time"
              },
              {
                label: "Feedback:",
                value: ""
              }
            ].map((item, index) => (
              <>
                {index !== 0 && (
                  <Divider
                    style={{ marginVertical: theme.size(10), width: "100%" }}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "center"
                    //   marginLeft: 10,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      // padding: 20,

                      fontFamily: "Montserrat-Bold",
                      fontSize: 12,
                      flex: 1.5
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      // padding: 20,
                      color: "#1D1D26",
                      fontFamily: "Montserrat-Medium",
                      fontSize: 12,
                      flex: 1
                    }}
                  >
                    {item.value}
                  </Text>
                </View>
              </>
            ))}

            <Text
              style={{
                padding: 20,
                borderRadius: 20,
                backgroundColor: "#ddd",
                fontFamily: "Montserrat-Medium",

                fontSize: 12,
                marginTop: 10
              }}
            >
              {this.state.selectedSession.feedback || "No FeedBack"}
            </Text>
          </ConfirmationModal>
        </View>
      </Drawer>
    );
  }
}
