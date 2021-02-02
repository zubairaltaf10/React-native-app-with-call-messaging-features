import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Dimensions,
  Image,
  ActivityIndicator,
  Button,
  ImageBackground,
  Alert,
  PermissionsAndroid,
  Platform
} from "react-native";
import ImageView from "react-native-image-view";
import moment from "moment";
import { styles, theme } from "../../styles";
import { ListItem, Icon, Input, Divider } from "react-native-elements";
import CameraRoll from "@react-native-community/cameraroll";
import RNFetchBlob from "rn-fetch-blob";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import ConfirmationModal from "../../components/ConfirmationModal";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import BottomBar from "../../components/BottomBar";
import TopBar from "../../components/TopBar";
import ProfileOptionsBar from "../../components/ProfileOptionsBar";
import * as actions from "../../store/actions";
import { connect } from "react-redux";
import Snackbar from "../../components/Snackbar";
import { toLower } from "lodash";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import saveImageToGallery from "../../util/saveImageToGallery";
import { notificationManager } from "../../components/notifications";
import NetworkUtils from "../../components/NetworkUtil";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class PaymentVerification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      searchToggle: false, // searching for assigned
      filter: "pending",
      toggleTitle: "List of unassigned users",
      removeTherapistModalVisible: false,
      requestIndex: null,
      users: [],
      loading: true,
      page: 1,
      search: "",
      hasMore: false,
      user: props.navigation.getParam("user"),
      removeTherapistName: "",
      removeTherapistPic: "",
      assignTherapistId: null,
      requestsApproved: [],
      requestsPending: [],
      requestsRejected: [],
      requests: []
    };
  }

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    await this.getRequests();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidUpdate(prevProps, prevState) {}

  getRequests = async () => {
    let requests = [];
    await firebase
      .database()
      .ref("BuySessionRequests")
      .orderByChild("status")
      .equalTo("pending")
      .on("value", snap => {
        let requestsPending = [];
        if (snap.exists()) {
          // alert(Object.values(snap.val()))
          requestsPending = Object.values(snap.val());
          // !this.state.requests
          //   ? this.setState({ requests: requestsPending })
          //   : null;
          if (this.state.filter === "pending") {
            this.setState({ requests: requestsPending });
          }
        }
        this.setState({
          // requests,
          requestsPending,
          loading: false
        });
      });
    await firebase
      .database()
      .ref("BuySessionRequests")
      .orderByChild("status")
      .equalTo("approved")
      .on("value", snap => {
        let requestsApproved = [];
        if (snap.exists()) {
          // alert(Object.values(snap.val()))
          requestsApproved = Object.values(snap.val());
          if (this.state.filter === "approved")
            this.setState({ requests: requestsApproved });
        }
        this.setState({
          // requests,
          requestsApproved,
          loading: false
        });
      });
    await firebase
      .database()
      .ref("BuySessionRequests")
      .orderByChild("status")
      .equalTo("rejected")
      .on("value", snap => {
        let requestsRejected = [];
        if (snap.exists()) {
          // alert(Object.values(snap.val()))
          requestsRejected = Object.values(snap.val());
          if (this.state.filter === "rejected")
            this.setState({ requests: requestsRejected });
        }
        this.setState({
          // requests,
          requestsRejected,
          loading: false
        });
      });
    // await this.props.fetchBuySessionRequests();
    // // alert(this.props.auth.buySessionRequests.length)
    // const requests = await this.props.auth.buySessionRequests.filter(
    //   r => r.status === this.state.filter
    // );
  };

  back = () => {
    this.props.navigation.goBack();
    // this.props.navigation.navigate('Dashboard')
  };

  selectItem = index => {
    this.setState({
      requestIndex: index === this.state.requestIndex ? null : index
    });
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

  acceptRequest = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    let userId = this.state.request.user.id;
    let user = null;
    this.props.auth.users.forEach(async u => {
      if (u._id === userId) {
        user = u;
        user = {
          ...user,
          sessionsLeft: user.sessionsLeft
            ? user.sessionsLeft + this.state.request.sessions
            : this.state.request.sessions
        };
        let request = {
          ...this.state.request,
          status: "approved"
        };
        let updates = {};
        updates["BuySessionRequests/" + this.state.request.id] = request;
        updates["users/" + userId] = user;
        // console.log("accepte", updates);
        await firebase
          .database()
          .ref()
          .update(updates)
          .then(async () => {
            // this.setState({ requests });
            this.setState({ paymentVerificationModalVisible: false });

            await firebase
              .database()
              .ref(`users/${userId}`)
              .on("value", snap => {
                if (snap.exists()) {
                  this.broadcastPushNotifications(
                    "Your payment session request has been approved",
                    [snap.val()],
                    "disable"
                  );
                } else {
                  console.log("NOT FOUND USER");
                }
              });

            Snackbar("success", "Payment request has been approved");
          });
      }
    });
    // this.getRequests();
  };
  rejectRequest = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    let request = {
      ...this.state.request,
      status: "rejected"
    };
    let updates = {};
    updates["BuySessionRequests/" + this.state.request.id] = request;

    await firebase
      .database()
      .ref()
      .update(updates)
      .then(async () => {
        // this.setState({ requests });
        this.setState({ paymentVerificationModalVisible: false });

        await firebase
          .database()
          .ref(`users/${request.user?.id}`)
          .on("value", snap => {
            if (snap.exists()) {
              this.broadcastPushNotifications(
                "Your payment session request has been rejected",
                [snap.val()],
                "disable"
              );
            } else {
              console.log("NOT FOUND USER");
            }
          });
        Snackbar("success", "Payment request has been rejected");
      });
    // this.getRequests();
  };

  filterBySearch = async searchBy => {
    // await this.getRequests();

    // const requests = await this.state.requests.filter(r =>
    //   toLower(JSON.stringify(r)).includes(toLower(searchBy))
    // );
    if (this.state.filter === "approved")
      this.setState({
        requests: this.state.requestsApproved.filter(r =>
          toLower(JSON.stringify(r)).includes(toLower(searchBy))
        )
      });
    else if (this.state.filter === "pending")
      this.setState({
        requests: this.state.requestsPending.filter(r =>
          toLower(JSON.stringify(r)).includes(toLower(searchBy))
        )
      });
    else if (this.state.filter === "rejected")
      this.setState({
        requests: this.state.requestsRejected.filter(r =>
          toLower(JSON.stringify(r)).includes(toLower(searchBy))
        )
      });
    this.setState({
      // requests,
      loading: false
    });
  };
  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };
  // getPermissionAndroid = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //       {
  //         title: "Image Download Permission",
  //         message: "Your permission is required to save images to your device",
  //         buttonNegative: "Cancel",
  //         buttonPositive: "OK"
  //       }
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       return true;
  //     }
  //     Alert.alert(
  //       "Save remote Image",
  //       "Grant Me Permission to save Image",
  //       [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //       { cancelable: false }
  //     );
  //   } catch (err) {
  //     Alert.alert(
  //       "Save remote Image",
  //       "Failed to save Image: " + err.message,
  //       [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //       { cancelable: false }
  //     );
  //   }
  // };

  // handleDownload = async url => {
  //   // if device is android you have to ensure you have permission
  //   if (Platform.OS === "android") {
  //     const granted = await this.getPermissionAndroid();
  //     if (!granted) {
  //       return;
  //     }
  //   }
  //   this.setState({ saving: true });
  //   RNFetchBlob.config({
  //     fileCache: true,
  //     appendExt: "png"
  //   })
  //     .fetch("GET", url)
  //     .then(res => {
  //       CameraRoll.saveToCameraRoll(res.data, "photo")
  //         .then(() => {
  //           // Alert.alert(
  //           //   "Save remote Image",
  //           //   "Image Saved Successfully",
  //           //   [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //           //   { cancelable: false }
  //           // );
  //           Snack("success", "Reciept Saved Successfully");
  //         })
  //         .catch(err => {
  //           Alert.alert(
  //             "Save remote Image",
  //             "Failed to save Image: " + err.message,
  //             [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //             { cancelable: false }
  //           );
  //         })
  //         .finally(() => this.setState({ saving: false }));
  //     })
  //     .catch(error => {
  //       this.setState({ saving: false });
  //       Alert.alert(
  //         "Save remote Image",
  //         "Failed to save Image: " + error.message,
  //         [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //         { cancelable: false }
  //       );
  //     });
  // };
  // downloadImage = () => {
  //   this.handleDownload(this.state.request?.reciept);
  // };
  renderStatusButttons = item => {
    switch (this.state.filter) {
      case "pending":
        return (
          <TouchableOpacity
            onPress={() => {
              // this.selectItem(index);
              this.setState({ request: item });
              this.setState({ paymentVerificationModalVisible: true });
            }}
            style={[
              {
                height: 25,
                borderWidth: 2,
                borderColor: theme.colorGradientStart,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100
              }
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                {
                  color: theme.colorGradientStart,
                  fontFamily: "Montserrat-Regular",
                  fontSize: 14,
                  alignSelf: "center",
                  // paddingHorizontal: 20,
                  paddingBottom: 4
                }
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
        );
        break;
      case "approved":
        return (
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[theme.colorGradientStart, theme.colorGradientEnd]}
            style={[
              {
                height: 25,

                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100
              }
            ]}
          >
            <TouchableOpacity onPress={() => {}}>
              <Text
                numberOfLines={1}
                style={[
                  {
                    color: "white",
                    fontFamily: "Montserrat-Regular",
                    fontSize: 14,
                    alignSelf: "center",
                    // paddingHorizontal: 20,
                    paddingBottom: 4
                  }
                ]}
              >
                Approved
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        );
        break;
      case "rejected":
        return (
          <TouchableOpacity
            onPress={() => {
              this.setState({ request: item });
              this.setState({ paymentVerificationModalVisible: true });
            }}
            style={[
              {
                height: 25,
                //   borderWidth: 2,

                backgroundColor: "#aaa",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100
              }
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                {
                  color: "white",
                  fontFamily: "Montserrat-Regular",
                  fontSize: 14,
                  alignSelf: "center",
                  // paddingHorizontal: 20,
                  paddingBottom: 4
                }
              ]}
            >
              Rejected
            </Text>
          </TouchableOpacity>
        );
        break;

      default:
        break;
    }
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
        {this.state.loading ? (
          <View style={styles.fillSpace}>
            <Header
              title={"Payment Verification"}
              changeDrawer={this.back}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />
            <ActivityIndicator color={theme.colorGrey} />

            <View
              style={{ flex: 1, width: "100%", justifyContent: "flex-end" }}
            >
              {/* <Text>ds</Text> */}

              <BottomBar
                options={[
                  {
                    title: "More",
                    icon: {
                      name: "more-horiz",
                      color: "white",
                      type: "material-icons"
                    },
                    onPress: () => this.props.navigation.navigate("Dashboard")
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
          </View>
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Payment Verification"}
              changeDrawer={this.back}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />
            <View
              style={{
                flex: 1,
                width: "100%",
                justifyContent: "space-between",
                backgroundColor: "#fff"
              }}
            >
              <View style={{ justifyContent: "flex-start", flex: 1 }}>
                <Input
                  keyboardType={"default"}
                  onChangeText={searchBy => this.filterBySearch(searchBy)}
                  value={this.state.searchBy}
                  placeholder="Search Name, A/D/P"
                  placeholderTextColor={"#9BC8FF"}
                  autoCapitalize="none"
                  inputStyle={{
                    marginHorizontal: 10,
                    ...styles.subtitle
                  }}
                  rightIcon={{
                    name: "search",
                    color: theme.colorPrimary,
                    size: 25
                  }}
                  rightIconContainerStyle={{ marginHorizontal: 10 }}
                  inputContainerStyle={{
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: "#ddd",
                    padding: 0,
                    height: 50,

                    width: "100%",
                    marginVertical: 20,
                    backgroundColor: "#fff"
                  }}
                />
                <TopBar
                  filters={["pending", "approved", "rejected"]}
                  labels={["Pending", "Approved", "Rejected"]}
                  onPress={filter => {
                    this.setState({ filter });
                    // this.getRequests();
                    if (filter === "approved")
                      this.setState({ requests: this.state.requestsApproved });
                    else if (filter === "pending")
                      this.setState({ requests: this.state.requestsPending });
                    else if (filter === "rejected")
                      this.setState({ requests: this.state.requestsRejected });
                  }}
                  selected={this.state.filter}
                />

                {this.state.requests && this.state.requests?.length > 0 ? (
                  <FlatList
                    data={this.state.requests}
                    renderItem={({ item, index }) => {
                      return (
                        <View style={{ flexDirection: "column" }}>
                          <ListItem
                            rightElement={this.renderStatusButttons(item)}
                            style={{
                              borderLeftColor: theme.colorGrey,
                              borderLeftWidth: theme.size(5)
                            }}
                            key={item}
                            leftAvatar={{
                              source: {
                                uri: item.user.photo ? item.user.photo : ""
                              }
                            }}
                            title={item.user?.name}
                            titleStyle={styles.subtitle}
                            subtitle={(item.sessions || 0) + " Sessions"}
                            subtitleStyle={{
                              ...styles.subtitle,
                              fontFamily: theme.font.regular,
                              color: theme.colorGrey
                            }}
                            bottomDivider
                            onPress={() => this.setState({ request: item })}
                            disabled
                            // subtitle={
                            //   !this.state.searchToggle ? item.therapist.name : null
                            // }
                          />
                        </View>
                      );
                    }}
                    onEndReached={this.loadMore}
                    onEndReachedThreshold={500}
                    keyExtractor={item => item.id}
                  />
                ) : (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1
                    }}
                  >
                    <Text style={[styles.h2, { textAlign: "center" }]}>
                      No Payment Requests Found
                    </Text>
                  </View>
                )}
              </View>
              <ConfirmationModal
                visible={!!this.state.paymentVerificationModalVisible}
                updateVisible={() =>
                  this.state.filter === "rejected"
                    ? this.acceptRequest()
                    : this.rejectRequest()
                }
                buttonTitle="Accept"
                singleButton={this.state.filter === "rejected" ? true : false}
                //   message={'Are you sure you want to'}
                close={() =>
                  this.setState({ paymentVerificationModalVisible: false })
                }
                title={"Payment Details"}
                removeTherapist={() => this.state.filter === "rejected" ? true : this.acceptRequest()}
                data={{
                  name: this.state.request?.user.name || "",
                  photo: this.state.request?.user.photo || ""
                }}
                horizontalButtons={true}
              >
                {[
                  // {label: 'Receipt Number:', value: '#12345'},
                  {
                    label: "Date & time:",
                    value: moment().format("DD/MM/YYYY HH:mm A")
                  },
                  {
                    label: "Sessions Purchased:",
                    value: this.state.request?.sessions + ""
                  },
                  {
                    label: "Amount (Rs.):",
                    value:
                      this.state.request?.totalAmount ||
                      parseInt(this.state.request?.sessions) * 200
                  }
                ].map(item => (
                  <>
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
                          // color:theme.colorAccent,
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
                          // color:theme.colorAccent,
                          fontFamily: "Montserrat-Medium",
                          fontSize: 12,
                          flex: 1
                        }}
                      >
                        {item.value}
                      </Text>
                    </View>
                    <Divider
                      style={{ marginVertical: theme.size(10), width: "100%" }}
                    />
                  </>
                ))}
                <ImageView
                  images={[
                    {
                      source: {
                        uri: this.state.request?.reciept || ""
                      },
                      title: "Paris",
                      width: 806,
                      height: 720
                    }
                  ]}
                  imageIndex={0}
                  isVisible={!!this.state.isImageViewVisible}
                  isTapZoomEnabled={false}
                  onClose={() => {
                    this.setState({ isImageViewVisible: false });
                  }}
                  // renderFooter={currentImage => (
                  //   <View>
                  //     <Text>My footer</Text>
                  //   </View>
                  // )}
                />
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ isImageViewVisible: true });
                  }}
                  disabled={!this.state.request?.reciept}
                >
                  <ImageBackground
                    style={{
                      height: 150,
                      width: "100%",
                      backgroundColor: "#ddd",
                      position: "relative"
                    }}
                    resideMode="contain"
                    source={
                      this.state.request?.reciept
                        ? { uri: this.state.request.reciept }
                        : require("../../../assets/Logo-pukar.png")
                    }
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.colorAccent,
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        borderRadius: 50,
                        zIndex: 2,
                        width: 40,
                        height: 40,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onPress={() => {
                        saveImageToGallery(this.state.request?.reciept);
                      }}
                    >
                      <Icon
                        type="material-community"
                        name="file-download"
                        size={30}
                        disabled={!this.state.request?.reciept}
                        underlayColor="transparent"
                      />
                    </TouchableOpacity>
                  </ImageBackground>
                </TouchableOpacity>
              </ConfirmationModal>
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
          </View>
        )}
      </Drawer>
    );
  }
}
const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(
  mapToStateProps,
  actions
)(PaymentVerification);
