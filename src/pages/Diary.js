import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  Switch,
  Platform
} from "react-native";
import { styles, theme } from "../styles";
import { Button, Badge, Avatar, ListItem, Icon } from "react-native-elements";
import Header from "../components/Header";
import Snack from "../components/Snackbar";
import BottomBar from "../components/BottomBar";
import session from "../data/session";
import LinearGradient from "react-native-linear-gradient";
import { roles } from "../util/enums/User";
//import { http } from "../../util/http";
import firebase from "../services/firebase";
import moment from "moment";
import Moment from "react-moment";
import Calender from "../components/CustomMonthCalender";
import * as actions from "../store/actions";
import { connect } from "react-redux";
import Snackbar from "../components/Snackbar";
import Drawer from "react-native-drawer";
import List from "../components/List";
import TopBar from "../components/TopBar";
import ProfileOptionsBar from "../components/ProfileOptionsBar";
import NetworkUtils from "../components/NetworkUtil";
let moodList = [
  {
    title: "Crying",
    icon: "emoticon-cry-outline"
  },
  {
    title: "Depressed",
    icon: "emoticon-dead-outline"
  },
  {
    title: "Excited",
    icon: "emoticon-excited-outline"
  },
  {
    title: "Ok",
    icon: "emoticon-neutral-outline"
  },
  {
    title: "Sad",
    icon: "emoticon-sad-outline"
  }
];

