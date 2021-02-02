import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Dimensions,
  Image,
  Switch
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon } from "react-native-elements";
import Header from "../../components/Header";
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
import { notificationManager } from "../../components/notifications";
import List from "../../components/List";
import Drawer from "react-native-drawer";
import NetworkUtils from "../../components/NetworkUtil";
class AdminTherapists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchToggle: false, // searching for assigned
      filter: "available",
      toggleTitle: "List of unavailable therapists",
      confirmationModalVisible: false,
      therapistIndex: null,
      users: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      therapistName: "", //to change status
      therapistPic: "" //to change status
    };
  }

  async componentDidMount() {
    await this.getTherapists();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
  };

  goBack = () => {
    this.props.navigation.navigate("Dashboard");
  };

  getTherapists = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    let sorted = this.state.filter === "available" ? true : false;
    // let status = !searchToggle ? "available" : "unavailable";
    this.setState({ loading: true });
    let users = [];
    await firebase
      .database()
      .ref("users")
      // .orderByChild("role")
      // .equalTo("USER")
      .orderByChild("available")
      .equalTo(sorted)
      .on("value", snap => {
        if (snap.exists()) {
          users = Object.values(snap.val());
          this.setState({
            users: users,
            loading: false,
            hasMore: false
          });
        }
      });
    // .catch(err => Snack("err", err.message));
    this.setState({ users, loading: false });
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

  updateTherapistAvailability = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    let id = this.state.users[this.state.therapistIndex]?.id || this.state.users[this.state.therapistIndex]?._id;

    var updates = {};

    let therapist = null;
    let patients = [];

    //Taking currently selected therapist
    // therapist = this.props.auth.users.filter(user => user.id === id);
    // alert(JSON.stringify(this.state.users[this.state.therapistIndex]))
    await firebase
      .database()
      .ref("users")
      .child(id)
      .once("value", snap => {
        if (snap.exists()) {
          therapist = snap.val();
        }
      });
      // alert(JSON.stringify(therapist))
    // therapist = Array.isArray(therapist) ? therapist[0] : therapist;

    let therapistPatients = [];
    if (this.state.filter == "available") {
      if (therapist?.patients) {
        //Changing status for all connected patients
        therapist.patients.forEach(p => {
          therapistPatients.push({
            ...p,
            status: "inactive"
          });
          //Checking status for all connected and live patients
          if (p.status === "active") {
            let patient = this.props.auth.users.filter(
              user => user._id === p.id
            );
            patient = Array.isArray(patient) ? patient[0] : patient;
            console.log(patient.therapists);
            patient = {
              ...patient,
              status: "reassigned",
              reassigned: true,
              therapists: patient.therapists
                ? patient.therapists.map(t =>
                    t.id === therapist.id ? { ...t, status: "inactive" } : t
                  )
                : []
            };
            console.log(patient.therapists);
            patient ? patients.push(patient) : null;
          }
        });
        patients?.forEach(p => (updates["users/" + p.id] = p));

        this.broadcastPushNotifications(
          "Current Therapist is unavailable and admin will assign you a new one soon",
          patients,
          "disable"
        );
      }

      // updates['/posts/' + newPostKey] = postData;
      // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
      therapist = {
        ...therapist,
        patients: therapist.patients ? therapistPatients : null,
        available: false,
        status: "unavailable"
      };
      updates["users/" + therapist._id] = therapist;
    } else {
      updates["users/" + therapist._id + "/status"] = "available";
      updates["users/" + therapist._id + "/available"] = true;
    }

    console.log("updates", updates);

    try {
      await firebase
        .database()
        .ref()
        .update(updates);
      // .catch(err=>Snack('err',err.message));
      this.setState({
        confirmationModalVisible: false,
        therapistIndex: null
        // users: array,
      });
      await this.getTherapists();
      Snack("success", "Status Changed Succesfully");
    } catch (error) {
      console.log("error", error);
    }
    // let available = this.state.searchToggle;
    // await firebase
    //   .database()
    //   .ref(`users/${id}/available`)
    //   .set(available)
    //   .then(resp => {
    //     console.log('ENTERED');
    //     this.getTherapists(this.state.searchToggle, 1);
    //     // let array = [...this.state.users];
    //     // array.splice(this.state.therapistIndex, 1);
    //     // console.log('array',array)
    //     this.setState({
    //       confirmationModalVisible: false,
    //       therapistIndex: null,
    //       // users: array,
    //     });
    //     setTimeout(() => {
    //       Snack('success');
    //     }, 500);
    //   })
    //   .catch(err => {
    //     this.setState({confirmationModalVisible: false, therapistIndex: null});
    //     if (err.response) {
    //       setTimeout(() => {
    //         Snack('error');
    //       }, 500);
    //     } else {
    //       setTimeout(() => {
    //         Snack('error', 'Unknown error occured, please contact an Admin');
    //       }, 500);
    //     }
    //   });
  };

  updateVisible = (index, type) => {
    if (type === "remove") {
      this.setState({
        confirmationModalVisible: !this.state.confirmationModalVisible,
        therapistIndex: index
      });
      this.getTherapists();
    }
  };
  selectItem = index => {
    this.setState({
      therapistIndex: index === this.state.therapistIndex ? null : index
    });
  };
  loadMore = () => {
    if (this.state.hasMore) {
      let sorted = !this.state.searchToggle ? "available" : "unavailable";
      let page = this.state.page + 1;
      //   http
      //     .get(`/admin/therapists/list?available=${sorted}&page=${page}`, {
      //       headers: {Authorization: `Bearer ${this.state.user?.jwt}`},
      //     })
      //     .then(resp => {
      //       let totalPages;
      //       if (resp.data.data[0].metadata.length === 0) {
      //         totalPages = 0;
      //       } else {
      //         totalPages = Math.ceil(
      //           resp.data.data[0].metadata[0].total /
      //             resp.data.data[0].metadata[0].limit,
      //         );
      //       }
      //       this.setState({
      //         users: [...this.state.users, ...resp.data.data[0].data],
      //         hasMore: totalPages > page ? true : false,
      //         page: page,
      //       });
      //     })
      //     .catch(err => {
      //       if (err.response) {
      //         setTimeout(() => {
      //           Snack('error', err.response.data.error);
      //         }, 500);
      //       } else {
      //         setTimeout(() => {
      //           Snack('error', 'Unknown error occured, please contact an Admin');
      //         }, 500);
      //       }
      //     });
    }
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  render() {
    console.log(this.state.users);
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
        {this.state.loading ? (
          <View style={styles.fillSpace}>
            <Header
              title={"Therapists"}
              changeDrawer={this.goBack}
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
                  colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                  style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: theme.colorPrimary
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate("Dashboard")}
                  >
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
              title={"Therapists"}
              changeDrawer={this.goBack}
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
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 80,
                  right: 10,
                  zIndex: 2
                }}
                onPress={() => this.props.navigation.navigate("AddTherapist")}
              >
                <Image
                  onPress
                  source={require("../../../assets/fab-add.png")}
                  style={{ height: 100, width: 100 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TopBar
                filters={["available", "unavailable"]}
                labels={["Available", "Unavailable"]}
                onPress={async filter => {
                  // alert(filter)
                  await this.setState({ filter, patientIndex: -1 });
                  await this.getTherapists();
                }}
                selected={this.state.filter}
              />
              {this.state.users && this.state.users?.length > 0 ? (
                <>
                  <FlatList
                    data={this.state.users}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => {
                      console.log(this.state.users);

                      return (
                        <>
                          <ListItem
                            style={{
                              borderLeftColor: theme.colorGrey,
                              borderLeftWidth: theme.size(5)
                            }}
                            key={item.id}
                            leftAvatar={{
                              source: { uri: item.photo ? item.photo : "" }
                            }}
                            title={item.name}
                            titleStyle={styles.title}
                            subtitleStyle={styles.subtitle}
                            bottomDivider
                            onPress={() => this.selectItem(index)}
                            // onPress={() =>
                            //   this.props.navigation.navigate(
                            //     'TherapistProfileAdmin',
                            //     {
                            //       userId: item._id,
                            //       back: 'AdminTherapists',
                            //       user: this.state.user,
                            //     },
                            //   )
                            // }
                            // subtitle={
                            //   <View>
                            //     <Text
                            //       style={[
                            //         styles.subtitle,
                            //         {

                            //           color: theme.colorGrey,
                            //         },
                            //       ]}>
                            //       Patient treated: {item.patientsTreated}
                            //     </Text>
                            //     <Text
                            //       style={[
                            //         styles.subtitle,
                            //         {

                            //           color: theme.colorGrey,
                            //         },
                            //       ]}>
                            //       Currently treating: {item.currentlyTreating}
                            //     </Text>
                            //   </View>
                            // }
                            // rightIcon={
                            //   this.state.searchToggle
                            //     ? {
                            //         name: 'eye-off-outline',
                            //         type: 'material-community',
                            //         onPress: () => {
                            //           this.setState({
                            //             therapistName: item.name,
                            //             therapistPic: item.photo,
                            //           });
                            //           this.updateVisible(index, 'remove');
                            //         },
                            //       }
                            //     : {
                            //         name: 'eye-outline',
                            //         type: 'material-community',
                            //         onPress: () => {
                            //           this.setState({
                            //             therapistName: item.name,
                            //             therapistPic: item.photo,
                            //           });
                            //           this.updateVisible(index, 'remove');
                            //         },
                            //       }
                            // }
                          />
                          {this.state.therapistIndex === index ? (
                            <ProfileOptionsBar
                              options={[
                                {
                                  title: "Edit Profile",
                                  icon: {
                                    name: "forum-outline",
                                    type: "material-community"
                                  },
                                  onPress: () =>
                                    this.props.navigation.navigate(
                                      "TherapistProfileAdmin",
                                      {
                                        userId: item._id,
                                        back: "AdminTherapists",
                                        user: this.state.user
                                      }
                                    )
                                },
                                {
                                  title:
                                    this.state.filter === "available" ? (
                                      <Text>
                                        Change Status{"\n"}
                                        <Text
                                          style={{
                                            color: theme.colorGradientEnd
                                          }}
                                        >
                                          Active
                                        </Text>
                                      </Text>
                                    ) : (
                                      <Text>
                                        Change Status{"\n"}
                                        <Text
                                          style={{ color: theme.colorGrey }}
                                        >
                                          Away
                                        </Text>
                                      </Text>
                                    ),
                                  component: (
                                    <Switch
                                      trackColor={{
                                        false: theme.colorLightGrey,
                                        true: theme.colorGradientEnd
                                      }}
                                      thumbColor={
                                        this.state.filter === "available"
                                          ? theme.colorGradientStart
                                          : theme.colorGrey
                                      }
                                      ios_backgroundColor="#3e3e3e"
                                      onValueChange={() => {
                                        this.setState({
                                          therapistName: item.name,
                                          therapistPic: item.photo
                                        });
                                        this.updateVisible(index, "remove");
                                      }}
                                      value={this.state.filter === "available"}
                                      style={{
                                        transform: [
                                          { scaleX: 0.6 },
                                          { scaleY: 0.6 }
                                        ]
                                      }}
                                    />
                                  )
                                },
                                this.state.filter === "available"
                                  ? {
                                      title: "View all connected users",
                                      icon: {
                                        name: "account-circle-outline",
                                        type: "material-community"
                                      },
                                      onPress: () => {
                                        this.props.navigation.navigate(
                                          "AdminTherapistConnectedUsers",
                                          {
                                            userId: item._id,
                                            therapist: item,
                                            user: this.state.user,
                                            users: item.patients
                                          }
                                        );
                                        // alert(item.id)
                                      }
                                    }
                                  : null
                              ]}
                            />
                          ) : null}
                        </>
                      );
                    }}
                    //   onEndReached={this.loadMore}
                    //   onEndReachedThreshold={500}
                  />
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.h2,
                      { textAlign: "center", alignSelf: "center" }
                    ]}
                  >
                    No Therapists Found
                  </Text>
                </>
              )}
              <ConfirmationModal
                visible={this.state.confirmationModalVisible}
                updateVisible={this.updateVisible}
                message={"Are you sure you want to change"}
                title={"Therapist status"}
                removeTherapist={this.updateTherapistAvailability}
                data={{
                  name: this.state.therapistName,
                  photo: this.state.therapistPic
                }}
              />
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
)(AdminTherapists);
