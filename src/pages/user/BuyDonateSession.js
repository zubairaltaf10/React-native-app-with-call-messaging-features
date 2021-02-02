import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  BackHandler
  //   Button,
} from "react-native";
import { styles, theme } from "../../styles";
import { Divider, Icon, Button } from "react-native-elements";
import NumericInput from "react-native-numeric-input";
// import Button from '../../components/Button';
import LinearGradient from "react-native-linear-gradient";
// import {session} from "../../../data/session";
import Picker from "../../components/Picker";
import { sessions } from "../../util/enums/User";
import Header from "../../components/Header";
import firebase from "../../services/firebase";
import BottomBar from "../../components/BottomBar";
import { TouchableOpacity } from "react-native-gesture-handler";
import ImageInput from "../../components/ImageInput";
import MaskedView from "@react-native-community/masked-view";
import Snackbar from "../../components/Snackbar";
import { notificationManager } from "../../components/notifications";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import session from "../../data/session";
import NetworkUtils from "../../components/NetworkUtil";
export default class BuyDonateSession extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      user: props.navigation.getParam("user"),
      userId: props.navigation.getParam("userId"),
      buySession: props.navigation.getParam("buySession"),
      sessions: 5,
      totalAmount: 2000
    };
  }

  componentDidMount() {
    // console.log(this.props.auth.users, "lkkokokdassue");
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
    console.log("daasdm");
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

  requestBuySession = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    let adminData = this.props.navigation.getParam("users").filter(item => {
      return item.role === "ADMIN";
    });

    if (!this.state.capturedReciept) {
      Snackbar("Error", "Please select payment reciept");
      return;
    }
    if (!this.state.sessions) {
      Snackbar("Error", "Please select session you want to purchase");
      return;
    }
    const request = {
      reciept: this.state.capturedReciept,
      sessions: this.state.sessions,
      date: Date(),
      status: "pending",
      amount: parseInt(this.state.sessions) * 400,
      user: {
        id: this.state.user?.jwt,
        photo: this.state.user.photo,
        name: this.state.user.name,
        email: this.state.user.email
      }
    };
    if (this.state.buySession) {
      const ref = await firebase
        .database()
        .ref("BuySessionRequests")
        .push();
      await ref
        .set({
          id: ref.key,
          ...request
        })
        .then(() => {
          this.props.navigation.goBack(null);
          Snackbar("success", "Request Sent Successfully");
          this.broadcastPushNotifications(
            "User has bought a session",
            adminData,
            "AdminPaymentVerificationRequests"
          );
        });
    } else {
      const ref = await firebase
        .database()
        .ref("DonateSessionRequests")
        .push();
      await ref
        .set({
          id: ref.key,
          ...request
        })
        .then(() => {
          this.props.navigation.goBack(null);
          Snackbar("success", "Request Sent Successfully");
          this.broadcastPushNotifications(
            "User has donated a session",
            adminData,
            "AdminDonateSessionRequests"
          );
        });
    }
  };
  logout = () => {
    session.loggingOut();
    session.isAuthenticated(false);
    this.props.navigation.navigate("Login", { update: true });
  };
  render() {
    return (
      <Drawer
        open={this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={this.logout}
            //role={this.state.user?.role}
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
            title={this.state.buySession ? "Buy a Session" : "Donate a Session"}
            navigation={this.props.navigation}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            // iconRight={"exit-to-app"}
            // logout={this.logout}
          />
          <View
            style={{ flex: 1, justifyContent: "space-between", width: "90%" }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  ...styles.h2,
                  // padding: 20,

                  fontFamily: theme.font.medium,
                  textAlign: "center",
                  flex: 1,
                  margin: 10,
                  marginTop: 20
                }}
              >
                {this.state.buySession
                  ? "Want to buy Session?"
                  : "Want to donate a session for someone else?"}
              </Text>
              <Text
                style={{
                  ...styles.subtitle,
                  // padding: 20,

                  fontFamily: theme.font.regular,
                  textAlign: "center",
                  flex: 1,
                  color: theme.colorMenuText,
                  margin: 10
                }}
              >
                {this.state.buySession
                  ? "Transfer your payment in following account:"
                  : "Transfer your donation in following account:"}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...styles.subtitle,
                  // padding: 20,
                  color: theme.colorPrimary,
                  fontFamily: "Montserrat-Bold",

                  flex: 1,
                  margin: 10
                  // color:theme.colorAccent
                }}
              >
                Allied Bank Limited
              </Text>
              {[
                { label: "Branch Code:", value: "1008 " },
                {
                  label: "Branch:",
                  value: "PIA Main Boulevard Branch, Plot No. 44"
                },
                { label: "Account No:", value: "0010069040620010" },
                { label: "Title:", value: "Shiza Asad" },
                { label: "IBAN:", value: "PK15 ABPA 0010 0690 4062 0010" },
                {
                  label: "Total Amount :",
                  value: this.state.totalAmount + " rs"
                }
              ].map(item => (
                <>
                  <Divider
                    style={{
                      marginVertical: theme.size(5),
                      width: "95%",
                      alignSelf: "center"
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      alignSelf: "center",
                      padding: 10
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        ...styles.subtitle,
                        // padding: 20,

                        fontFamily: theme.font.bold,

                        flex: 0.5,
                        color: theme.colorMenuText
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        // padding: 20,
                        color: theme.colorMenuText,
                        fontFamily: theme.font.medium,
                        fontSize: 12,
                        flex: 1
                        // color:theme.colorAccent
                      }}
                    >
                      {item.value}
                    </Text>
                  </View>
                </>
              ))}
              <View
                style={{
                  flexDirection: "row",
                  // alignSelf: "center",
                  //  marginTop: 10,

                  padding: 10,
                  //   marginBottom: 20,
                  justifyContent: "space-between"
                  // alignItems: "center"
                }}
              >
                <View>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...styles.subtitle,
                      // padding: 20,

                      fontFamily: theme.font.medium,

                      // flex: 0.5,
                      color: theme.colorPrimary
                    }}
                  >
                    Select sessions you want to purchase:
                  </Text>
                  <Text
                    style={{
                      textAlign: "right",
                      marginBottom: 20,
                      ...styles.subtitleLimit,
                      // padding: 20,

                      fontFamily: theme.font.regular,

                      // flex: 0.5,
                      color: theme.colorPrimary
                    }}
                  >
                    * Session Buy Limit 200
                  </Text>
                </View>
                {/* <Picker
                    containerStyle={{
                      flex: 0.5,
                      width: "100%",
                      marginTop: -15,
                      borderColor: "white",
                      alignSelf: "flex-end"
                      // ,height:10
                    }}
                   
                    onValueChange={sessions => this.setState({ sessions })}
                    selectedValue={""}
                    propertyName={"religious"}
                    data={sessions}
                    label={""}

                  /> */}
                <NumericInput
                  value={this.state.sessions}
                  minValue={1}
                  onChange={sessions => {
                    if (sessions > 0) {
                      this.setState({
                        sessions: sessions,
                        totalAmount: sessions * 400
                      });
                    } else {
                      this.setState({ sessions: 1, totalAmount: 400 });
                    }
                  }}
                  onLimitReached={(isMax, msg) =>
                    alert("Limit Exceeded. Please try again")
                  }
                  totalWidth={100}
                  totalHeight={30}
                  iconSize={25}
                  maxValue={200}
                  // step={1}
                  valueType="integer"
                  // type="up-down"
                  rounded
                  // textColor='#B0228C'
                  // iconStyle={{ color: 'white' }}
                  // rightButtonBackgroundColor='#EA3788'
                  // leftButtonBackgroundColor='#E56B70'
                />
              </View>

              {/* <View
              style={{
                flexDirection: "row",
                // alignSelf: "center",
                justifyContent:'space-between',
                padding: 10,  marginTop:-20,
                marginBottom:20
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...styles.subtitle,
                  // padding: 20,

                  fontFamily: theme.font.bold,

                  flex: 9,
                  color: theme.colorMenuText
                }}
              >
                Amount :
              </Text>
              <Text
                style={{
                  // padding: 20,
                  color: theme.colorMenuText,
                  fontFamily: theme.font.medium,
                  fontSize: 12,
                  flex:1.5
                  // color:theme.colorAccent
                }}
              >
                {parseInt(this.state.sessions) * 400}
              </Text>
            </View> */}
              <Text
                style={{
                  ...styles.subtitle,
                  // padding: 20,

                  fontFamily: theme.font.regular,
                  // textAlign: 'center',
                  flex: 1,
                  color: theme.colorMenuText,
                  margin: 10,
                  marginTop: -20
                }}
              >
                Attach a screenshot of your transaction:
              </Text>

              {console.log("opnjn", this.state.capturedReciept)}

              <ImageInput
                type="Photo"
                options={{
                  title: "Select Picture",
                  storageOptions: {
                    skipBackup: true,
                    path: "images"
                  },
                  maxWidth: 500,
                  maxHeight: 500,
                  quality: 0.9
                }}
                logo={true}
                callback={capturedReciept => this.setState({ capturedReciept })}
              >
                {this.state.capturedReciept ? (
                  <Image
                    style={{
                      height: 150,
                      width: "95%",
                      //   backgroundColor: '#ddd',
                      alignSelf: "center",

                      borderRadius: 5
                    }}
                    resideMode="cover"
                    source={
                      this.state.capturedReciept
                        ? {
                            uri: this.state.capturedReciept
                          }
                        : require("../../../assets/group.png")
                    }
                  />
                ) : (
                  <View
                    style={{
                      ...styles.fillSpace,
                      height: 150,
                      width: "95%",
                      flexDirection: "row",
                      flex: 0,
                      backgroundColor: "transparent"
                    }}
                  >
                    <Icon
                      name="plus"
                      type="entypo"
                      underlayColor="transparent"
                    />
                    <Text>Add Reciept</Text>
                  </View>
                )}
              </ImageInput>
              {/* <MaskedView
              style={{height: 50,
                width: '100%'}}
              maskElement={
               
                  <Button
                    title="Buy Session"
                    onPress={() => {}}
                    style={{backgroundColor: '#ddd'}}
                  />
               
              }>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                style={{flex: 1}}
              /> */}
              {/* </MaskedView> */}
              <Button
                title={
                  this.state.buySession ? "Buy a Session" : "Donate a Session"
                }
                buttonStyle={{
                  // backgroundColor: theme.colorGrey,
                  borderRadius: theme.size(6),
                  alignSelf: "center",
                  height: 48
                  //  margin:10
                }}
                titleStyle={{ color: theme.colorAccent }}
                onPress={() => {
                  this.requestBuySession();
                }}
                containerStyle={{
                  width: "100%",
                  alignSelf: "center",
                  marginVertical: theme.size(10),
                  marginTop: 30
                }}
                linearGradientProps={{
                  start: { x: 0, y: 0 },
                  end: { x: 1, y: 10 },
                  colors: [theme.colorGradientStart, theme.colorGradientEnd]
                }}
                ViewComponent={LinearGradient}
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
        </View>
      </Drawer>
    );
  }
}