class Diary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.navigation.getParam("user"),
      patientId: props.navigation.getParam("userId"),
      loading: false,
      selectedMood: "",
      moodList: [],
      sortBy: "",
      shareDiaryWithTherapist: false,
      switchToTherapistDiary: false,
      filter: "Day",
      diary: []
    };
  }

  getMoodIcon = title => {
    for (let i = 0; i < moodList.length; i++) {
      if (title === moodList[i].title) return moodList[i].icon;
    }
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };
  async componentDidMount() {
    const loggedUser = await session.getUser();
    const diary = this.props.auth.diary;
    this.setState({ diary });
    this.setState({
      loggedUser,
      userId: this.props.navigation.getParam("userId"),
      therapistId: this.props.navigation.getParam("therapistId")
    });
    await firebase
      .database()
      .ref(`users/${this.props.navigation.getParam("userId")}`)
      .once("value", snap => {
        if (snap.exists()) {
          this.setState({
            user: snap.val(),
            shareDiaryWithTherapist: snap.val().shareDiaryWithTherapist
          });
        }
      });
    if (!!this.props.navigation.getParam("therapistId")) {
      // await this.props.fetchDiary(
      //   this.props.navigation.getParam("userId"),
      //   this.props.navigation.getParam("therapistId")
      // );
      firebase
        .database()
        .ref(
          `therapistDiary/${this.props.navigation.getParam(
            "therapistId"
          )}/${this.props.navigation.getParam("userId")}`
        )
        .on("value", async snapshot => {
          if (
            snapshot.exists() &&
            !!this.props.navigation.getParam("therapistId")
          ) {
            await this.setState({ diary: snapshot.val() });
            await this.getDiary("Day");
          }
        });
    } else {
      // await this.props.fetchDiary(
      //   this.props.navigation.getParam("userId"),
      //   null
      // );
      // alert(JSON.stringify(this.props.navigation.getParam("userId")))
      firebase
        .database()
        .ref(`diary/${this.props.navigation.getParam("userId")}`)
        .on("value", async snapshot => {
          if (snapshot.exists() && !!this.props.navigation.getParam("userId")) {
            // alert(JSON.stringify(snapshot.val()))
            await this.setState({ diary: snapshot.val() });
            await this.getDiary("Day");
          }
        });
    }

    console.log("diary", this.props.auth.diary);
    // this.getDiary("Day");

    // this.setState({ shareDiaryWithTherapist: user.shareDiaryWithTherapist });
    // console.log("user in diary", this.state.user);

    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }
  getDiary = async sortBy => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      // return;
    }
    if (!this.state.diary) {
      if (!!this.props.navigation.getParam("therapistId")) {
        console.log("asdadssad");
        await this.props.fetchDiary(
          this.props.navigation.getParam("userId"),
          this.props.navigation.getParam("therapistId")
        );
        await this.setState({ diary: this.props.auth.diary });
      } else {
        console.log("sparta");
        await this.props.fetchDiary(
          this.props.navigation.getParam("userId"),
          null
        );
      }
    }

    const diary = this.state.diary;
    console.log(diary, "diary");
    // this.setState({ diary });

    let moods = [];

    if (sortBy === "Day") {
      console.log("sortBy day");
      let date = moment().format("YYYY-MM-DD");
      moods = diary.filter(mood => {
        console.log("yjhbjday", moment(mood.date).format("YYYY-MM-DD"));
        return moment(mood.date).format("YYYY-MM-DD") === date;
      });

      this.setState({ moodList: moods, sortBy });

      //   .catch(err => {
      //     if (err.response) {
      //       Snack('error', err.response.data.error);
      //     } else {
      //       Snack('error', 'Unknown error occured, please contact an Admin');
      //     }
      //   });
    } else if (sortBy === "Week") {
      let weekMoods = [];
      for (let i = 0; i < 7; i++) {
        let date = moment()
          .subtract("day", i)
          .format("YYYY-MM-DD");

        weekMoods = [
          ...weekMoods,
          ...diary.filter(mood => {
            return moment(mood.date).format("YYYY-MM-DD") === date;
          })
        ];
      }

      this.setState({ moodList: weekMoods, sortBy });
    } else if (sortBy === "Month") {
      let monthMoods = [];

      monthMoods = [...monthMoods, ...diary];

      this.setState({ moodList: monthMoods, sortBy });
    }
    console.log("moods", this.state);
  };

  handleBackButton = () => {
    this.goBack();
    return true;
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  updateSelectedMood = mood => {
    this.setState({ selectedMood: mood });
    this.props.navigation.navigate("SetNote", { mood: mood });
  };

  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
  };
  toggleShareDiary = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    this.setState({
      shareDiaryWithTherapist: !this.state.shareDiaryWithTherapist
    });
    // alert(this.state.shareDiaryWithTherapist);
    const loggedUser = await session.getUser();
    this.setState({ loggedUser });
    const ref = await firebase
      .database()
      .ref(`users/${loggedUser.jwt}`)
      .child("shareDiaryWithTherapist")
      .set(this.state.shareDiaryWithTherapist);
    Snackbar("success", "Diary Status Changed Successfully");
    // this.props.fetchUsers();
    //  this.props.auth.users.filter
    // alert(this.state.shareDiaryWithTherapist);
  };
  toggleSwitchToTherapistDiary = async () => {
    this.setState({
      switchToTherapistDiary: !this.state.switchToTherapistDiary
    });
    if (!this.state.therapistId) {
      var therapistId = this.state.user.therapists.filter(
        therapist => therapist.status === "active"
      )[0].id;
      console.log(therapistId, "312");
      this.setState({ therapistId });
    }

    console.log(therapistId, "asd");
    alert(this.state.switchToTherapistDiary);
    if (!this.state.switchToTherapistDiary) {
      console.log("hi hi hi");
      await this.props.fetchDiary(this.state.userId, therapistId);
      await this.setState({ diary: this.props.auth.diary });
    } else {
      console.log("hi hi hi312123");
      await this.props.fetchDiary(this.state.userId, null);
      //  alert(JSON.stringify(this.props.auth.diary));
    }
    this.setState({ filter: "Day" });
    await this.getDiary("Day");
    // else{ alert(this.state.therapistId)}
  };
  render() {
    console.log(this.state.diary, "mood");
    const { user } = this.state;
    return (
      <Drawer
        open={this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={this.logout}
            //role={this.state.user?.role}
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
            title={"Diary"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            //   iconRight={"exit-to-app"}
            //  logout={this.logout}
          />
          <View
            style={{ flex: 1, justifyContent: "space-between", width: "100%" }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={[
                  styles.h1,
                  {
                    textAlign: "center",
                    color: theme.colorPrimary,
                    marginTop: 20
                  }
                ]}
              >
                Mood diary
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    textAlign: "center",

                    marginBottom: theme.size(10)
                  }
                ]}
              >
                You can see your mood history
              </Text>
              <ProfileOptionsBar
                style={{ marginBottom: 20 }}
                options={[
                  this.state.loggedUser?.role === "USER"
                    ? {
                        title: "Share diary with therapist",
                        component: (
                          <Switch
                            trackColor={{
                              false: theme.colorLightGrey,
                              true: theme.colorGradientEnd
                            }}
                            thumbColor={
                              true ? theme.colorGradientStart : theme.colorGrey
                            }
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                              this.toggleShareDiary();
                            }}
                            value={this.state.shareDiaryWithTherapist}
                            hitSlop={{
                              top: 10,
                              left: 10,
                              bottom: 10,
                              right: 10
                            }}
                            style={{
                              transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }]
                            }}
                          />
                        )
                      }
                    : null,
                  this.state.loggedUser?.role === "ADMIN" &&
                  this.state.user?.status !== "reassigned"
                    ? {
                        title: !!this.state.switchToTherapistDiary
                          ? "Switch to user diary"
                          : "Switch to therapist diary",
                        component: (
                          <Switch
                            trackColor={{
                              false: theme.colorLightGrey,
                              true: theme.colorGradientEnd
                            }}
                            thumbColor={
                              true ? theme.colorGradientStart : theme.colorGrey
                            }
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                              this.toggleSwitchToTherapistDiary();
                            }}
                            value={!!this.state.switchToTherapistDiary}
                            hitSlop={{
                              top: 10,
                              left: 10,
                              bottom: 10,
                              right: 10
                            }}
                            style={{
                              transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }]
                            }}
                          />
                        )
                      }
                    : null,
                  {
                    title: "View emotional history",
                    icon: {
                      name: "chart-pie",
                      type: "material-community"
                    },
                    onPress: () =>
                      this.props.navigation.navigate("History", {
                        data: this.state.diary,
                        userId: this.state.userId,
                        therapistId: this.state.therapistId
                      })
                  }
                ]}
              />
              <TopBar
                filters={["Day", "Week", "Month"]}
                labels={["Day", "Week", "Month"]}
                onPress={filter => {
                  this.setState({ filter });
                  this.getDiary(filter);
                }}
                selected={this.state.filter}
              />

              {this.state.sortBy === "Month" ? (
                <>
                  <Calender
                    mood={this.state.moodList}
                    onPress={activeDate => {
                      this.setState({ activeDate });
                    }}
                  />
                  {/* <View
                    style={{
                      flexWrap: "wrap",
                      flexDirection: "row",
                      marginHorizontal: 10
                    }}
                  >
                    {this.state.moodList.map(i => (
                      <>
                        <View
                          style={[
                            {
                              width: 20,
                              height: 20,
                              borderRadius: 3,
                              margin: 0.5
                            },
                            ["Sad", "Crying", "Depressed"].includes(i.mood)
                              ? { backgroundColor: "#ddd" }
                              : { backgroundColor: "#0f0" }
                          ]}
                        />

                     
                      </>
                    ))}
                  </View> */}
                </>
              ) : (
                <View style={{ marginTop: 5 }}>
                  {this.state.moodList.map(mood => {
                    return (
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-evenly",
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colorPrimary
                        }}
                        onPress={() => {
                          // alert('l')
                          this.props.navigation.navigate("ViewMood", {
                            mood,
                            enable: false
                          });
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-evenly"
                            // borderBottomWidth: 1,
                            //  borderBottomColor: theme.colorPrimary
                          }}
                          key={mood.title}
                        >
                          {
                            <View
                              style={{
                                width: "30%",
                                height: theme.size(70),
                                alignItems: "center",
                                flexDirection: "row"
                              }}
                            >
                              <Badge status="primary" />
                              <View
                                style={{
                                  // width: "30%",
                                  // height: theme.size(70),
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  marginLeft: theme.size(25),
                                  marginRight: theme.size(15)
                                }}
                              >
                                <Moment
                                  style={[
                                    {
                                      fontSize: theme.size(14),
                                      color: theme.colorGrey
                                    }
                                  ]}
                                  format="hh:mm A"
                                  element={Text}
                                >
                                  {mood.date}
                                </Moment>
                                <Moment
                                  style={[
                                    {
                                      fontSize: theme.size(12),
                                      color: theme.colorGrey
                                    }
                                  ]}
                                  format="DD-MM-YYYY"
                                  element={Text}
                                >
                                  {mood.date}
                                </Moment>
                              </View>
                            </View>
                          }
                          <View
                            style={{
                              width: "30%",
                              flexDirection: "column",
                              justifyContent: "flex-start",
                              paddingHorizontal: theme.size(15)
                            }}
                          >
                            <Text style={[styles.bodyText, { color: "#000" }]}>
                              {mood.mood}
                            </Text>
                          </View>
                          <View style={{ width: "30%" }}>
                            <Icon
                              name={this.getMoodIcon(mood.mood)}
                              color={
                                this.state.selectedMood === mood.title
                                  ? theme.colorPrimary
                                  : "black"
                              }
                              type="material-community"
                              size={50}
                              underlayColor="transparent"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
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

const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(
  mapToStateProps,
  actions
)(Diary);
