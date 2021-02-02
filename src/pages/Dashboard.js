import React, { Component } from "react";
import {
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Button
} from "react-native";
import { styles, theme } from "../styles";
import { Avatar, Icon, Divider } from "react-native-elements";
import Drawer from "react-native-drawer";
import List from "../components/List";
import Header from "../components/Header";
import DashboardButton from "../components/DashboardButton";
import LinearGradient from "react-native-linear-gradient";
import session from "../data/session";
import PasscodeModal from "../components/PasscodeModal";
import { roles } from "../util/enums/User";

import { pushTypes } from "../util/pushTypes";
import ReasonModal from "../components/ReasonModal";
//import { http } from "../util/http";
import Snack from "../components/Snackbar";
import SessionModal from "../pages/Session";
import * as actions from "../store/actions";
import { connect } from "react-redux";
import ConfirmationModal from "../components/ConfirmationModal";
import fire from "../services/firebase";
import ImageInput from "../components/ImageInput";
const { width, height } = Dimensions.get("window");
import NetworkUtils from "../components/NetworkUtil";
import { withNavigation } from "react-navigation";
const drawerStyles = {
  drawer: { shadowColor: "#000000", shadowOpacity: 0.8, shadowRadius: 3 },
  main: { paddingLeft: 3 }
};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    console.log("dash");
    this.state = {
      drawer: false,
      loading: false,
      user: { role: "USER" },
      passcodeModalVisible: false,
      changeTherapistModal: false,
      changeTherapistReason: "",
      changeTherapistLoader: false,
      comingSoonModalVisible: false,
      comingSoonModalVisible2: false,
      unreadCount: false
    };
    //  notificationConfigure(this.onNotification);
  }

  onNotification = async notification => {
    const user = await session.getUser();
    if (notification && notification.data.type === pushTypes.message) {
      if (user.role === roles.therapist) {
        this.props.navigation.navigate("TherapistChat", {
          patientId: notification.data.id,
          user: user,
          patientName: notification.data.senderName,
          rightIcon: notification.data.photo
        });
      } else if (user.role === roles.user) {
        this.props.navigation.navigate("UserChat", { user: user });
      }
    }
    if (
      notification &&
      notification.data.type === pushTypes.therapistAssigned
    ) {
      if (user.role === roles.user) {
        this.props.navigation.navigate("UserChat", { user: user });
      }
    }
    if (notification && notification.data.type === pushTypes.newPatient) {
      this.props.navigation.navigate("UnassignedUsers", { user: user });
    }
    if (notification && notification.data.type === pushTypes.call) {
      this.props.navigation.navigate("RecieveCall", {
        user: user,
        notification: {
          id: notification.data.id,
          type: notification.data.type,
          senderName: notification.data.senderName,
          photo: notification.data.photo,
          callId: notification.data.callId
        }
      });
    }
    if (
      notification &&
      (notification.data.type === pushTypes.cancelCall ||
        notification.data.type === pushTypes.declineCall ||
        notification.data.type === pushTypes.missedCall)
    ) {
      if (user.role === roles.therapist) {
        this.props.navigation.navigate("TherapistChat", {
          patientId: notification.data.id,
          user: user,
          patientName: notification.data.senderName,
          rightIcon: notification.data.photo
        });
      } else if (user.role === roles.user) {
        this.props.navigation.navigate("UserChat", { user: user });
      }
    }
    if (notification && notification.data.type === pushTypes.welcomeUser) {
      this.props.navigation.navigate("UserChat", { user: user });
    }
  };

  async componentDidMount() {
    const user = await session.getUser();

    this.setState({ user, loading: false });
    if (!user) {
      this.setState({
        loading: true
      });
      this.props.navigation.navigate("Login", { update: true });
    }
    this.setState({ user, loading: false });
    await this.afterAuthentication();
    await this.props.fetchUsers();

    await this.props.fetchDiary();

    // this.unsubscribe = await fire
    //   .firestore()
    //   .collection("channels")
    //   .where("seen", "==", false)
    //   .onSnapshot(item => {
    //     let count = 0;
    //     item.docs.map(async s => {
    //       if (
    //         s.data()?.recipientID == user.id &&
    //         s.data()?.senderID != user.id
    //       ) {
    //         console.log(s.data(), "213");
    //         let channelID =
    //           s.data()?.senderID < s.data()?.recipientID
    //             ? s.data()?.senderID + s.data()?.recipientID
    //             : s.data()?.recipientID + s.data()?.senderID;
    //         console.log(channelID, "chanellDUDUUDUD");
    //         await fire
    //           .firestore()
    //           .collection("channels")
    //           .where("channelID", "==", channelID)
    //           .onSnapshot(item => {
    //             count++;

    //             this.setState({
    //               unreadCount: count
    //             });
    //           });
    //       }
    //     });
    //   });

    this.unsubscribe = await fire
      .firestore()
      .collection("channels")
      .where("recipientID", "==", this.state.user.id)
      .where("seen", "==", false)
      .limit(1)
      .onSnapshot(item => {
        if (item.empty) {
          this.setState({ unreadCount: false });
        }

        if (item.docs.length >= 1) {
          this.setState({ unreadCount: true });
        } else {
          console.log("cb");
          this.setState({ unreadCount: false });
        }
        console.log(item.docs.length, "laskdlaksldlasd");
      });

    // messaging().setBackgroundMessageHandler(async remoteMessage => {
    //   console.log(remoteMessage, "remote MESSAGEE STUFFF");
    //     // } UJI NBDAQ0m                                     xv12             ,c        E#
    //     this.setState({
    //       loading: false,
    //       user: resp
    //     });
    //     // alert(resp.status)
    //     this.props.auth.users.forEach(u => {
    //       if (u._id === resp.jwt) {
    //         this.setState({ user: { ...resp, ...u } });
    //       }
    //     });
    //   } else {
    //     this.setState({
    //       loading: true
    //     });
    //     this.props.navigation.navigate("Login", { update: true });
    //   }
    // });
    // // alert(JSON.stringify(this.state.user))
    // await this.afterAuthentication()
    // PushNotification.popInitialNotification(async notification => {
    //   const user = await session.getUser();
    //   if (notification && notification.data.type === pushTypes.newMessage) {
    //     if (user.role === roles.therapist) {
    //       this.props.navigation.navigate("TherapistChat", {
    //         patientId: notification.data.id,
    //         user: user,
    //         patientName: notification.data.senderName,
    //         rightIcon: notification.data.photo
    //       });
    //     } else if (user.role === roles.user) {
    //       this.props.navigation.navigate("UserChat", { user: user });
    //     }
    //   }
    //   if (notification && notification.data.type === pushTypes.newPatient) {
    //     this.props.navigation.navigate("UnassignedUsers", { user: user });
    //   }
    // });

    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    //  this.unsub();
  }

  handleBackButton() {
    // console.log("HELo");
    return true;
  }

  changeDrawer = () => {
    this.setState({ drawer: !this.state.drawer });
  };

  afterAuthentication = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    session.getUser().then(async resp => {
      if (resp) {
        await fire
          .database()
          .ref(`users/${resp.id}`)
          .on("value", snap => {
            if (snap.exists()) {
              session.loggingIn({ ...resp, ...snap.val() });
              this.setState({
                loading: false,
                user: { ...resp, ...snap.val() },
                passcodeModalVisible: false
              });
            }
          });
      }
    });
  };

  componentWillReceiveProps(prevProps, prevState) {
    if (prevState.user) {
      if (this.props.navigation.getParam("update")) {
        session.getUser().then(resp => {
          if (resp) {
            if (resp.jwt !== prevState.user.jwt) {
              this.setState({
                loading: false,
                user: resp
              });
            }
          }
        });
      }
    } else {
      session.getUser().then(async resp => {
        if (resp) {
          let passcode = await session.getPasscode();
          if (passcode) {
            let isAuthenticated = await session.isAuthenticated();
            if (!isAuthenticated) {
              console.log("NOPE");
              this.setState({ passcodeModalVisible: true, loading: false });
              return;
            }
          }
          this.setState({
            loading: false,
            user: resp
          });
        } else {
          console.log("dashboard to login");
          this.setState({
            loading: true
          });
          this.props.navigation.navigate("Login", { update: true });
        }
      });
    }
  }

  logout = () => {
    session.loggingOut();
    session.isAuthenticated(false);
    this.props.navigation.navigate("Login", { update: true });
  };

  changeTherapistUserModal = () => {
    if (!this.state.changeTherapistModal) {
      this.changeDrawer();
      setTimeout(() => {
        this.setState({
          changeTherapistModal: !this.state.changeTherapistModal
        });
      }, 400);
    } else {
      this.setState({
        changeTherapistModal: !this.state.changeTherapistModal
      });
    }
  };

  changeComingSoonModal = async () => {
    if (!this.state.comingSoonModalVisible) {
      await this.changeDrawer();
      setTimeout(() => {
        this.setState({
          comingSoonModalVisible: !this.state.comingSoonModalVisible
        });
      }, 400);
    } else {
      this.setState({
        comingSoonModalVisible: !this.state.comingSoonModalVisible
      });
    }
  };

  changeComingSoonModal2 = () => {
    this.setState({
      comingSoonModalVisible2: !this.state.comingSoonModalVisible2
    });
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  onChangeTherapistSubmit = () => {
    const { changeTherapistReason, user } = this.state;
    if (changeTherapistReason.length === 0) {
      Snack("error", "Reason cant be empty");
      return;
    }
    if (!this.state.changeTherapistLoader) {
      this.setState({ changeTherapistLoader: true });
      // http
      //   .post(
      //     "/users/change-therapist",
      //     { reason: changeTherapistReason },
      //     { headers: { Authorization: `Bearer ${user.jwt}` } }
      //   )
      //   .then(resp => {
      //     Snack("success", "Request submitted successfully");
      //     this.setState({
      //       changeTherapistModal: false,
      //       changeTherapistReason: "",
      //       changeTherapistLoader: false
      //     });
      //   })
      //   .catch(err => {
      //     this.setState({
      //       changeTherapistLoader: false
      //     });
      //     if (err.response) {
      //       Snack("error", err.response.data.error);
      //     } else {
      //       Snack("error", "Unknown error occured, please contact an Admin");
      //     }
      //   });
    }
  };

  onChangeProfilePicture = async url => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    const { user } = this.state;
    await fire
      .database()
      .ref(`users/${user.id}/photo`)
      .set(url);
    await session.loggingIn({ ...user, photo: url });
    this.setState({ user: { ...user, photo: url } });
  };
  render() {
    console.log(this.state.unreadCount, "unreadddd");
    if (this.state.loading) {
      return <ActivityIndicator />;
    } else {
      if (this.state.user?.role === roles.therapist) {
        return (
          <Drawer
            open={this.state.drawer}
            type="overlay"
            content={
              <List
                navigation={this.props.navigation}
                onClose={this.changeDrawer}
                onLogout={this.logout}
                role={roles.therapist}
                // modalFunction={this.changeTherapistUserModal}
                comingSoonModal={this.changeComingSoonModal}
              />
            }
            tapToClose={true}
            onClose={() => this.setState({ drawer: false })}
            openDrawerOffset={0.2} // 20% gap on the right side of drawer
            panCloseMask={0.2}
            closedDrawerOffset={-3}
            styles={drawerStyles}
            tweenHandler={ratio => ({
              main: { opacity: (2 - ratio) / 2 }
            })}
            captureGestures={true}
            onClose={() => {
              this.setState({ drawer: false });
            }}
          >
            <View style={styles.fillSpace}>
              <ConfirmationModal
                visible={!!this.state?.therapistAvailabilityModalVisible}
                updateVisible={() =>
                  this.setState({
                    therapistAvailabilityModalVisible: false
                  })
                }
                message={"Please make yourself available"}
                close={() =>
                  this.setState({
                    therapistAvailabilityModalVisible: false
                  })
                }
                title={"Change Your Availability"}
                data={{
                  name: this.state.user?.name,
                  photo: this.state.user?.photo
                }}
                removeTherapist={() => {}}
                singleButton
              />
              <SessionModal
                visible={this.state.comingSoonModalVisible}
                updateVisible={this.changeComingSoonModal}
                message={"This feature is coming soon."}
              />
              <Header
                title={"Welcome to Pukaar"}
                changeDrawer={this.changeDrawer}
                icon={"menu"}
                logout={this.logout}
                customStyles={{
                  paddingTop:
                    Platform.OS === "ios"
                      ? (60 * Dimensions.get("window").height) / 896
                      : 20,
                  height:
                    Platform.OS === "ios"
                      ? (120 * Dimensions.get("window").height) / 896
                      : 80
                }}
              />

              <View style={{ width: "100%", flex: 1 }}>
                <ScrollView style={{ flex: 1, width: "100%" }}>
                  <>
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        height: width * 0.8,
                        width: "100%",
                        backgroundColor: theme.colorLightGrey
                      }}
                    >
                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 100,
                          borderColor: theme.colorGrey,
                          padding: 5,
                          width: 110,
                          height: 110,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <Avatar
                          rounded
                          size={100}
                          source={{
                            uri: this.state.user?.photo || ""
                          }}
                          // showEditButton
                          // // onPress={() => this.handleImage()}
                          // editButton={{
                          //   onPress: () => this.handleImage(),
                          //   containerStyle: { padding: 0 },
                          //   size: 20,
                          //   style: { margin: 5 },
                          //   iconStyle: { padding: 5 }
                          // }}
                        />
                        <View
                          style={[
                            {
                              width: 25,
                              height: 25,
                              borderRadius: 100,
                              // backgroundColor: theme.colorGrey,
                              position: "absolute",
                              bottom: 5,
                              right: 5,
                              padding: 0
                            },
                            this.state.user?.status === "available"
                              ? { backgroundColor: "#01E501" }
                              : { backgroundColor: theme.colorGrey }
                          ]}
                        >
                          <ImageInput
                            callback={url => {
                              this.onChangeProfilePicture(url);
                            }}
                          >
                            <Icon
                              name="edit"
                              color={theme.colorAccent}
                              size={14}
                              style={{ padding: 0, margin: 0 }}
                              underlayColor="transparent"
                            />
                          </ImageInput>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: theme.size(20)
                        }}
                      >
                        <Text
                          style={[styles.h1, { color: theme.colorDarkGrey }]}
                        >
                          {this.state.user?.name}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        // flexWrap: 'wrap',
                        justifyContent: "center",
                        alignItems: "center",
                        height: height * 0.25,
                        width: "100%",
                        backgroundColor: "#fff"
                      }}
                    >
                      <DashboardButton
                        title="Users"
                        subtitle="Client's Profile, Set Mood"
                        icon={[
                          {
                            name: "emoticon-happy-outline",
                            type: "material-community"
                          }
                        ]}
                        onPress={() =>
                          this.state.user?.status === "unavailable"
                            ? this.setState({
                                therapistAvailabilityModalVisible: true
                              })
                            : this.props.navigation.navigate("AssignedUsers", {
                                user: this.state.user
                              })
                        }
                      />
                      <DashboardButton
                        title="Chats"
                        chatCount={this.state.unreadCount}
                        subtitle="View Your Chats"
                        icon={{ name: "chat", type: "entypo" }}
                        onPress={() => {
                          if (this.state.user?.status === "unavailable") {
                            this.setState({
                              therapistAvailabilityModalVisible: true
                            });
                          } else {
                            this.props.navigation.pop();
                            this.props.navigation.navigate("UserChat", {
                              user: this.state.user,
                              unsubscribeCount: this.unsubscribe()
                            });
                          }
                        }}
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
                    >
                      <DashboardButton
                        title="Unassigned User"
                        subtitle="View Available Users"
                        icon={{
                          name: "account-plus-outline",
                          type: "material-community"
                        }}
                        onPress={() =>
                          this.state.user?.status === "unavailable"
                            ? this.setState({
                                therapistAvailabilityModalVisible: true
                              })
                            : this.props.navigation.navigate(
                                "UnassignedUsers",
                                {
                                  user: this.state.user
                                }
                              )
                        }
                      />
                      <DashboardButton
                        title="Forum"
                        subtitle="Pukaar Forum"
                        icon={{
                          name: "comment-question-outline",
                          type: "material-community"
                        }}
                        onPress={() =>
                          this.state.user?.status === "unavailable"
                            ? this.setState({
                                therapistAvailabilityModalVisible: true
                              })
                            : this.props.navigation.navigate("Forum", {
                                user: this.state.user
                              })
                        }
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
                    >
                      <DashboardButton
                        title="Sessions Summary"
                        subtitle="See Sessions' Summary"
                        icon={{
                          name: "money",
                          type: "font-awesome"
                        }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            "TherapistSessionsList"
                          )
                        }
                      />
                      <DashboardButton
                        title="Set Mood"
                        subtitle="Set Client Mood"
                        icon={{
                          name: "emoticon-happy-outline",
                          type: "material-community"
                        }}
                        onPress={() =>
                          this.state.user?.status === "unavailable"
                            ? this.setState({
                                therapistAvailabilityModalVisible: true
                              })
                            : this.props.navigation.navigate("AssignedUsers", {
                                user: this.state.user,
                                setMood: true
                              })
                        }
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        // flexWrap: 'wrap',
                        // justifyContent: 'center',
                        alignItems: "center",
                        height: height * 0.25,
                        // width: '100%',
                        backgroundColor: "#fff"
                      }}
                    >
                      <DashboardButton
                        title="Settings"
                        subtitle="Payment, Passcode ..."
                        icon={{
                          name: "settings-outline",
                          type: "material-community"
                        }}
                        onPress={() =>
                          this.props.navigation.navigate("Settings")
                        }
                      />
                    </View>
                  </>
                </ScrollView>
              </View>
            </View>
          </Drawer>
        );
      } else if (this.state.user?.role === roles.admin) {
        return (
          <Drawer
            open={this.state.drawer}
            type="overlay"
            content={
              <List
                navigation={this.props.navigation}
                onClose={this.changeDrawer}
                onLogout={this.logout}
                role={roles.admin}
                comingSoonModal={this.changeComingSoonModal}
              />
            }
            tapToClose={true}
            openDrawerOffset={0.2} // 20% gap on the right side of drawer
            panCloseMask={0.2}
            closedDrawerOffset={-3}
            onClose={() => this.setState({ drawer: false })}
            styles={drawerStyles}
            tweenHandler={ratio => ({
              main: { opacity: (2 - ratio) / 2 }
            })}
            captureGestures={true}
          >
            <View style={styles.fillSpace}>
              <SessionModal
                visible={this.state.comingSoonModalVisible}
                updateVisible={this.changeComingSoonModal}
                message={"This feature is coming soon."}
              />
              <Header
                title={"Welcome to Pukaar"}
                changeDrawer={this.changeDrawer}
                icon={"menu"}
                logout={this.logout}
                // customStyles={{
                //   paddingTop:
                //     Platform.OS === "ios"
                //       ? (60 * Dimensions.get("window").height) / 896
                //       : 20,
                //   height:
                //     Platform.OS === "ios"
                //       ? (120 * Dimensions.get("window").height) / 896
                //       : 80
                // }}
              />
              <View style={{ width: "100%", flex: 1 }}>
                {/* buttons */}
                {/* <SafeAreaView> */}
                <ScrollView style={{ flex: 1, width: "100%" }}>
                  {/* <SafeAreaView> */}
                  {/* long content here */}
                  <>
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        height: width * 0.8,
                        width: "100%",
                        backgroundColor: theme.colorLightGrey
                      }}
                    >
                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 100,
                          borderColor: theme.colorGrey,
                          padding: 5,
                          width: 110,
                          height: 110,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <Avatar
                          rounded
                          size={100}
                          source={{ uri: this.state.user?.photo || "" }}
                          // showEditButton
                          // // onPress={() => this.handleImage()}
                          // editButton={{
                          //   onPress: () => this.handleImage(),
                          //   containerStyle: { padding: 0 },
                          //   size: 20,
                          //   style: { margin: 5 },
                          //   iconStyle: { padding: 5 }
                          // }}
                        />
                        <View
                          style={[
                            {
                              width: 25,
                              height: 25,
                              borderRadius: 100,
                              // backgroundColor: theme.colorGrey,
                              position: "absolute",
                              bottom: 5,
                              right: 5,
                              padding: 0
                            },
                            // this.state.user?.status === "available"
                            //  { backgroundColor: "#01E501" }
                            { backgroundColor: theme.colorGrey }
                          ]}
                        >
                          <ImageInput
                            callback={url => {
                              this.onChangeProfilePicture(url);
                            }}
                          >
                            <Icon
                              name="edit"
                              color={theme.colorAccent}
                              size={14}
                              style={{ padding: 0, margin: 0 }}
                              underlayColor="transparent"
                            />
                          </ImageInput>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: theme.size(20)
                        }}
                      >
                        <Text
                          style={[styles.h1, { color: theme.colorDarkGrey }]}
                        >
                          {this.state.user?.name}
                        </Text>
                      </View>
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
                    >
                      <DashboardButton
                        title="Users"
                        subtitle="See Users Profile"
                        icon={{ name: "user", type: "font-awesome" }}
                        onPress={() =>
                          this.props.navigation.navigate("AdminUsers", {
                            user: this.state.user
                          })
                        }
                      />
                      <DashboardButton
                        title="Therapists"
                        subtitle="See Therapists"
                        icon={{ name: "user-md", type: "font-awesome" }}
                        onPress={() =>
                          this.props.navigation.navigate("AdminTherapists", {
                            user: this.state.user
                          })
                        }
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
                    >
                      <DashboardButton
                        title="Payment Verification"
                        subtitle="See Payments"
                        icon={{ name: "wallet", type: "entypo" }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            "AdminPaymentVerificationRequests",
                            {
                              user: this.state.user
                            }
                          )
                        }
                      />
                      <DashboardButton
                        title="Change Therapist Request"
                        subtitle="See Change Therapist Requests"
                        icon={{ name: "users", type: "entypo" }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            "AdminChangeTherapistRequests",
                            {
                              user: this.state.user
                            }
                          )
                        }
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
                    >
                      <DashboardButton
                        title="Donate Session Requests"
                        subtitle="See Donate Session Requests"
                        icon={{
                          name: "monetization-on",
                          type: "material-icons"
                        }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            "AdminDonateSessionRequests",
                            {
                              user: this.state.user
                            }
                          )
                        }
                      />
                      <DashboardButton
                        title="1 on 1 Session Requests"
                        subtitle="See Session Requests"
                        icon={{ name: "wallet", type: "entypo" }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            "Admin1on1SessionRequests",
                            {
                              user: this.state.user
                            }
                          )
                        }
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
                    >
                      <DashboardButton
                        title="Sessions Summary"
                        subtitle="See Therapist Sessions"
                        icon={{ name: "information" }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            "AdminTherapistSessionsList",
                            {
                              user: this.state.user
                            }
                          )
                        }
                      />
                      <DashboardButton
                        title="Forum"
                        subtitle="See Forum"
                        icon={{ name: "forum" }}
                        onPress={() =>
                          this.props.navigation.navigate("Forum", {
                            user: this.state.user
                          })
                        }
                      />
                    </View>
                  </>
                </ScrollView>
                {/* </SafeAreaView> */}
                {/* Bottom Navigation */}
                {/* <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                  style={{
                    height: height * 0.1,
                    width: '100%',
                    backgroundColor: theme.colorPrimary,
                    //  justifyContent: 'flex-end',
                    // alignItems: 'flex-end',
                    marginBottom:20
                  }}>
                  <View
                    style={{
                        justifyContent: 'flex-start',
                     alignItems: 'flex-start',
                      flexDirection: 'row',
                      height: '100%',
                      width: '100%',
                    }}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                      }}>
                      <Icon
                        name="Dashboard-outline"
                        color="white"
                        type="material-community"
                      />
                      <Text
                        style={[styles.subtitle, {color: theme.colorAccent}]}>
                        Dashboard
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              */}
              </View>
            </View>
          </Drawer>
        );
      } else if (this.state.user?.role === roles.user) {
        return (
          <Drawer
            open={this.state.drawer}
            type="overlay"
            content={
              <List
                navigation={this.props.navigation}
                onClose={this.changeDrawer}
                onLogout={this.logout}
                role={roles.user}
                modalFunction={this.changeTherapistUserModal}
                comingSoonModal={this.changeComingSoonModal}
              />
            }
            tapToClose={true}
            onClose={() => this.setState({ drawer: false })}
            openDrawerOffset={0.2} // 20% gap on the right side of drawer
            panCloseMask={0.2}
            closedDrawerOffset={-3}
            styles={drawerStyles}
            tweenHandler={ratio => ({
              main: { opacity: (2 - ratio) / 2 }
            })}
            captureGestures={true}
            onClose={() => {
              this.setState({ drawer: false });
            }}
          >
            <View style={styles.fillSpace}>
              <ReasonModal
                visible={this.state.changeTherapistModal}
                updateVisible={this.changeTherapistUserModal}
                message={"State the reason for"}
                title={"changing your therapist"}
                propertyName={"changeTherapistReason"}
                value={this.state.changeTherapistReason}
                onChange={this.onChange}
                onSubmit={this.onChangeTherapistSubmit}
                loading={this.state.changeTherapistLoader}
              />
              <SessionModal
                visible={this.state.comingSoonModalVisible}
                updateVisible={this.changeComingSoonModal}
                message={"This feature is coming soon."}
              />
              <SessionModal
                visible={this.state.comingSoonModalVisible2}
                updateVisible={this.changeComingSoonModal2}
                message={"This feature is coming soon."}
              />
              <View style={{ width: "100%", height: "100%", flex: 1 }}>
                <Header
                  title={"Welcome to Pukaar"}
                  changeDrawer={this.changeDrawer}
                  icon={"menu"}
                  logout={this.logout}
                  customStyles={{
                    paddingTop:
                      Platform.OS === "ios"
                        ? (60 * Dimensions.get("window").height) / 896
                        : 20,
                    height: (76 * Dimensions.get("window").height) / 896
                  }}
                />
                {/* buttons */}
                <ScrollView
                  style={{ width: "100%" }}
                  contentContainerStyle={{}}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      height: width * 0.8,
                      width: "100%",
                      backgroundColor: theme.colorLightGrey
                    }}
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 100,
                        borderColor: theme.colorGrey,
                        padding: 5,
                        width: 110,
                        height: 110,
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <Avatar
                        rounded
                        size={100}
                        source={{ uri: this.state.user?.photo || "" }}
                        // showEditButton
                        // // onPress={() => this.handleImage()}
                        // editButton={{
                        //   onPress: () => this.handleImage(),
                        //   containerStyle: { padding: 0 },
                        //   size: 20,
                        //   style: { margin: 5 },
                        //   iconStyle: { padding: 5 }
                        // }}
                      />
                      <View
                        style={[
                          {
                            width: 25,
                            height: 25,
                            borderRadius: 100,
                            // backgroundColor: theme.colorGrey,
                            position: "absolute",
                            bottom: 5,
                            right: 5,
                            padding: 0
                          },
                          // this.state.user?.status === "available"
                          //  { backgroundColor: "#01E501" }
                          { backgroundColor: theme.colorGrey }
                        ]}
                      >
                        <ImageInput
                          callback={url => {
                            this.onChangeProfilePicture(url);
                          }}
                        >
                          <Icon
                            name="edit"
                            color={theme.colorAccent}
                            size={14}
                            style={{ padding: 0, margin: 0 }}
                            underlayColor="transparent"
                          />
                        </ImageInput>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: theme.size(20)
                      }}
                    >
                      <Text style={[styles.h1, { color: theme.colorDarkGrey }]}>
                        {this.state.user?.name}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      // flexWrap: 'wrap',
                      justifyContent: "center",
                      alignItems: "center",
                      height: height * 0.25,
                      width: "100%",
                      backgroundColor: "#fff"
                    }}
                  >
                    <DashboardButton
                      title="Set Mood"
                      subtitle="Set Your Mood"
                      icon={[
                        {
                          name: "emoticon-neutral-outline",
                          type: "material-community"
                        },
                        {
                          name: "emoticon-happy-outline",
                          type: "material-community"
                        },
                        {
                          name: "emoticon-sad-outline",
                          type: "material-community"
                        }
                      ]}
                      onPress={() =>
                        this.props.navigation.navigate("SetMood", {
                          user: this.state.user
                        })
                      }
                    />
                    <DashboardButton
                      title="Chat"
                      chatCount={this.state?.unreadCount}
                      subtitle="See Your Chat"
                      icon={{ name: "chat", type: "entypo" }}
                      onPress={() => {
                        this.props.navigation.pop();
                        this.props.navigation.navigate("UserChat", {
                          user: this.state.user
                        });
                      }}
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
                  >
                    <DashboardButton
                      title="Diary"
                      subtitle="View Your Mood History"
                      icon={{
                        name: "book-open-outline",
                        type: "material-community"
                      }}
                      onPress={() =>
                        this.props.navigation.navigate("Diary", {
                          userId: this.state.user?.id
                        })
                      }
                    />
                    <DashboardButton
                      title="Forum"
                      subtitle="Pukaar Forum"
                      icon={{
                        name: "comment-question-outline",
                        type: "material-community"
                      }}
                      onPress={() =>
                        this.props.navigation.navigate("Forum", {
                          user: this.state.user
                        })
                      }
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      // justifyContent: 'center',
                      alignItems: "center",
                      height: height * 0.25,
                      // width: '100%',
                      backgroundColor: "#fff"
                    }}
                  >
                    <DashboardButton
                      title="Buy A Session"
                      subtitle="Get Yourself A Session"
                      icon={{ name: "phone-in-talk", type: "material-icons" }}
                      onPress={() =>
                        this.props.navigation.navigate(
                          "PatientBuyDonateSession",
                          {
                            user: this.state.user,
                            buySession: true,
                            users: this.props.auth.users
                          }
                        )
                      }
                    />
                    <DashboardButton
                      title="Therapist"
                      subtitle="See Your Therapist Profile"
                      icon={{
                        name: "user-md",
                        type: "font-awesome"
                      }}
                      onPress={() =>
                        this.props.navigation.navigate("TherapistProfileUser")
                      }
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      // flexWrap: 'wrap',
                      // justifyContent: 'center',
                      alignItems: "center",
                      height: height * 0.25,
                      // width: '100%',
                      backgroundColor: "#fff"
                    }}
                  >
                    <DashboardButton
                      title="Donate A Session"
                      subtitle="Get Others A Session"
                      icon={{ name: "money", type: "font-awesome" }}
                      onPress={() =>
                        this.props.navigation.navigate(
                          "PatientBuyDonateSession",
                          {
                            user: this.state.user,
                            buySession: false,
                            users: this.props.auth.users
                          }
                        )
                      }
                    />
                    <DashboardButton
                      title="Settings"
                      subtitle="Payment, Passcode ..."
                      icon={{
                        name: "settings-outline",
                        type: "material-community"
                      }}
                      onPress={() => this.props.navigation.navigate("Settings")}
                    />
                  </View>
                </ScrollView>
                {/* Bottom Navigation */}
                {/* <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                  style={{height: '100%', width: '100%'}}>
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      height: '35%',
                      width: '100%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        height: '30%',
                        width: '100%',
                      }}>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          width: '33.3%',
                        }}
                        onPress={() =>
                          this.props.navigation.navigate('TherapistProfileUser')
                        }>
                        <Icon
                          name="account-circle-outline"
                          color="white"
                          type="material-community"
                        />
                        <Text
                          style={[styles.subtitle, {color: theme.colorAccent}]}>
                          Therapist
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          width: '33.3%',
                        }}
                        onPress={() =>
                          this.props.navigation.navigate('UserChat', {
                            user: this.state.user,
                          })
                        }>
                        <Icon
                          name="forum-outline"
                          color="white"
                          type="material-community"
                        />
                        <Text
                          style={[styles.subtitle, {color: theme.colorAccent}]}>
                          Chat
                        </Text>
                      </TouchableOpacity>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          width: '33.3%',
                        }}>
                        <Icon
                          name="Dashboard-outline"
                          color="white"
                          type="material-community"
                        />
                        <Text
                          style={[styles.subtitle, {color: theme.colorAccent}]}>
                          Dashboard
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient> */}
              </View>
            </View>
          </Drawer>
        );
      } else {
        return <View />;
      }
    }
  }
}

const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(
  mapToStateProps,
  actions
)(withNavigation(Dashboard));
