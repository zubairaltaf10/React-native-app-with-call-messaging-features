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
  ImageBackground
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon, Input, Divider } from "react-native-elements";
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
import moment from "moment";
import Snackbar from "../../components/Snackbar";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import saveImageToGallery from "../../util/saveImageToGallery";
import { notificationManager } from "../../components/notifications";
import ImageView from "react-native-image-view";
import NetworkUtils from "../../components/NetworkUtil";
import { toLower } from "lodash";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class DonateSessionRequests extends Component {
  constructor(props) {
    super(props);
    this.getRequests();
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
      assignTherapistId: null
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

  async componentDidUpdate(prevProps, prevState) {
    // await this.getRequests();
  }

  getRequests = async () => {
    await this.props.fetchDonateSessionRequests();
    const requests = await this.props.auth.donateSessionRequests.filter(
      r => r.status === this.state.filter
    );
    this.setState({
      requests,
      loading: false
    });
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
    let request = {
      ...this.state.request,
      status: "approved"
    };

    let updates = {};
    updates["DonateSessionRequests/" + this.state.request.id] = request;
    //  alert(JSON.stringify(requests[this.state.requestIndex]))
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
                "Your donate session request has been approved",
                [snap.val()],
                "disable"
              );
            } else {
              console.log("NOT FOUND USER");
            }
          });
        Snackbar("success", "Payment request has been approved");
      });
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
    updates["DonateSessionRequests/" + this.state.request.id] = request;

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
                "Your donate session request has been rejected",
                [snap.val()],
                "disable"
              );
            } else {
              console.log("NOT FOUND USER");
            }
          });
        Snackbar("success", "Payment request has been rejected");
      });
  };

  filterBySearch = async searchBy => {
    // if (searchBy === this.state.searchBy) return;
    // await this.getRequests();
    const requests = await this.props.auth.donateSessionRequests.filter(
      r =>
        toLower(JSON.stringify(r)).includes(toLower(searchBy)) &&
        r.status === this.state.filter
    );
    this.setState({
      requests,
      // searchBy,
      loading: false
    });
  };
  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };
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
    let requests = this.props.auth.donateSessionRequests.filter(
      r => r.status === this.state.filter
    );
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
              title={"Donate Session Requests"}
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
              title={"Donate Session Requests"}
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
                  onChangeText={searchBy => {
                    this.filterBySearch(searchBy);
                    this.setState({ searchBy });
                  }}
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
                    this.getRequests();
                  }}
                  selected={this.state.filter}
                />

                {requests && requests?.length > 0 ? (
                  <FlatList
                    data={this.state.searchBy ? this.state.requests : requests}
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
                                uri: item.user?.photo ? item.user.photo : ""
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
                removeTherapist={() => this.acceptRequest()}
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
                    value: moment(this.state.request?.date).format(
                      "DD/MM/YYYY HH:mm A"
                    )
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
                      // title: "Paris",
                      width: 806,
                      height: 720
                    }
                  ]}
                  imageIndex={0}
                  isVisible={!!this.state.isImageViewVisible}
                  isTapZoomEnabled={false}
                  isSwipeCloseEnabled
                  isPinchZoomEnabled={true}
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
                    <View
                      style={{
                        backgroundColor: theme.colorAccent,
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        borderRadius: 50,
                        zIndex: 2,
                        width: 30,
                        height: 30,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Icon
                        type="material-community"
                        name="file-download"
                        size={15}
                        disabled={!this.state.request?.reciept}
                        underlayColor="transparent"
                        onPress={() => {
                          saveImageToGallery(this.state.request?.reciept);
                        }}
                      />
                    </View>
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
)(DonateSessionRequests);
