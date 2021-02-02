import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { styles, theme } from "../styles";
import { Button, Input, ListItem, Overlay } from "react-native-elements";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Share,
  ActivityIndicator
} from "react-native";
import { roles } from "../util/enums/User";
import LinearGradient from "react-native-linear-gradient";
import SessionModal from "../pages/Session";
import ConfirmationModal from "./ConfirmationModal";
import session from "../data/session";
import { changeTherapistAvailabilty } from "../util/changeTherapistAvailability";
import * as actions from "../store/actions";
import { connect } from "react-redux";
import fire from "../services/firebase";
import Snackbar from "./Snackbar";
import Contact from "../pages/ContactModal";
let list = [];
class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  // const [
  //   changeTherapistAvailabilityModalVisible,
  //   setChangeTherapistAvailabilityModalVisible
  // ] = useState(false);
  // let list = [];
  async componentDidMount() {
    let user = await session.getUser();
    // alert(user.role);
    user = this.props.navigation.getParam("role")
      ? { ...user, role: this.props.navigation.getParam("role") }
      : user;
    this.setState({ user });
    fire
      .database()
      .ref("users/" + user.jwt)
      .on("value", snap => {
        if (snap.exists()) {
          this.setState({ user: { ...user, ...snap.val() } });
        }
      });
    if (user?.role === roles.admin) {
      list = [
        {
          name: "About",
          goto: "About"
        },
        {
          name: "Home",
          goto: "Dashboard"
        },
        {
          name: "Notifications",
          goto: "ActivityHistory"
        },
        {
          name: "Settings",
          goto: "Settings"
        },
        {
          name: "Log Out"
        }
      ];
    } else if (user?.role === roles.user) {
      list = [
        {
          name: "About",
          goto: "About"
        },
        {
          name: "Profile",
          goto: "PatientProfile"
        },
        {
          name: "Notifications",
          goto: "ActivityHistory"
        },
        {
          name: "Pending Requests",
          goto: "PendingRequests"
        },
        {
          name: "Change Therapist",
          goto: "Dashboard"
        },
        {
          name: "Sessions Summary",
          goto: "AdminTherapistSessionsSummary"
        },
        {
          name: "Request 1on1 Session",
          goto: "Request1On1Session"
        },

        // {
        //   name: "Trial Session",
        //   goto: "Dashboard"
        // },
        {
          name: "Contact Support",
          goto: "Contact"
        },

        {
          name: "Log Out"
        }
      ];
    } else if (user?.role === roles.therapist) {
      list = [
        {
          name: "About",
          goto: "About"
        },
        {
          name: "Notifications",
          goto: "ActivityHistory"
        },
        {
          name: "Change Availability",
          goto: "Dashboard"
        },
        // {
        //   name: "Sessions Summary",
        //   goto: "TherapistSessionsList"
        // },

        {
          name: "Contact Support",
          goto: "Contact"
        },

        // {
        //   name: "Settings",
        //   goto: "Settings"
        // }

        {
          name: "Log Out"
        }
      ];
    }

    // alert(JSON.stringify(user))
  }
  async componentDidUpdate() {
    let user = await session.getUser();
    if (this.state.user?.id !== user.id) {
      // alert()
      let user = await session.getUser();
      // alert(user.role);
      // user = this.props.navigation.getParam("role")
      //   ? { ...user, role: this.props.navigation.getParam("role") }
      //   : user;
      this.setState({ user });
      fire
        .database()
        .ref("users/" + user.jwt)
        .on("value", snap => {
          if (snap.exists()) {
            this.setState({ user: { ...user, ...snap.val() } });
          }
        });
      // alert(user.name)
      if (user?.role === roles.admin) {
        list = [
          {
            name: "About",
            goto: "About"
          },
          {
            name: "Home",
            goto: "Dashboard"
          },
          {
            name: "Notifications",
            goto: "ActivityHistory"
          },
          {
            name: "Settings",
            goto: "Settings"
          },
          {
            name: "Log Out"
          }
        ];
      } else if (user?.role === roles.user) {
        list = [
          {
            name: "About",
            goto: "About"
          },
          {
            name: "Profile",
            goto: "PatientProfile"
          },
          {
            name: "Notifications",
            goto: "ActivityHistory"
          },
          {
            name: "Pending Requests",
            goto: "PendingRequests"
          },
          {
            name: "Change Therapist",
            goto: "Dashboard"
          },
          {
            name: "Sessions Summary",
            goto: "AdminTherapistSessionsSummary"
          },
          {
            name: "Request 1on1 Session",
            goto: "Request1On1Session"
          },

          // {
          //   name: "Trial Session",
          //   goto: "Dashboard"
          // },
          {
            name: "Contact Support",
            goto: "Contact"
          },

          {
            name: "Log Out"
          }
        ];
      } else if (user?.role === roles.therapist) {
        list = [
          {
            name: "About",
            goto: "About"
          },
          {
            name: "Notifications",
            goto: "ActivityHistory"
          },
          {
            name: "Change Availability",
            goto: "Dashboard"
          },
          // {
          //   name: "Sessions Summary",
          //   goto: "TherapistSessionsList"
          // },

          {
            name: "Contact Support",
            goto: "Contact"
          },

          // {
          //   name: "Settings",
          //   goto: "Settings"
          // }

          {
            name: "Log Out"
          }
        ];
      }
    }
  }
  onShare = async () => {
    try {
      const result = await Share.share({
        message: "Try out Pukaar Community.\nLink to application"
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      // alert("ser", error.message);
      console("", error);
    }
  };
  render() {
    if (this.state.user?.role === roles.admin) {
      return (
        <View style={{ height: "100%", backgroundColor: theme.colorAccent }}>
          <Contact
            visible={!!this.state.contactModalVisible}
            updateVisible={() =>
              this.setState({
                contactModalVisible: !this.state.contactModalVisible
              })
            }
          />
          <ListItem
            leftIcon={{
              name: "close",
              type: "simple-line-icon",
              size: 30
            }}
            onPress={() => this.props.onClose()}
            bottomDivider
            containerStyle={{ height: theme.size(90) }}
          />
          {list.map((l, i) => {
            if (l.name === "Log Out") {
              return (
                <ListItem
                  key={i}
                  title={l.name}
                  titleStyle={styles.subtitle}
                  bottomDivider
                  containerStyle={{ height: theme.size(90) }}
                  onPress={() => {
                    this.props.onLogout();
                    this.props.onClose();
                  }}
                />
              );
            } else if (l.name === "Share") {
              return (
                <ListItem
                  key={i}
                  title={l.name}
                  titleStyle={[styles.subtitle]}
                  bottomDivider
                  containerStyle={{ height: theme.size(90) }}
                  onPress={() => {
                    this.onShare();
                    this.props.onClose();
                  }}
                  // linearGradientProps={{
                  //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                  //   start: {x: 0, y: 0},
                  //   end: {x: 1, y: 0},
                  // }}
                  // ViewComponent={LinearGradient}
                />
              );
            } else if (l.name === "Change Therapist/Availability") {
              return (
                <ListItem
                  key={i}
                  title={l.name}
                  titleStyle={styles.subtitle}
                  bottomDivider
                  containerStyle={{ height: theme.size(90) }}
                  onPress={() => {
                    this.props.comingSoonModal();
                    this.props.onClose();
                  }}
                />
              );
            } else if (l.name === "Contact Support") {
              return (
                <ListItem
                  key={i}
                  title={l.name}
                  titleStyle={[styles.subtitle]}
                  bottomDivider
                  containerStyle={{ height: theme.size(90) }}
                  onPress={() => {
                    // this.props.modalFunction()
                    this.setState({
                      contactModalVisible: !this.state.contactModalVisible
                    });
                    this.props.onClose();
                    // this.props.comingSoonModal()
                  }}
                  // linearGradientProps={{
                  //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                  //   start: {x: 0, y: 0},
                  //   end: {x: 1, y: 0},
                  // }}
                  // ViewComponent={LinearGradient}
                />
              );
            }
            return (
              <ListItem
                key={i}
                title={l.name}
                titleStyle={styles.subtitle}
                bottomDivider
                containerStyle={{ height: theme.size(90) }}
                onPress={() => {
                  this.props.navigation.navigate(l.goto, {
                    userId: this.state.user?.jwt,
                    user: this.state.user
                  });
                  this.props.onClose();
                }}
              />
            );
          })}
        </View>
      );
    } else if (this.state.user?.role === roles.user) {
      return (
        // <LinearGradient
        //   start={{x: 0, y: 0}}
        //   end={{x: 1, y: 0}}
        //   colors={[theme.colorGradientStart, theme.colorGradientEnd]}
        //   style={{
        //     height: '100%',
        //     width: '100%',
        //     backgroundColor: theme.colorPrimary,
        //   }}>
        <ScrollView style={[styles.bodyPadding, { backgroundColor: "white" }]}>
          <View style={{ height: "100%", backgroundColor: "white" }}>
            <Contact
              visible={!!this.state.contactModalVisible}
              updateVisible={() =>
                this.setState({
                  contactModalVisible: !this.state.contactModalVisible
                })
              }
            />
            <ListItem
              leftIcon={{
                name: "close",
                type: "simple-line-icon",
                size: 30,
                color: theme.colorGrey
              }}
              underlayColor="transparent"
              onPress={() => this.props.onClose()}
              bottomDivider
              containerStyle={{ height: theme.size(90) }}
              // linearGradientProps={{
              //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
              //   start: {x: 0, y: 0},
              //   end: {x: 1, y: 0},
              // }}
              // ViewComponent={LinearGradient}
            />
            {list.map((l, i) => {
              if (l.name === "Log Out") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.onLogout();
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Share") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.onShare();
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (
                l.name === "Payment Method" ||
                l.name === "Trial Session"
              ) {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.comingSoonModal();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Request 1on1 Session") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      if (this.state.user.status === "assigned") {
                        this.props.navigation.navigate(l.goto, {
                          user: this.state.user,
                          userId: this.state.user.id
                        });
                        // this.setState({ reasonModalVisible: true });
                        this.props.onClose();
                      } else {
                        Snackbar(
                          "error",
                          "Sorry! You have no assigned therapist"
                        );
                      }
                    }}
                  />
                );
              } else if (l.name === "Profile") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.navigation.navigate(l.goto, {
                        user: this.state.user,
                        userId: this.state.user.id
                      });
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Sessions Summary") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.navigation.navigate(l.goto, {
                        user: this.state.user,
                        userId: this.state.user.id
                      });
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Change Therapist") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      // this.props.modalFunction()
                      if (this.state.user.status === "assigned") {
                        this.props.navigation.navigate(
                          "PatientChangeTherapistRequest",
                          { user: this.state.user }
                        );
                        this.props.onClose();
                      } else {
                        Snackbar(
                          "error",
                          "Sorry! You have no assigned therapist"
                        );
                      }
                      // this.props.comingSoonModal()
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Contact Support") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      // this.props.modalFunction()
                      this.setState({
                        contactModalVisible: !this.state.contactModalVisible
                      });
                      this.props.onClose();
                      // this.props.comingSoonModal()
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              }
              return (
                <ListItem
                  key={i}
                  title={l.name}
                  titleStyle={[styles.subtitle]}
                  bottomDivider
                  containerStyle={{ height: theme.size(90) }}
                  onPress={() => {
                    this.props.navigation.navigate(l.goto, {
                      userId: this.state.user?.jwt,
                      user: this.state.user
                    });
                    this.props.onClose();
                  }}
                  // linearGradientProps={{
                  //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                  //   start: {x: 0, y: 0},
                  //   end: {x: 1, y: 0},
                  // }}
                  // ViewComponent={LinearGradient}
                />
              );
            })}
          </View>
        </ScrollView>
        // </LinearGradient>
      );
    } else if (this.state.user?.role === roles.therapist) {
      return (
        // <LinearGradient
        //   start={{x: 0, y: 0}}
        //   end={{x: 1, y: 0}}
        //   colors={[theme.colorGradientStart, theme.colorGradientEnd]}
        //   style={{
        //     height: '100%',
        //     width: '100%',
        //     backgroundColor: theme.colorPrimary,
        //   }}>
        <ScrollView
          style={[styles.bodyPadding, { backgroundColor: theme.colorAccent }]}
        >
          <View style={{ height: "100%" }}>
            <Contact
              visible={!!this.state.contactModalVisible}
              updateVisible={() =>
                this.setState({
                  contactModalVisible: !this.state.contactModalVisible
                })
              }
            />
            <ConfirmationModal
              visible={!!this.state?.changeTherapistAvailabilityModalVisible}
              updateVisible={
                () =>
                  this.setState({
                    changeTherapistAvailabilityModalVisible: false
                  })
                // Snackbar('succes')
              }
              message={"Are you sure you want to"}
              close={() =>
                this.setState({
                  changeTherapistAvailabilityModalVisible: false
                })
              }
              title={"Change Availability"}
              data={{
                name: this.state.user?.name,
                photo: this.state.user?.photo
              }}
              removeTherapist={() => {
                changeTherapistAvailabilty(this.state.user);
                this.setState({
                  changeTherapistAvailabilityModalVisible: false
                });
              }}
              // data={{}}
              // horizontalButtons={true}
            />
            <ListItem
              leftIcon={{
                name: "close",
                type: "simple-line-icon",
                size: 30,
                color: theme.colorGrey
              }}
              onPress={() => this.props.onClose()}
              bottomDivider
              containerStyle={{ height: theme.size(90) }}
              // linearGradientProps={{
              //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
              //   start: {x: 0, y: 0},
              //   end: {x: 1, y: 0},
              // }}
              // ViewComponent={LinearGradient}
            />
            {list.map((l, i) => {
              if (l.name === "Log Out") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.onLogout();
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Share") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.onShare();
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (
                l.name === "Payment Method" ||
                l.name === "Trial Session"
              ) {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.comingSoonModal();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Change Availability") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      // this.props.modalFunction()
                      // alert(JSON.stringify(this.props.auth.users));
                      // changeTherapistAvailabilty(this.state.user);
                      this.setState({
                        changeTherapistAvailabilityModalVisible: true
                      });
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Sessions Summary") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      this.props.navigation.navigate(l.goto);
                      this.props.onClose();
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Change Therapist") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      // this.props.modalFunction()
                      this.props.navigation.navigate(
                        "PatientChangeTherapistRequest"
                      );
                      this.props.onClose();
                      // this.props.comingSoonModal()
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              } else if (l.name === "Contact Support") {
                return (
                  <ListItem
                    key={i}
                    title={l.name}
                    titleStyle={[styles.subtitle]}
                    bottomDivider
                    containerStyle={{ height: theme.size(90) }}
                    onPress={() => {
                      // this.props.modalFunction()
                      this.setState({
                        contactModalVisible: !this.state.contactModalVisible
                      });
                      this.props.onClose();
                      // this.props.comingSoonModal()
                    }}
                    // linearGradientProps={{
                    //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    //   start: {x: 0, y: 0},
                    //   end: {x: 1, y: 0},
                    // }}
                    // ViewComponent={LinearGradient}
                  />
                );
              }
              return (
                <ListItem
                  key={i}
                  title={l.name}
                  titleStyle={[styles.subtitle]}
                  bottomDivider
                  containerStyle={{ height: theme.size(90) }}
                  onPress={() => {
                    this.props.navigation.navigate(l.goto, {
                      userId: this.state.user?.jwt,
                      user: this.state.user
                    });
                    this.props.onClose();
                  }}
                  // linearGradientProps={{
                  //   colors: [theme.colorGradientStart, theme.colorGradientEnd],
                  //   start: {x: 0, y: 0},
                  //   end: {x: 1, y: 0},
                  // }}
                  // ViewComponent={LinearGradient}
                />
              );
            })}
          </View>
        </ScrollView>
        // </LinearGradient>
      );
    } else {
      return (
        <View>
          <ActivityIndicator color="#ddd" />
        </View>
      );
    }
  }
}

// const mapToStateProps = state => {
//   return { auth: state.auth };
// };
export default List;
