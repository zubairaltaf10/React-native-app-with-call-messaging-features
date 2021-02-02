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
import {
  Badge,
  Avatar,
  ListItem,
  Icon,
  Button,
  Overlay,
  Input
} from "react-native-elements";
import Header from "../../components/Header";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import { roles } from "../../util/enums/User";
import firebase from "../../services/firebase";
import Snackbar from "../../components/Snackbar";
import { notificationManager } from "../../components/notifications";
import { connect } from "react-redux";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
let reasonsList = [
  {
    title: "reason one here"
  },
  {
    title: "reason two here"
  },
  {
    title: "reason three here"
  },
  {
    title: "reason four here"
  }
];

class ChangeTherapistRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.navigation.getParam("user"),
      loading: false,
      selectedReason: reasonsList[0].title,
      otherReason: "Other",
      otherReasonModalVisible: false,
      changeTherapistModalVisible: false
    };
  }

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  componentDidMount() {
    console.log(this.props.auth.users, "lkkokokdassue");
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
    this.props.navigation.goBack(null);
  };

  updateSelectedReason = reason => {
    this.setState({ selectedReason: reason });
  };

  broadcastPushNotifications = (inputValue, admin, type, user) => {
    console.log("daasdm");
    const channel = admin;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }

    console.log(this.state.user, "change therapist req admi");
    const sender = user;
    const fromTitle = sender.name;
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != user.id ||
        participant.jwt != user.jwt ||
        participant._id != user._id
      ) {
        console.log("HEYYY", participant);
        notificationManager.sendPushNotification(
          participant,
          fromTitle,
          message,
          type,
          { fromUser: sender },
          false
        );
      }
    });
  };

  submitChangeRequest = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    const loggedUser = await session.getUser();
    let adminData = this.props.auth.users.filter(item => {
      return item.role === "ADMIN";
    });
    // alert();
    if (this.state.selectedReason) {
      await firebase
        .database()
        .ref(`ChangeTherapistRequests/${loggedUser.jwt}`)
        .orderByChild("status")
        .equalTo("pending")
        .once("value", snap => {
         
          if (snap.exists() && loggedUser.changeTherapistRequest === true) {
            Snackbar("error", "You have already submitted a request");
            this.goBack();
          } else {
            // alert( snap.ref)
            let key = snap.ref.push().key;
            snap.ref.push({
              date: Date(),
              reason: this.state.selectedReason,
              id: key,

              user: {
                id: loggedUser.jwt,
                name: loggedUser.name,
                photo: loggedUser.photo
              },

              status: "pending"
            });
            firebase
              .database()
              .ref(`users/${loggedUser.jwt}`)
              .update({ changeTherapistRequest: true });
            Snackbar("success", "You have succesfully submitted a request");
            this.setState({ selectedReason: "" });
            this.goBack();
          }
        });
    }
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
            //role={user?.role}
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
            title={"Change Therapist"}
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
              <Text
                style={[
                  styles.h1,
                  {
                    textAlign: "center",
                    color: theme.colorPrimary,

                    padding: 50,
                    paddingBottom: 0
                  }
                ]}
              >
                Why do you want to change your therapist?
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  {
                    textAlign: "center",
                    color: "black",
                    margin: theme.size(25),

                    marginTop: theme.size(5)
                  }
                ]}
              >
                Select your reason or share with us
              </Text>
              {reasonsList.map(reason => {
                let borderBottom =
                  this.state.selectedReason === reason.title
                    ? {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colorGradientEnd
                      }
                    : {
                        borderBottomWidth: 1,
                        borderBottomColor: "#f7f7f7"
                      };
                return (
                  <TouchableOpacity
                    onPress={() => this.updateSelectedReason(reason.title)}
                    style={[
                      { flexDirection: "row", alignItems: "center" },
                      borderBottom
                    ]}
                    key={reason.title}
                  >
                    {this.state.selectedReason === reason.title ? (
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={[
                          theme.colorGradientStart,
                          theme.colorGradientEnd
                        ]}
                        style={{
                          backgroundColor: "blue",
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
                        styles.title,
                        {
                          color: theme.colorGrey,
                          marginLeft: theme.size(15),
                          width: "60%"
                        }
                      ]}
                    >
                      {reason.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => {
                  this.updateSelectedReason(this.state.otherReason);
                  this.setState({ otherReasonModalVisible: true });
                }}
                style={[
                  { flexDirection: "row", alignItems: "center" },
                  this.state.selectedReason === this.state.otherReason
                    ? {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colorPrimary
                      }
                    : { borderBottomWidth: 1, borderBottomColor: "#f7f7f7" }
                ]}
                //   key={reason.title}
              >
                {this.state.selectedReason === this.state.otherReason ? (
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                    style={{
                      backgroundColor: "blue",
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
                    styles.title,
                    {
                      color: theme.colorGrey,
                      marginLeft: theme.size(15),
                      width: "60%"
                    }
                  ]}
                >
                  {this.state.otherReason || "Other"}
                </Text>
              </TouchableOpacity>
              <Button
                buttonStyle={{
                  // backgroundColor: theme.colorGrey,
                  borderRadius: theme.size(6),
                  alignSelf: "center",
                  height: 48
                  //  margin:10
                }}
                titleStyle={
                  {
                    // ...styles.title,
                    // color: theme.colorAccent,
                    // fontFamily: theme.font.medium
                  }
                }
                onPress={() => {
                  this.setState({ changeTherapistModalVisible: true });
                  // props.updateVisible(null, 'remove');
                  // setRejectedModalVisible(true);
                }}
                // disabled={this.state.selectedReason}
                // disabledStyle={{}}
                // disabledTitleStyle={{}}
                // ViewComponent={LinearGradient} // Don't forget this!
                // linearGradientProps={{
                //   start: { x: -10, y: 0 },
                //   end: { x: 1, y: 0 },
                //   colors: !this.state.selectedReason
                //     ? [theme.colorGradientStart, theme.colorGradientEnd]
                //     : [theme.colorLightGrey, theme.colorLightGrey]}}
                containerStyle={{
                  width: "80%",
                  marginVertical: 50,
                  backgroundColor: theme.colorGrey,
                  alignSelf: "center"
                }}
                ViewComponent={LinearGradient}
                // linearGradientProps={null}
                title={"Change My Therapist"}
              />
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
          <Overlay
            isVisible={this.state.otherReasonModalVisible}
            onBackdropPress={() => {}}
            overlayStyle={{ padding: 0, marginVertical: 20 }}
            borderRadius={20}
            height="auto"
          >
            <ScrollView style={{ borderRadius: 20 }}>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: theme.size(10),
                  marginBottom: 30
                }}
              >
                <Icon
                  name="close"
                  type="material-community"
                  size={30}
                  underlayColor="transparent"
                  containerStyle={{ alignSelf: "flex-end", marginRight: 10 }}
                  onPress={() => {
                    this.setState({ otherReasonModalVisible: false });
                    // props.updateVisible(null, 'remove');
                  }}
                />

                <Text
                  style={[
                    styles.h2,
                    { fontFamily: theme.font.semibold, padding: 0 }
                  ]}
                >
                  Reason of Request
                </Text>

                <View style={{ marginVertical: theme.size(20), width: "80%" }}>
                  <Input
                    inputContainerStyle={{
                      borderBottomWidth: 0
                    }}
                    multiline={true}
                    placeholder={"Write your reason of request here."}
                    textAlignVertical={"top"}
                    autoFocus={!!this.state.otherReasonModalVisible}
                    placeholderTextColor={theme.colorGrey}
                    containerStyle={{
                      padding: 10,
                      borderRadius: 20,
                      backgroundColor: "#ddd",
                      fontFamily: "Montserrat-Medium",
                      fontSize: 12,
                      borderWidth: 0,
                      minHeight: 200
                    }}
                    inputStyle={{
                      fontFamily: "Montserrat-Medium",
                      fontSize: 12
                    }}
                    multiLine={true}
                    onChangeText={otherReason =>
                      this.setState({
                        otherReason,
                        selectedReason: otherReason
                      })
                    }
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "80%"
                  }}
                >
                  <Button
                    title="Cancel"
                    buttonStyle={{
                      backgroundColor: theme.colorGrey,
                      borderRadius: theme.size(6)
                      //  marginLeftl:10
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => {
                      this.setState({
                        otherReasonModalVisible: false
                        // otherReason: ""
                      });
                      // props.updateVisible(null, 'remove');
                      // setRejectedModalVisible(true);
                    }}
                    containerStyle={{
                      width: "40%",
                      marginVertical: theme.size(10)
                    }}
                    linearGradientProps={null}
                  />

                  <Button
                    title="Done"
                    buttonStyle={{
                      borderRadius: theme.size(6)

                      // marginRight:10,
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => {
                      this.setState({ otherReasonModalVisible: false });
                      // props.removeTherapist();
                      // setApprovedModalVisible(true);
                    }}
                    containerStyle={{
                      width: "40%",
                      marginVertical: theme.size(10)
                    }}
                    ViewComponent={LinearGradient} // Don't forget this!
                    linearGradientProps={{
                      colors: [
                        theme.colorGradientStart,
                        theme.colorGradientEnd
                      ],
                      start: { x: 0, y: 0 },
                      end: { x: 2, y: 2 }
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </Overlay>
          <Overlay
            isVisible={this.state.changeTherapistModalVisible}
            onBackdropPress={() => {}}
            overlayStyle={{ padding: 0, marginVertical: 20 }}
            borderRadius={20}
            height="auto"
          >
            <ScrollView style={{ borderRadius: 20 }}>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: theme.size(10),
                  marginBottom: 30
                }}
              >
                <Icon
                  name="close"
                  type="material-community"
                  size={30}
                  underlayColor="transparent"
                  containerStyle={{ alignSelf: "flex-end", marginRight: 10 }}
                  onPress={() => {
                    this.setState({ changeTherapistModalVisible: false });
                    // props.updateVisible(null, 'remove');
                  }}
                />

                <Text
                  style={[
                    styles.h2,
                    {
                      fontFamily: theme.font.medium,
                      padding: 20,
                      textAlign: "center"
                    }
                  ]}
                >
                  Do you want to send request to change your therapist
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "80%"
                  }}
                >
                  <Button
                    title="No"
                    buttonStyle={{
                      backgroundColor: theme.colorGrey,
                      borderRadius: theme.size(6)
                      //  marginLeftl:10
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => {
                      this.setState({ changeTherapistModalVisible: false });
                      // props.updateVisible(null, 'remove');
                      // setRejectedModalVisible(true);
                    }}
                    containerStyle={{
                      width: "40%",
                      marginVertical: theme.size(10)
                    }}
                    linearGradientProps={null}
                  />

                  <Button
                    title="Yes"
                    buttonStyle={{
                      borderRadius: theme.size(6)

                      // marginRight:10,
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => {
                      this.setState({ changeTherapistModalVisible: false });
                      this.submitChangeRequest();
                      // props.removeTherapist();
                      // setApprovedModalVisible(true);
                    }}
                    containerStyle={{
                      width: "40%",
                      marginVertical: theme.size(10)
                    }}
                    ViewComponent={LinearGradient} // Don't forget this!
                    // linearGradientProps={{
                    //   start: { x: 0, y: 0 },
                    //   end: { x: 1, y: 1 },
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd]

                    // }}
                  />
                </View>
              </View>
            </ScrollView>
          </Overlay>
        </View>
      </Drawer>
    );
  }
}

const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(mapToStateProps)(ChangeTherapistRequest);
