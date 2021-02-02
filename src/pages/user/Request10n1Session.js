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
import CustomCalendar from "../../components/CustomCalender";
import fire from "../../services/firebase";
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

class Request1On1Session extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.navigation.getParam("user"),
      loading: false
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
    this.props.navigation.goBack(null);
  };

  broadcastPushNotifications = (inputValue, admin, type) => {
    console.log(admin, "heyyy");
    const channel = admin;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }
    const sender = this.state.user;
    const fromTitle = sender.name;
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != this.state.user.id ||
        participant.jwt != this.state.user?.jwt ||
        participant._id != this.state.user._id
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
            title={"Schedule"}
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

                    padding: 30,
                    paddingBottom: 0
                  }
                ]}
              >
                Schedule a session
              </Text>
              <Text
                style={[
                  styles.title,
                  {
                    textAlign: "center",
                    margin: theme.size(25),
                    marginTop: theme.size(5),
                    fontFamily: theme.font.medium
                  }
                ]}
              >
                with your counsellor
              </Text>
              <CustomCalendar
                onPress={activeDate => {
                  this.setState({ activeDate });
                  // alert(activeDate)
                }}
              />
              <Button
                buttonStyle={{
                  // backgroundColor: theme.colorGrey,
                  borderRadius: theme.size(6),
                  alignSelf: "center",
                  paddingVertical: theme.size(10)
                  //  margin:10
                  // alignSelf: "center",textAlign:'center'
                }}
                titleStyle={{
                  ...styles.h2,
                  color: theme.colorAccent
                  //  alignSelf: "center",textAlign:'center'
                }}
                onPress={() => {
                  // this.setState({ changeTherapistModalVisible: true });
                  this.setState({ reasonModalVisible: true });
                  // props.updateVisible(null, 'remove');
                  // setRejectedModalVisible(true);
                }}
                containerStyle={{
                  width: "80%",
                  marginVertical: 50,
                  backgroundColor: theme.colorGrey,
                  alignSelf: "center",
                  textAlign: "center"
                  // ,justifyContent:'center',alignItems:'center'
                }}
                ViewComponent={LinearGradient}
                // linearGradientProps={null}
                title={"Request a Session"}
              />
              <Text
                style={[
                  styles.subtitle,
                  {
                    textAlign: "center",

                    margin: theme.size(25),

                    marginTop: theme.size(0),
                    color: theme.colorGrey
                  }
                ]}
              >
                Please choose a day that works for you. We will connect you with
                your therapist through confirmation call
              </Text>
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
        <Overlay
          isVisible={!!this.state.reasonModalVisible}
          onBackdropPress={() => {
            this.setState({ reasonModalVisible: false });
          }}
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
              <Text
                style={[
                  styles.h2,
                  {
                    fontFamily: theme.font.semibold,
                    padding: 0,
                    paddingTop: 10
                  }
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
                    this.setState({ selectedReason: otherReason })
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
                      reasonModalVisible: false,
                      selectedReason: ""
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
                  onPress={async () => {
                    if (!(await NetworkUtils.isNetworkAvailable())) {
                      return;
                    }
                    if (!!this.state.selectedReason) {
                      // alert(this.state.activeDate);
                      this.setState({ reasonModalVisible: false });

                      var ref = await fire
                        .database()
                        .ref("OneOnOneSessionRequests")
                        .push();
                      ref
                        .set({
                          id: ref.key,
                          reason: this.state.selectedReason,
                          date: Date(this.state.activeDate),
                          status: "pending",
                          user: {
                            name: this.state.user.name,
                            email: this.state.user.email,
                            id: this.state.user.id,
                            photo: this.state.user.photo
                          }
                        })
                        .then(res => {
                          this.goBack();
                          fire
                            .database()
                            .ref(`users`)
                            .orderByChild("role")
                            .equalTo("ADMIN")
                            .once("value", snap => {
                              if (snap.exists()) {
                                this.broadcastPushNotifications(
                                  "User is requesting for a 1on1 session",
                                  Object.values(snap.val()),
                                  "Admin1on1SessionRequests"
                                );
                              }
                            });

                          Snackbar("success", "Request Sent Succesfully");
                        });
                    } else {
                      Snackbar("error", "Please give some reason");
                    }
                  }}
                  containerStyle={{
                    width: "40%",
                    marginVertical: theme.size(10)
                  }}
                  ViewComponent={LinearGradient} // Don't forget this!
                  linearGradientProps={{
                    colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    start: { x: 0, y: 0 },
                    end: { x: 2, y: 2 }
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </Overlay>
      </Drawer>
    );
  }
}

const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(mapToStateProps)(Request1On1Session);
