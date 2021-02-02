import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon } from "react-native-elements";
import Header from "../../components/Header";
//import { http } from "../../util/http";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar.js";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import List from "../../components/List";
import Drawer from "react-native-drawer";

export default class AssignedUsersChats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user")
    };
    this.getChats(1);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  getChats = async page => {
    const user = await session.getUser();
    // http
    //   .get(`/therapists/list?page=${page}`, {
    //     headers: { Authorization: `Bearer ${user.jwt}` }
    //   })
    //   .then(resp => {
    //   this.setState({
    //  //   users: resp.data.data.docs,
    //     loading: false,
    //   //  hasMore: resp.data.data.pages > 1 ? true : false
    //   });
    //   })
    // .catch(err => {
    //   if (err.response) {
    //     if (err.response.status === 401) {
    //       setTimeout(() => {
    //         Snack("error", "Unknown error occured, please contact an Admin");
    //       }, 500);
    //     } else {
    //       setTimeout(() => {
    //         Snack("error", err.response.data.error);
    //       }, 500);
    //     }
    //   } else {
    //     setTimeout(() => {
    //       Snack("error", "Unknown error occured, please contact an Admin");
    //     }, 500);
    //   }
    // });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  loadMore = async () => {
    if (this.state.hasMore) {
      let page = this.state.page + 1;
      const user = await session.getUser();
      // http
      //   .get(`/therapists/list?page=${page}`, {
      //     headers: { Authorization: `Bearer ${user.jwt}` }
      //   })
      //   .then(resp => {
      //   this.setState({
      //     users: [...this.state.users, ...resp.data.data.docs],
      // //    hasMore: resp.data.data.pages > page ? true : false,
      //     page: page
      //   });
      //   })
      // .catch(err => {
      //   if (err.response) {
      //     setTimeout(() => {
      //       Snack("error", err.response.data.error);
      //     }, 500);
      //   } else {
      //     setTimeout(() => {
      //   Snack("error", "Unknown error occured, please contact an Admin");
      //     }, 500);
      //   }
      // });
    }
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  render() {
    if (this.state.loading) {
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
          <View style={styles.fillSpace}>
            <Header
              title={"Chats"}
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
                          back: "AssignedUsersChats"
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
        </Drawer>
      );
    } else {
      return (
        <Drawer
          open={true}
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
          <View style={styles.fillSpace}>
            <Header
              title={"Chats"}
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
                justifyContent: "center",
                alignItems: "center",
                height: "5%",
                width: "100%",
                backgroundColor: "#f6f6f6"
              }}
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
                          borderLeftColor: theme.colorGrey,
                          borderLeftWidth: theme.size(5)
                        }}
                        key={item.id}
                        leftAvatar={{ source: { uri: item.photo } }}
                        title={item.name}
                        titleStyle={styles.subtitle}
                        bottomDivider
                        onPress={() =>
                          this.props.navigation.navigate("TherapistChat", {
                            patientId: item._id,
                            rightIcon: item.photo,
                            patientName: item.name,
                            user: this.state.user
                          })
                        }
                      />
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
              <BottomBar
                options={[
                  {
                    title: "More",
                    icon: {
                      name: "more-horiz",
                      color: "white",
                      type: "material-icons"
                    },
                    onPress: () => {
                      this.setState({ drawer });
                      //   alert("h");
                    }
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
        </Drawer>
      );
    }
  }
}
