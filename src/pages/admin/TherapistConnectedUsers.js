import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import NetworkUtils from "../../components/NetworkUtil";
import { ScrollView } from "react-native";
import { FlatList } from "react-native";

class TherapistConnectedUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      searchToggle: false, // searching for assigned
      filter: "unassigned",
      toggleTitle: "List of unassigned users",
      removeTherapistModalVisible: false,
      patientIndex: null,
      // users: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      userId: props.navigation.getParam("userId"),
      users: props.navigation.getParam("users"),
      removeTherapistName: "",
      removeTherapistPic: "",
      assignTherapistId: null
    };
  }

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    // await this.getUsers(false);
    if (!!this.props.navigation.getParam("users")) {
      this.setState({
        loading: false,
        users: this.props.navigation
          .getParam("users")
          .filter(u => u.status === "active")
      });

      // alert(JSON.stringify(this.props.navigation.getParam("users")))
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidUpdate(prevProps, prevState) {
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
    let sorted = !searchToggle ? "assigned" : "unassigned";
    const currentUser = await session.getUser();
    sorted = this.state.filter;
    let users = this.props.auth.users;
    users = users.filter(
      user => user.role === "USER" && user.status === this.state.filter
    );
    // alert(users.length)

    this.setState({
      users: users,
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
    let patientId =
      this.state.users[this.state.patientIndex]._id ||
      this.state.users[this.state.patientIndex].id ||
      this.state.users[this.state.patientIndex].jwt;
    console.log(patientId, "patientId");
    //Taking currently selected therapist
    let patient = this.props.auth.users.filter(
      user =>
        user._id === patientId ||
        user.id === patientId ||
        user.jwt === patientId
    );
    console.log(patient, "pasd");
    patient = Array.isArray(patient) ? patient[0] : patient;
    let therapistId = null;
    let therapist = null;
    patient = {
      ...patient,
      status: "unassigned",
      therapists:
        patient.therapists?.map(t => {
          if (t.status === "active") {
            therapistId = t.id;
            therapist = this.props.auth.users.filter(
              user =>
                user._id === therapistId ||
                user.id === therapistId ||
                user.jwt === therapistId
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
    // if(this.state.patientIndex==this.state.users?.length-1){
    //   // alert(this.state.users?.length-1)
    //   // this.scrollView.scrollToI
    //   this.scrollView.scrollTo(7000,7000,true)
    // }
    console.log(this.props.navigation.getParam("therapist"), "asdadsads");

    return (
      <View
        style={[
          styles.fillSpace,
          !!this.state.loading ? { justifyContent: "space-between" } : null
        ]}
      >
        <Header
          title={"Connected Users"}
          changeDrawer={this.back}
          icon={"arrow-back"}
          customStyles={{
            height: (76 * Dimensions.get("window").height) / 896
          }}

          // iconRight={'exit-to-app'}
          // logout={this.logout}
        />
        {this.state.loading ? (
          <View style={{ flex: 1, width: "100%",justifyContent:'center' }}>
            <ActivityIndicator size="large" color="#ddd" />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "space-between",
              backgroundColor: "#fff"
            }}
          >
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
              // <ScrollView  ref={ref => {
              //   this.scrollView = ref;
              // }}>
              <FlatList
                // scrollEnabled={false}
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
                        title={item.name}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        bottomDivider
                        onPress={() => {
                          this.selectItem(index);
                        }}
                        // subtitle={
                        //   !this.state.searchToggle ? item.therapist.name : null
                        // }
                      />
                      {index === this.state.patientIndex ? (
                        <ProfileOptionsBar
                          options={[
                            {
                              title: "Chat",
                              icon: {
                                name: "forum-outline",
                                type: "material-community"
                              },
                              onPress: () =>
                                this.props.navigation.navigate("PatientChat", {
                                  userId: item.id,
                                  rightIcon: item.photo,
                                  userName: item.name,
                                  user: item,
                                  therapist: this.props.navigation.getParam(
                                    "therapist"
                                  )
                                })
                            },
                            {
                              title: "History",
                              icon: {
                                name: "book-open",

                                type: "material-community"
                              },
                              onPress: () =>
                                this.props.navigation.navigate("Diary", {
                                  userId: item.id
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
                                    userId: item.id,
                                    back: "AdminUsers",
                                    user: this.state.user
                                  }
                                )
                            },
                            // this.state.filter === "reassigned" && {
                            //   title: "Reassign Therapist",
                            //   icon: {
                            //     name: "add-user",

                            //     type: "entypo"
                            //   },
                            //   onPress: () => {}
                            // },
                            {
                              title: "Remove Therapist",
                              icon: {
                                name: "remove-user",
                                // size: 15,
                                type: "entypo"
                              },
                              onPress: () => {
                                this.setState({ patientIndex: index });
                                this.removeTherapist(index);
                              }
                            }
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
              // {/* </ScrollView> */}
              <View style={styles.fillSpace}>
                <Text style={[styles.h2, { textAlign: "center" }]}>
                  No Users Found
                </Text>
              </View>
            )}
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
    );
  }
}
const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(
  mapToStateProps,
  actions
)(TherapistConnectedUsers);
