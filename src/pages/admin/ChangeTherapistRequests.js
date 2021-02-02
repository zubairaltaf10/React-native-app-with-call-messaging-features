import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  Button
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon, Input } from "react-native-elements";
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
import { notificationManager } from "../../components/notifications";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
import { toLower } from "lodash";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class ChangeTherapistRequests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      searchToggle: false, // searching for assigned
      filter: "pending",
      toggleTitle: "List of unassigned users",
      removeTherapistModalVisible: false,
      patientIndex: null,
      users: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      removeTherapistName: "",
      removeTherapistPic: "",
      assignTherapistId: null,
      drawer: false
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
  async componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
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
  filterBySearch = async searchBy => {
    await this.getRequests();
    const requests = await this.props.auth.changeTherapistRequests.filter(
      r =>
        toLower(JSON.stringify(r)).includes(toLower(searchBy)) &&
        r.status === this.state.filter
    );
    this.setState({
      requests,
      loading: false
    });
  };
  getRequests = async () => {
    await this.props.fetchChangeTherapistRequests();
    let sorted = this.state.filter;

    let requests;
    requests = this.props.auth.changeTherapistRequests.filter(
      request => request.status === sorted
    );

    this.setState({
      requests,
      loading: false,
      hasMore: false
    });
  };

  back = () => {
    this.props.navigation.goBack();
    // this.props.navigation.navigate('Dashboard')
  };

  selectItem = index => {
    this.setState({
      requestIndex: index
    });
  };

  // toggleChange = () => {
  //   let title = this.state.searchToggle
  //     ? "List of unassigned users"
  //     : "List of unassigned users";
  //   this.setState({
  //     searchToggle: !this.state.searchToggle,
  //     toggleTitle: title,
  //     selectedItem: null,
  //     loading: true
  //   });
  //   this.getUsers(!this.state.searchToggle, 1);
  // };

  removeTherapist = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    let id = this.props.auth.changeTherapistRequests[this.state.requestIndex]
      ?.id;
    let patient = null;
    let therapist = null;
    let therapists = [];
    let patients = [];
    var updates = {};

    this.props.auth.users.forEach(u => {
      if (u._id === id) {
        patient = u;
        return;
      }
    });
    if (patient) {
      patient.therapists?.forEach(t => {
        if (t.status === "active") {
          therapists = patient.therapists?.map(th =>
            th.status === "active" ? { ...th, status: "inactive" } : th
          );
          therapist = t;
          patient = {
            ...patient,
            status: "reassigned",
            reassigned: true,
            therapists
          };
          updates["users/" + patient._id] = patient;
          return;
        }
      });
    }
    if (therapist) {
      patients = therapist.patients?.map(p =>
        p.id === id ? { ...p, status: "inactive" } : p
      );
      therapist = { ...therapist, patients };
      updates["users/" + therapist._id] = therapist;
    }
    console.log("updates chnage therapist", updates);
    try {
      await firebase
        .database()
        .ref()
        .update(updates);
      this.setState({
        changeTherapistModalVisible: false

        // users: array,
      });
      this.getRequests();
      Snack("Success", "Therapist Removed Succesfully");
    } catch (error) {
      console.log("error", error);
    }
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
    let requests = this.props.auth.changeTherapistRequests;
    let req = requests[this.state.requestIndex];
    requests[this.state.requestIndex] = {
      ...req,
      status: "approved"
    };
    let updates = {};
    // alert(req.id);
    console.log("requests", requests);
    console.log("requestsIndex", this.state.requestIndex);
    updates["ChangeTherapistRequests/" + req.user.id + "/" + req.id] =
      requests[this.state.requestIndex];
    console.log("updates acceptedtherapist", updates);
    await firebase
      .database()
      .ref()
      .update(updates)
      .then(async () => {
        await this.removeTherapist();
        this.setState({ requests });
        this.setState({ removeTherapistModalVisible: false });
        Snackbar("success", "Request has been approved");

        await firebase
          .database()
          .ref(`users/${req.user.id}`)
          .once("value", snap => {
            if (snap.exists()) {
              this.broadcastPushNotifications(
                "Your request has been approved",
                [snap.val()],
                "disable"
              );
            } else {
              console.log("NOT FOUND USER");
            }
          });
      });
    this.getRequests();
  };
  rejectRequest = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    let requests = this.props.auth.changeTherapistRequests;
    requests[this.state.requestIndex] = {
      ...requests[this.state.requestIndex],
      status: "rejected"
    };
    let updates = {};
    updates[
      "ChangeTherapistRequests/" +
        this.props.auth.changeTherapistRequests[this.state.requestIndex].user
          .id +
        "/" +
        this.props.auth.changeTherapistRequests[this.state.requestIndex].id
    ] = requests[this.state.requestIndex];

    await firebase
      .database()
      .ref()
      .update(updates)
      .then(async () => {
        this.setState({ requests });
        this.setState({ changeTherapistModalVisible: false });
        Snackbar("success", "Request has been rejected");

        await firebase
          .database()
          .ref(
            `users/${
              this.props.auth.changeTherapistRequests[this.state.requestIndex]
                .user.id
            }`
          )
          .once("value", snap => {
            if (snap.exists()) {
              console.log([snap.val()], "reject therpaist");
              this.broadcastPushNotifications(
                "Your request has been rejected",
                [snap.val()],
                "disable"
              );
            } else {
              console.log("NOT FOUND USER");
            }
          });
      });

    this.getRequests();
  };

  updateVisible = (index, type) => {
    if (type === "remove") {
      this.setState({
        changeTherapistModalVisible: !this.state.changeTherapistModalVisible,
        patientIndex: index
      });
    }
  };

  loadMore = () => {
    if (this.state.hasMore) {
      let sorted = !this.state.searchToggle ? "assigned" : "unassigned";
      let page = this.state.page + 1;
    }
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };
  renderStatusButttons = index => {
    switch (this.state.filter) {
      case "pending":
        return (
          <TouchableOpacity
            onPress={() => {
              this.selectItem(index);
              this.setState({ changeTherapistModalVisible: true });
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
                  ...styles.subtitle,
                  color: theme.colorGradientStart,
                  fontFamily: "Montserrat-Regular",

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
                    ...styles.subtitle,
                    color: "white",
                    fontFamily: "Montserrat-Regular",

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
              this.setState({ requestIndex: index });
              this.setState({ changeTherapistModalVisible: true });
            }}
            style={[
              {
                backgroundColor: "#aaa",

                height: 25,

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
                  ...styles.subtitle,
                  color: "white",
                  fontFamily: "Montserrat-Regular",

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
    let requests = this.props.auth.changeTherapistRequests.filter(
      request => request.status === this.state.filter
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
              title={"Users"}
              changeDrawer={this.back}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />

            <View
              style={{ flex: 1, width: "100%", justifyContent: "flex-end" }}
            >
              {/* <ActivityIndicator></ActivityIndicator> */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  height: "10%",
                  width: "100%",
                  backgroundColor: "#000000"
                }}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  colors={[
                    this.state.filter === "unassigned"
                      ? theme.colorGradientStart
                      : "#fff",
                    this.state.filter === "unassigned"
                      ? theme.colorGradientEnd
                      : "#fff"
                  ]}
                  style={[
                    {
                      height: "100%",
                      width: "100%",
                      backgroundColor: theme.colorPrimary
                    },
                    { borderColor: theme.colorGradientStart, borderWidth: 1 }
                  ]}
                >
                  <TouchableOpacity onPress={() => {}}>
                    <View
                      style={{
                        flexDirection: "row",
                        height: "100%",
                        width: "100%"
                      }}
                    >
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                          width: "100%"
                        }}
                      >
                        <Icon
                          name="home-outline"
                          color="white"
                          type="material-community"
                          underlayColor="transparent"
                        />
                        <Text
                          style={[
                            styles.subtitle,
                            { color: theme.colorAccent }
                          ]}
                          onPress={() =>
                            this.props.navigation.navigate("Dashboard")
                          }
                        >
                          Home
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Change Therapist Requests"}
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

                {/* <ListItem
              style={{
                borderLeftColor: theme.colorGrey,
                borderLeftWidth: theme.size(5),
              }}
              title={this.state.toggleTitle}
              switch={{
                value: this.state.searchToggle,
                onChange: this.toggleChange,
              }}
              onPress={() => this.toggleChange()}
              titleStyle={styles.subtitle}
            /> */}
                {requests && requests?.length > 0 ? (
                  <FlatList
                    data={this.state.searchBy ? this.state.requests : requests}
                    renderItem={({ item, index }) => {
                      return (
                        <View style={{ flexDirection: "column" }}>
                          <ListItem
                            rightElement={this.renderStatusButttons(index)}
                            style={{
                              borderLeftColor: theme.colorGrey,
                              borderLeftWidth: theme.size(5)
                            }}
                            key={item}
                            leftAvatar={{
                              source: {
                                uri: item.user?.photo ? item.user?.photo : ""
                              }
                            }}
                            title={item.user?.name}
                            titleStyle={styles.title}
                            subtitleStyle={{
                              fontFamily: theme.font.regular,
                              ...styles.subtitle
                            }}
                            subtitle={
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontFamily: theme.font.regular,
                                  ...styles.subtitle
                                }}
                              >
                                {item.reason}
                              </Text>
                            }
                            bottomDivider
                            onPress={() => {
                              this.setState({
                                selectedPatient: item,
                                requestIndex: index
                              });
                            }}
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
                      No Requests Found
                    </Text>
                  </View>
                )}
              </View>
              <ConfirmationModal
                visible={!!this.state.changeTherapistModalVisible}
                updateVisible={() =>
                  this.state.filter === "rejected"
                    ? this.acceptRequest()
                    : this.rejectRequest()
                }
                buttonTitle="Accept"
                singleButton={this.state.filter === "rejected" ? true : false}
                //   message={'Are you sure you want to'}
                title={"Reason of Request"}
                close={() =>
                  this.setState({ changeTherapistModalVisible: false })
                }
                removeTherapist={() => {
                  this.acceptRequest();
                }}
                data={{
                  name:
                    this.props.auth.changeTherapistRequests[
                      this.state.requestIndex
                    ]?.user?.name || "",
                  photo:
                    this.props.auth.changeTherapistRequests[
                      this.state.requestIndex
                    ]?.user?.photo || ""
                }}
                horizontalButtons={true}
              >
                <Text
                  style={{
                    padding: 20,
                    borderRadius: 20,
                    backgroundColor: "#ddd",
                    fontFamily: "Montserrat-Medium",
                    fontSize: 12
                    //  minHeight:50,
                    // height:10
                  }}
                >
                  {
                    this.props.auth.changeTherapistRequests[
                      this.state.requestIndex
                    ]?.reason
                  }
                </Text>
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
)(ChangeTherapistRequests);
