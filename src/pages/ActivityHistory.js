import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  FlatList
} from "react-native";
import { styles, theme } from "../styles";
import {
  Avatar,
  Divider,
  Icon,
  Button,
  AirbnbRating,
  ListItem
} from "react-native-elements";
import Header from "../components/Header";
import { http } from "../util/http";
import firebase from "../services/firebase";
import Snack from "../components/Snackbar";
import BottomBar from "../components/BottomBar";
import session from "../data/session";
import LinearGradient from "react-native-linear-gradient";
import Badge from "../components/Badge";
import Input from "../components/Input";
import moment from "moment";
import { addActivity } from "../util/addActivity";
import Drawer from "react-native-drawer";
import List from "../components/List";
import NetworkUtils from "../components/NetworkUtil";
export default class ActivityHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.navigation.getParam("userId"),

      loading: true,
      user: props.navigation.getParam("user"),
      history: [],
      limit: 50,
      lastVisible: null,
      refreshing: false,
      loadingFooter: false
    };

    this.onEndReachedCalledDuringMomentum = false;
  }

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    // const user = await session.getUser();
    // this.setState({ user });
    await this.getHistory(this.props.navigation.getParam("userId"));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
    return true;
  };

  getHistory = async id => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    var user = await session.getUser();
    this.setState({ loading: true });

    var snapshot = await firebase
      .firestore()
      .collection("notifications")
      .doc(user.id || user._id)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(this.state.limit)
      .get();

    if (!snapshot.empty) {
      let list = [];

      this.setState({
        lastVisible: snapshot.docs[snapshot.docs.length - 1]
      });

      snapshot.forEach(doc => {
        doc.data().toUser.id === user.id
          ? list.push({
              date: doc.data().createdAt.seconds * 1000,
              message: doc.data().body,
              type: doc.data().type,
              userName: doc.data().metadata.fromUser?.name,
              userID: doc.data().metadata.fromUser?.id
            })
          : null;
      });

      this.setState({
        history: list
        //  loadingFooter: false,
        //   lastVisible: lastVisible,
        //  loading: false
      });
    } else {
      this.setState({
        lastVisible: null
        //  loading: false
      });
    }

    this.setState({ loading: false });

    // var user = await session.getUser();

    // this.setState({ loadingFooter: true });
    // var snapshot = await firebase
    //   .firestore()
    //   .collection("notifications")
    //   .doc(user.id || user._id)
    //   .collection("notifications")
    //   .orderBy("createdAt", "asc")
    //   .limit(this.state.limit)
    //   // .limit(500)
    //   // .where(firebase
    //   //   .firestore()
    //   //   .collection("notifications").doc('toUser'), "==", user.id)
    //   // .limitToLast(500)
    //   .get();
    // // .where("toUser/id", "==", user.id);

    // var list = [];
    // snapshot.forEach(doc => {
    //   doc.data().toUser.id === user.id
    //     ? list.push({
    //         date: doc.data().createdAt.seconds * 1000,
    //         message: doc.data().body
    //       })
    //     : null;
    // });
    // console.log(list[list.length - 1].date, "DATE");
    // let lastVisible = list[list.length - 1].date;
    // this.setState({
    //   history: list,
    //   loadingFooter: false,
    //   lastVisible: lastVisible,
    //   loading: false
    // });
    // // await firebase
    // //   .database()
    // //   .ref(`ActivityHistory/${id}`)
    // //   .on("value", snapshot => {
    // //     if (snapshot.exists()) {
    // //       this.setState({
    // //         history: snapshot.val(),

    // //         loading: false
    // //       });
    // //     }
    // //   });
  };

  retrieveMore = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    var user = await session.getUser();
    if (this.state.lastVisible) {
      this.setState({ loadingFooter: true });

      setTimeout(async () => {
        let snapshot = await firebase
          .firestore()
          .collection("notifications")
          .doc(user.id || user._id)
          .collection("notifications")
          .orderBy("createdAt", "asc")
          .startAfter(this.state.lastVisible.data().createdAt)
          .limit(this.state.limit)
          .get();

        if (!snapshot.empty) {
          let list = this.state.history;

          this.setState({
            lastVisible: snapshot.docs[snapshot.docs.length - 1]
          });

          snapshot.forEach(doc => {
            doc.data().toUser.id === user.id
              ? list.push({
                  date: doc.data().createdAt.seconds * 1000,
                  message: doc.data().body,
                  type: doc.data().type,
                  userName: doc.data().metadata.fromUser?.name
                })
              : null;
          });

          this.setState({ history: list });
          if (snapshot.docs.length < 3) this.setState({ lastVisible: null });
        } else {
          this.setState({ lastVisible: null });
          //    setLastDoc(null);
        }

        this.setState({ loadingFooter: false });
      }, 1000);
    }

    this.onEndReachedCalledDuringMomentum = true;
  };

  renderFooter = () => {
    if (!this.state.loadingFooter) return true;

    return (
      <ActivityIndicator
        color={theme.colorGrey}
        size={"large"}
        style={{ marginBottom: 10 }}
      />
    );
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userId !== this.props.navigation.getParam("userId")) {
      this.setState({
        userId: this.props.navigation.getParam("userId"),
        loading: true
      });
      this.getHistory(this.props.navigation.getParam("userId"));
    }
  }

  goBack = () => {
    this.props.navigation.navigate("Dashboard");
  };

  emptyComponent = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* <Text
          style={{
            flex: 1.5,
            ...styles.subtitle,
            fontSize: 10,
            color: theme.colorGrey,
            textAlign: "center"
          }}
        /> */}
        <Text
          style={{
            ...styles.subtitle,
            fontSize: 10,
            color: theme.colorGrey
          }}
        >
          {"No Activity Yet"}
        </Text>
        {/* <Text
          style={{
            flex: 1.5,
            ...styles.subtitle,
            fontSize: 10,
            color: theme.colorGrey
          }}
        /> */}
      </View>
    );
  };

  render() {
    const { user } = this.state;
    // addActivity(this.state.user?.jwt)
    // alert(user?.role)
    return (
      <Drawer
        open={this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={this.logout}
            //role={this.state.user?.role || ""}
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
            title={"Notifications"}
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
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "80%",
                marginLeft: "10%",
                // justifyContent: 'space-evenly',
                marginVertical: theme.size(30)
              }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 100,
                  borderColor: theme.colorGrey,
                  padding: 5,
                  width: 100,
                  height: 100,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Avatar
                  rounded
                  size={85}
                  source={{ uri: user?.photo ? user.photo : "" }}
                />
                {/* <View
                    style={[
                      {
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        backgroundColor: theme.colorGrey,
                        position: "absolute",
                        bottom: 8,
                        right: 8
                      },
                      this.state.user?.available
                        ? { backgroundColor: "#01E501" }
                        : null
                    ]}
                  /> */}
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft: 6
                }}
              >
                <Text
                  style={[
                    styles.h2,
                    {
                      fontFamily: theme.font.regular,
                      // fontSize: 18,
                      marginLeft: 5
                    }
                  ]}
                >
                  {user.name}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontFamily: theme.font.regular,
                      // fontSize: 18,
                      marginLeft: 5,
                      color: theme.colorGrey
                    }
                  ]}
                >
                  {user.email}
                </Text>
              </View>
            </View>

            <Divider
              style={{
                height: theme.size(1),
                width: "100%",
                backgroundColor: theme.colorLightGrey
              }}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  marginTop: theme.size(20),
                  // marginLeft: "10%",
                  width: "90%",
                  flexDirection: "column",
                  alignSelf: "center"
                }}
              >
                {this.state.loading ? (
                  <View style={styles.fillSpace}>
                    <ActivityIndicator color={theme.colorGrey} size={"large"} />
                  </View>
                ) : (
                  <FlatList
                    // Data
                    scrollEnabled={false}
                    data={this.state.history}
                    // Render Items
                    renderItem={({ item }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          margin: 2,
                          marginVertical: 5
                        }}
                      >
                        <Text
                          style={{
                            flex: 1.5,
                            ...styles.subtitle,
                            fontSize: 8,
                            color: theme.colorGrey,
                            // alignSelf: "flex-start",
                            textAlign: "left",
                            textAlignVertical: "center"
                          }}
                        >
                          {moment(item.date).format("DD/MM/YYYY")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (item.type) {
                              if (
                                item.type == "disable" ||
                                item.type == "UserChat" ||
                                item.type == "PersonalChat" ||
                                item.type == "PersonalChatMessage"
                              ) {
                                console.log("no navigate");
                              } else {
                                if (
                                  item.type == "new_user" &&
                                  user?.role == "ADMIN"
                                ) {
                                  this.props.navigation.navigate("AdminUsers");
                                } else if (
                                  item.type == "new_user" &&
                                  user?.role == "THERAPIST"
                                ) {
                                  this.props.navigation.navigate(
                                    "UnassignedUsers",
                                    {
                                      userID: item.userID
                                    }
                                  );
                                }
                                this.props.navigation.navigate(item.type);
                              }
                            } else {
                              console.log("no");
                            }
                          }}
                          style={{
                            flex: 7,
                            // textAlignVertical: "center",
                            backgroundColor: theme.colorLightGrey,
                            flex: 7,

                            color: theme.colorDarkGrey,
                            alignSelf: "center",

                            backgroundColor: theme.colorLightGrey,
                            padding: 5,
                            // paddingVertical: 5,
                            borderRadius: 3,
                            marginHorizontal: 2
                          }}
                        >
                          <Text
                            style={{
                              ...styles.subtitle,
                              textAlign: "center",
                              textAlignVertical: "center",

                              fontSize: 10
                            }}
                            numberOfLines={1}
                          >
                            {item.type == "PersonalChatMessage"
                              ? item?.userName +
                                " has messaged you : " +
                                item.message
                              : item.type == "UserChat"
                              ? item?.userName + " has called you "
                              : item.message}
                          </Text>
                        </TouchableOpacity>

                        <Text
                          style={{
                            flex: 1.5,
                            ...styles.subtitle,
                            fontSize: 8,
                            color: theme.colorGrey,
                            // alignSelf: "flex-end",
                            textAlign: "right"
                          }}
                        >
                          {moment(item.date).format("HH:mm A")}
                        </Text>
                      </View>
                    )}
                    // Element Key
                    keyExtractor={(item, index) => String(index)}
                    // Header (Title)
                    //   ListHeaderComponent={this.renderHeader}
                    // Footer (Activity Indicator)
                    ListFooterComponent={this.renderFooter}
                    ListEmptyComponent={this.emptyComponent}
                    // On End Reached (Takes in a function)
                    onMomentumScrollBegin={() => {
                      this.onEndReachedCalledDuringMomentum = false;
                    }}
                    onEndReached={() => {
                      if (
                        !this.onEndReachedCalledDuringMomentum &&
                        !this.state.loadingFooter
                      ) {
                        this.retrieveMore();
                      }
                    }}
                    // How Close To The End Of List Until Next Data Request Is Made
                    onEndReachedThreshold={0.1}
                    // Refreshing (Set To True When End Reached)
                    refreshing={this.state.refreshing}
                  />
                )}
                {/* {this.state.history ? (
                    this.state.history?.map(activity => (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          margin: 2
                        }}
                      >
                        <Text
                          style={{
                            flex: 1.5,
                            ...styles.subtitle,
                            fontSize: 8,
                            color: theme.colorGrey,
                            // alignSelf: "flex-start",
                            textAlign: "left",
                            textAlignVertical: "center"
                          }}
                        >
                          {moment(activity.date).format("DD/MM/YYYY")}
                        </Text>
                        <Text
                          style={{
                            flex: 7,
                            ...styles.subtitle,
                            fontSize: 10,
                            color: theme.colorGrey,

                            color: theme.colorDarkGrey,
                            alignSelf: "center",
                            textAlign: "center",
                            textAlignVertical: "center",
                            backgroundColor: theme.colorLightGrey,
                            padding: 5,
                            paddingVertical: 3,
                            borderRadius: 3,
                            marginHorizontal: 2
                          }}
                        >
                          {activity.message}
                        </Text>
                        <Text
                          style={{
                            flex: 1.5,
                            ...styles.subtitle,
                            fontSize: 8,
                            color: theme.colorGrey,
                            // alignSelf: "flex-end",
                            textAlign: "right"
                          }}
                        >
                          {moment(activity.date).format("HH:mm A")}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          flex: 1.5,
                          ...styles.subtitle,
                          fontSize: 10,
                          color: theme.colorGrey
                        }}
                      />
                      <Text
                        style={{
                          flex: 7,
                          ...styles.subtitle,
                          fontSize: 10,
                          color: theme.colorGrey
                        }}
                      >
                        {"No Activity Yet"}
                      </Text>
                      <Text
                        style={{
                          flex: 1.5,
                          ...styles.subtitle,
                          fontSize: 10,
                          color: theme.colorGrey
                        }}
                      />
                    </View>
                  )} */}
              </View>
            </ScrollView>
          </View>
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
