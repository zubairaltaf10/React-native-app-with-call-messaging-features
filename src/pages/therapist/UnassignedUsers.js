import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon } from "react-native-elements";
import Header from "../../components/Header";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar.js";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import ConfirmationModal from "../../components/ConfirmationModal";
import * as actions from "../../store/actions";
import { connect } from "react-redux";
import { notificationManager } from "../../components/notifications";
import sendMessage from "../../util/sendMessage";
import NetworkUtils from "../../components/NetworkUtil";
import { printNewTherapistMessage } from "../../util/index";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class UnassignedUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      assignTherapistModal: false,
      assignPatientName: "",
      assignPatientPic: ""
    };
  }

  async componentDidMount() {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    await this.getUsers(1);
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
  };

  getUsers = async page => {
    let sorted = "unassigned";
    let user = this.state.user;
    let users = this.props.auth.users;
    users = users.filter(
      user => user.role === "USER" && user.status === sorted
      // &&
      // user.therapists?.filter(therapist => therapist.id === user.jwt),
    );

    this.setState({
      users: users,
      loading: false,
      hasMore: false
    });
  };

  goBack = () => {
    this.props.navigation.goBack(null);
  };

  loadMore = async () => {};

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  updateVisible = index => {
    // alert(index)
    this.setState({
      assignTherapistModal: !this.state.assignTherapistModal,
      patientIndex: index
    });
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

  assignPatient = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    // alert(this.state.patientIndex)
    let id =
      this.state.users[this.state.patientIndex]._id ||
      this.state.users[this.state.patientIndex].id;

    //Adding patients into therapist profile
    let therapist = null;
    let patient = null;
    patient = this.props.auth.users.filter(user => user._id === id);
    patient = Array.isArray(patient) ? patient[0] : patient;
    therapist = this.props.auth.users.filter(
      user => user._id === this.state.user?.jwt
    );
    therapist = Array.isArray(therapist) ? therapist[0] : therapist;
    let therapistPatients = [];
    if (therapist.patients) {
      therapistPatients = [
        ...therapist.patients,
        {
          id,
          photo: patient.photo,
          name: patient.name,
          status: "active"
        }
      ];
    } else {
      therapistPatients = [
        {
          id,
          photo: patient.photo,
          name: patient.name,
          status: "active"
        }
      ];
    }
    let patientTherapists = [];
    if (patient.therapists) {
      patientTherapists = [
        ...patient.therapists,
        {
          id: this.state.user?.jwt,
          name: this.state.user.name,
          status: "active"
        }
      ];
    } else {
      patientTherapists = [
        {
          id: this.state.user?.jwt,
          name: this.state.user.name,
          status: "active"
        }
      ];
    }

    try {
      await firebase
        .database()
        .ref(`users/${this.state.user?.jwt}/patients`)
        .set(therapistPatients);
      console.log("patint1", therapistPatients);
      await firebase
        .database()
        .ref(`users/${id}`)
        .set({ ...patient, therapists: patientTherapists, status: "assigned" });
      console.log("patint2");

      Snack("success", "Client Added Succesfully");
      // console.log(patient, "mnmnmnm");
      this.broadcastPushNotifications(
        "Therapist has connected with you",
        [patient],
        "PersonalChat"
      );

      const id1 = therapist._id || therapist.jwt;
      const id2 = patient._id || patient.jwt;
      const channel = {
        id: id1 < id2 ? id1 + id2 : id2 + id1,
        participants: [patient]
      };
      // console.log(channel, "cjannel");
      this.props.navigation.navigate("PersonalChat", {
        channel,
        longPress: false
      });

      sendMessage(
        therapist,
        channel,
        printNewTherapistMessage(therapist.name, patient.name),
        ""
      );

      Snack("success", "Client Added Succesfully");

      this.getUsers();
    } catch (error) {
      console.log("error", error);
    }
    //this.setState({ isSearchModalOpen: false });
  };

  render() {
    return (
      <Drawer
        open={!!this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={this.logout}
            //role={"THERAPIST"}
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
              title={"Unassigned users"}
              changeDrawer={this.goBack}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />
            <ActivityIndicator
              size={"large"}
              style={{ width: "100%", height: 100, flex: 1 }}
              color={theme.colorGrey}
            />
            <View
              style={{ flex: 1, width: "100%", justifyContent: "flex-end" }}
            >
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
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Unassigned users"}
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
                justifyContent: "space-between"
              }}
            >
              {this.state.users && this.state.users.length > 0 ? (
                <FlatList
                  data={this.state.users}
                  renderItem={({ item, index }) => {
                    return (
                      <ListItem
                        style={{
                          borderLeftColor:
                            this.props.navigation.getParam("userID") == item.id
                              ? theme.colorPrimary
                              : theme.colorGrey,
                          borderLeftWidth: theme.size(5)
                        }}
                        key={item.id}
                        leftAvatar={{ source: { uri: item.photo } }}
                        title={item.name}
                        titleStyle={styles.title}
                        bottomDivider
                        onPress={() =>
                          this.props.navigation.navigate("PatientProfile", {
                            userId: item._id,
                            back: "UnassignedUsers",
                            user: this.state.user
                          })
                        }
                        rightIcon={{
                          name: "plus",
                          type: "material-community",
                          onPress: () => {
                            this.setState({
                              assignPatientName: item.name,
                              assignPatientPic: item.photo
                            });
                            this.updateVisible(index);
                          },
                          style: {
                            // width: 300,
                            // height: 100,
                            // backgroundColor: "#ddd",
                            // zIndex: 4,
                            // padding: 9
                          },
                          hitSlop: { top: 20, bottom: 20, left: 20, right: 20 }
                        }}

                        // rightContentContainerStyle={{width:300,height:50,padding:100,backgroundColor:'#ddd'}}
                      />
                    );
                  }}
                  onEndReached={this.loadMore}
                  onEndReachedThreshold={500}
                  keyExtractor={item => item.id}
                />
              ) : (
                <Text
                  style={[
                    styles.h2,
                    {
                      textAlign: "center",
                      textAlignVertical: "center",
                      marginTop: 100
                    }
                  ]}
                >
                  No Users Found
                </Text>
              )}
              <ConfirmationModal
                visible={this.state.assignTherapistModal}
                updateVisible={() => this.updateVisible()}
                message={"Are you sure you want to"}
                title={"Take client"}
                removeTherapist={async () => {
                  await this.assignPatient();
                  this.updateVisible(-1);
                }}
                data={{
                  name: this.state.assignPatientName,
                  photo: this.state.assignPatientPic
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
)(UnassignedUsers);
