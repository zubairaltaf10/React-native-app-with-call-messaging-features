import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon } from "react-native-elements";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import ConfirmationModal from "../../components/ConfirmationModal";
//import {http} from '../../util/http';
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import BottomBar from "../../components/BottomBar";
import TopBar from "../../components/TopBar";
import ProfileOptionsBar from "../../components/ProfileOptionsBar";
import * as actions from "../../store/actions";
import { connect } from "react-redux";
import MaskedView from "@react-native-community/masked-view";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
import LoadingModal from "../../components/LoadingModal";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class AdminUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      searchToggle: false, // searching for assigned
      filter: "unassigned",
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
      assignTherapistId: null
    };
  }

  async componentDidMount() {
    // this.forceUpdate()
    // this.focusListener = this.addEventListener(
    //   "didFocus",
    //    () => {
    //      alert('ui')
    //     // this.setState({ filter: 'assigned' ,patientIndex:-1});
    //     //  this.getUsers(this.state.searchToggle, 1);
    //   }
    // );
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    //
    await this.getUsers(this.state.searchToggle, 1);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    // this.focusListener.remove();
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidUpdate(prevProps, prevState) {
    // await this.getUsers(this.state.searchToggle, 1);
    // if (
    //   this.props.navigation.getParam('patientId') !==
    //     this.state.assignTherapistId &&
    //   this.state.searchToggle
    // ) {
    //   let index = null;
    //   for (let i = 0; i < this.state.users.length; i++) {
    //     if (
    //       this.state.users[i]._id ===
    //       this.props.navigation.getParam('patientId')
    //     ) {
    //       index = i;
    //     }
    //   }
    //   if (index !== null) {
    //     let array = [...this.state.users];
    //     array.splice(index, 1);
    //     this.setState({
    //       users: array,
    //       assignTherapistId: this.props.navigation.getParam('patientId'),
    //     });
    //   }
    // this.setState({ assignTherapistId: this.props.navigation.getParam('patientId') })
    // }
  }
  getUsers = async (searchToggle, page) => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }

    let sorted = !searchToggle ? "assigned" : "unassigned";

    // const currentUser = await session.getUser();
    this.setState({ loading: true });
    sorted = this.state.filter;
    let users = [];
    await firebase
      .database()
      .ref("users")
      // .orderByChild("role")
      // .equalTo("USER")
      .orderByChild("status")
      .equalTo(this.state.filter)
      .on("value", snap => {
        if (snap.exists()) {
          users = Object.values(snap.val());
          // alert(JSON.stringify(users))
          this.setState({
            users: users,
            loading: false,
            hasMore: false
          });
        } else {
          this.setState({ users, loading: false });
        }
      });
    // .catch(err => Snack("err", JSON.stringify(err)));

    // users = users.filter(
    //   user => user.role === "USER" && user.status === this.state.filter
    // );
  };

  back = () => {
    this.props.navigation.goBack();
    // this.props.navigation.navigate('Dashboard')
  };

  selectItem = index => {
    this.setState({
      patientIndex: index === this.state.patientIndex ? null : index
    });
  };

  toggleChange = () => {
    let title = this.state.searchToggle
      ? "List of unassigned users"
      : "List of unassigned users";
    this.setState({
      searchToggle: !this.state.searchToggle,
      toggleTitle: title,
      selectedItem: null,
      loading: true
    });
    this.getUsers(!this.state.searchToggle, 1);
  };

  removeTherapist = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    this.setState({ loadingModal: true });
    let patientId = this.state.users[this.state.patientIndex].id;

    //Taking currently selected therapist
    // alert(patientId)
    let patient = null;
    await firebase
      .database()
      .ref("users")
      .child(patientId)
      .once("value", snap => {
        if (snap.exists()) {
          patient = snap.val();
        }
      });
      
    // patient = Array.isArray(patient) ? patient[0] : patient;
    let therapistId = null;
    let therapist = null;
    patient = {
      ...patient,
      status: "reassigned",
      reassigned: true,
      therapists:
        patient.therapists?.map(t => {
          if (t.status === "active") {
            therapistId = t.id;
            therapist = this.props.auth.users.filter(
              user => user._id === therapistId
            );
            therapist = Array.isArray(therapist) ? therapist[0] : therapist;
            therapist = {
              ...therapist,
              patients:
                therapist.patients?.map(p =>
                  p.id === patientId ? { ...p, status: "inactive" } : p
                ) || null
            };
            return { ...t, status: "inactive" };
          } else {
            return t;
          }
        }) || null
    };

    var updates = {};
    updates["users/" + therapist._id] = therapist;
    updates["users/" + patient._id] = patient;

    console.log("updates", updates);

    try {
      await firebase
        .database()
        .ref()
        .update(updates);
      // this.setState({
      //   confirmationModalVisible: false,
      //   therapistIndex: null,
      //   // users: array,
      // });
      this.getUsers();
      Snack("success", "Status Changed Succesfully");
    } catch (error) {
      console.log("error", error);
    }
    this.setState({ loadingModal: false });
    // .set('unassigned')
    // .then(resp => {
    //   console.log('ENTERED');
    //   this.getUsers(this.state.searchToggle, 1);

    //   this.setState({
    //     removeTherapistModalVisible: false,
    //     patientIndex: null,
    //     // users: array,
    //   });
    //   setTimeout(() => {
    //     Snack('success');
    //   }, 500);
    // })
    // .catch(err => {
    //   this.setState({
    //     removeTherapistModalVisible: false,
    //     patientIndex: null,
    //   });
    //   if (err.response) {
    //     setTimeout(() => {
    //       Snack('error');
    //     }, 500);
    //   } else {
    //     setTimeout(() => {
    //       Snack('error', 'Unknown error occured, please contact an Admin');
    //     }, 500);
    //   }
    // });

  };

  updateVisible = (index, type) => {
    if (type === "remove") {
      this.setState({
        removeTherapistModalVisible: !this.state.removeTherapistModalVisible,
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
        <LoadingModal visible={!!this.state.loadingModal} />
        <View
          style={[
            styles.fillSpace,
            this.state.loading ? { justifyContent: "space-between" } : null
          ]}
        >
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
          {this.state.loading ? (
            <ActivityIndicator color="#ddd" />
          ) : (
            <View
              style={{
                flex: 1,
                width: "100%",
                justifyContent: "space-between",
                backgroundColor: "#fff"
              }}
            >
              <TopBar
                filters={["unassigned", "reassigned", "assigned"]}
                labels={["Unassigned", "Re-assign", "Assigned"]}
                onPress={filter => {
                  this.setState({ filter, patientIndex: -1 });
                  this.getUsers();
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
              {this.state.users && this.state.users?.length > 0 ? (
                <FlatList
                  data={this.state.users}
                  renderItem={({ item, index }) => {
                    return (
                      <View style={{ flexDirection: "column" }}>
                        <ListItem
                          style={{
                            borderLeftColor: theme.colorGrey,
                            borderLeftWidth: theme.size(5)
                          }}
                          key={item}
                          leftAvatar={{
                            source: { uri: item.photo ? item.photo : "" }
                          }}
                          title={item?.name}
                          titleStyle={styles.title}
                          subtitleStyle={styles.subtitle}
                          bottomDivider
                          onPress={() => this.selectItem(index)}
                          subtitle={
                            !this.state.searchToggle
                              ? item?.therapist?.name || ""
                              : null
                          }
                          rightIcon={
                            true ? (
                              <TouchableOpacity
                                onPress={() => {
                                  if (this.state.filter === "assigned") {
                                    this.setState({ patientIndex: index });
                                    this.removeTherapist(index);
                                  } else {
                                    this.props.navigation.navigate(
                                      "AssignTherapist",
                                      { patientId: item._id || item.id }
                                    );
                                  }
                                  this.forceUpdate();
                                }}
                                hitSlop={{
                                  top: 20,
                                  bottom: 20,
                                  left: 20,
                                  right: 20
                                }}
                              >
                                <MaskedView
                                  style={{
                                    // flex: 1,
                                    // flexDirection: 'row',
                                    height: 30,
                                    // justifyContent: 'flex-end',
                                    //  alignSelf:'center',
                                    width: 50
                                  }}
                                  maskElement={
                                    <Icon
                                      name={
                                        this.state.filter === "assigned"
                                          ? "minus-circle"
                                          : "add-circle-outline"
                                      }
                                      underlayColor="transparent"
                                      type={
                                        this.state.filter === "assigned"
                                          ? "feather"
                                          : ""
                                      }
                                      // size={
                                      //   this.state.filter === "assigned"
                                      //     ? 20
                                      //     : 25
                                      // }
                                      style={{ alignSelf: "right" }}
                                    />
                                  }
                                >
                                  <LinearGradient
                                    // start={{x: 0, y: 0}}
                                    // end={{x: 1, y: 0}}
                                    colors={[
                                      theme.colorGradientStart,
                                      theme.colorGradientEnd
                                    ]}
                                    style={{ flex: 1 }}
                                  />
                                </MaskedView>
                              </TouchableOpacity>
                            ) : null
                          }
                        />
                        {index === this.state.patientIndex &&
                        this.state.filter !== "unassigned" ? (
                          <ProfileOptionsBar
                            options={[
                              this.state.filter === "assigned"
                                ? {
                                    title: "Chat",
                                    icon: {
                                      name: "forum-outline",
                                      type: "material-community"
                                    },
                                    onPress: () =>
                                      this.props.navigation.navigate(
                                        "PatientChat",
                                        {
                                          userId: item._id,
                                          rightIcon: item.photo,
                                          userName: item.name,
                                          user: item
                                        }
                                      )
                                  }
                                : null,
                              {
                                title: "Diary",
                                icon: {
                                  name: "book-open",

                                  type: "material-community"
                                },
                                onPress: () =>
                                  this.props.navigation.navigate("Diary", {
                                    userId: item?._id
                                  })
                              },
                              {
                                title: "Profile",
                                icon: {
                                  name: "account-circle-outline",
                                  type: "material-community"
                                },
                                onPress: () =>
                                  this.props.navigation.navigate(
                                    "PatientProfile",
                                    {
                                      userId: item._id,
                                      back: "AdminUsers",
                                      user: this.state.user
                                    }
                                  )
                              },
                              false
                                ? {
                                    title: "Reassign Therapist",
                                    icon: {
                                      name: "add-user",

                                      type: "entypo"
                                    },
                                    onPress: () => {}
                                  }
                                : null,
                              this.state.filter !== "unassigned"
                                ? {
                                    title: "Session Details",
                                    icon: {
                                      name: "info-with-circle",
                                      // size: 15,
                                      type: "entypo"
                                    },
                                    onPress: () => {
                                      this.props.navigation.navigate(
                                        "AdminTherapistSessionsSummary",
                                        { userId: item._id, user: item }
                                      );
                                    }
                                  }
                                : null
                            ]}
                          />
                        ) : null}
                      </View>
                    );
                  }}
                  onEndReached={this.loadMore}
                  onEndReachedThreshold={500}
                  keyExtractor={item => item.id}
                />
              ) : (
                <Text style={[styles.h2, { textAlign: "center" }]}>
                  No Users Found
                </Text>
              )}
              <ConfirmationModal
                visible={this.state.removeTherapistModalVisible}
                updateVisible={this.updateVisible}
                message={"Are you sure you want to"}
                title={"Remove Therapist"}
                removeTherapist={this.removeTherapist}
                data={{
                  name: this.state.removeTherapistName,
                  photo: this.state.removeTherapistPic
                }}
              />
            </View>
          )}
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
const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(
  mapToStateProps,
  actions
)(AdminUsers);
