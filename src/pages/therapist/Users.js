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
import { ListItem, Icon, Input, Divider } from "react-native-elements";
import Header from "../../components/Header";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar.js";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import ProfileOptionsBar from "../../components/ProfileOptionsBar";

import * as actions from "../../store/actions";
import { connect } from "react-redux";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class AssignedUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      setMood: props.navigation.getParam("setMood")
    };
    // this.props.fetchUsers();
  }

  async componentDidMount() {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    await this.getUsers();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   let shouldUpdate = true;
  //   if (nextProps.auth.users === this.props.auth.users) {
  //     shouldUpdate = false;
  //   }
  //   return shouldUpdate;
  // }

  handleBackButton = () => {
    this.goBack();
  };

  getUsers = async page => {
    const currentUser = await session.getUser();

    let sorted = "assigned";
    let users = this.props.auth.users;
    users = users.filter(
      user =>
        user.role === "USER" &&
        user.status === sorted &&
        user.therapists?.filter(therapist => therapist.id === currentUser.jwt)
    );

    this.setState({
      users: users,
      loading: false,
      hasMore: false
    });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  loadMore = async () => {
    const user = await session.getUser();
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  selectItem = index => {
    this.setState({
      selectedItem: index === this.state.selectedItem ? null : index
    });
  };

  filterBySearch = async searchBy => {
    await this.getUsers();
    const requests = await this.state.users.filter(r =>
      JSON.stringify(r)
        .toLowerCase()
        .includes(searchBy.toLowerCase())
    );
    this.setState({
      users: requests,
      loading: false
    });
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
              title={"Assigned users"}
              changeDrawer={this.goBack}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />
            <ActivityIndicator />
            <View
              style={{ flex: 1, width: "100%", justifyContent: "flex-end" }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                style={{
                  height: "11%",
                  width: "100%",
                  backgroundColor: theme.colorPrimary
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    height: "100%",
                    width: "100%"
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      height: "100%",
                      width: "100%"
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        width: "50%"
                      }}
                      onPress={() =>
                        this.props.navigation.navigate("TherapistProfile", {
                          jwt: this.state.user?.jwt,
                          back: "Dashboard"
                        })
                      }
                    >
                      <Icon
                        name="account-circle-outline"
                        color="white"
                        type="material-community"
                        underlayColor="transparent"
                      />
                      <Text
                        onPress={() =>
                          this.props.navigation.navigate("TherapistProfile", {
                            jwt: this.state.user?.jwt,
                            back: "Dashboard"
                          })
                        }
                        style={[styles.subtitle, { color: theme.colorAccent }]}
                      >
                        Profile
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        width: "50%"
                      }}
                      onPress={() =>
                        this.props.navigation.navigate("Dashboard")
                      }
                    >
                      <Icon
                        name="home-outline"
                        color="white"
                        type="material-community"
                        underlayColor="transparent"
                      />
                      <Text
                        style={[styles.subtitle, { color: theme.colorAccent }]}
                      >
                        Home
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Assigned users"}
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
                backgroundColor: "white"
              }}
            >
              {this.state.users && this.state.users?.length > 0 ? (
                <>
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
                  <FlatList
                    data={this.state.users}
                    renderItem={({ item, index }) => {
                      {
                        return (
                          <View style={{ flexDirection: "column" }}>
                            <ListItem
                              style={{
                                borderLeftColor: theme.colorGrey,
                                borderLeftWidth: theme.size(5)
                              }}
                              key={item}
                              leftAvatar={{ source: { uri: item.photo } }}
                              title={item.name}
                              titleStyle={[styles.title]}
                              bottomDivider
                              onPress={() => {
                                if (!!this.state.setMood) {
                                  this.props.navigation.navigate(
                                    "TherapistPatientSetMood",
                                    {
                                      userId: item._id,
                                      user: this.state.user
                                    }
                                  );
                                } else {
                                  this.selectItem(index);
                                }
                              }}
                            />
                            {this.state.selectedItem === index ? (
                              <ProfileOptionsBar
                                options={[
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
                                          back: "AssignedUsers",
                                          user: this.state.user
                                        }
                                      )
                                  },
                                  // {
                                  //   title: "Set Mood",
                                  //   icon: {
                                  //     name: "emoticon-happy-outline",

                                  //     type: "material-community"
                                  //   },
                                  //   onPress: () =>
                                  //     this.props.navigation.navigate(
                                  //       "TherapistPatientSetMood",
                                  //       {
                                  //         userId: item._id,
                                  //         user: this.state.user
                                  //       }
                                  //     )
                                  // },
                                  {
                                    title: "History",
                                    icon: {
                                      name: "book-open-outline",
                                      type: "material-community"
                                    },
                                    onPress: () =>
                                      this.props.navigation.navigate("Diary", {
                                        userId: item._id,
                                        user: this.state.user,
                                        therapistId: this.state.user.id,
                                        therapistDiary: true
                                      })
                                  },
                                  item.shareDiaryWithTherapist === true
                                    ? {
                                        title: "Diary",
                                        icon: {
                                          name: "book-open-outline",
                                          type: "material-community"
                                        },
                                        onPress: () =>
                                          this.props.navigation.navigate(
                                            "Diary",
                                            {
                                              userId: item._id,
                                              user: this.state.user,
                                              // therapistId: this.state.user.id,
                                              therapistDiary: false
                                            }
                                          )
                                      }
                                    : null
                                ]}
                              />
                            ) : null}
                          </View>
                        );
                      }
                    }}
                    onEndReached={this.loadMore}
                    onEndReachedThreshold={500}
                    keyExtractor={item => item.id}
                  />
                </>
              ) : (
                <View style={{ ...styles.fillSpace }}>
                  <Text
                    style={[
                      styles.h2,
                      { textAlign: "center", color: theme.colorPrimary }
                    ]}
                  >
                    No Users Found
                  </Text>
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
)(AssignedUsers);
