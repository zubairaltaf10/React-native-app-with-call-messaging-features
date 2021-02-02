import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Dimensions
} from "react-native";
import { styles, theme } from "../../styles";
import { Button, Badge, Avatar, ListItem, Icon } from "react-native-elements";
import Header from "../../components/Header";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import { roles } from "../../util/enums/User";
//import {http} from '../../util/http';
import firebase from "../../services/firebase";
import moment from "moment";
import Moment from "react-moment";

import * as actions from "../../store/actions";
import { connect } from "react-redux";
import List from "../../components/List";
import Drawer from "react-native-drawer";
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
      userId: props.navigation.getParam("userId"),
      loading: false,
      selectedMood: "",
      moodList: [],
      sortBy: ""
    };
  }

  getMoodIcon = title => {
    for (let i = 0; i < moodList.length; i++) {
      if (title == moodList[i].title) return moodList[i].icon;
    }
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  getDiary = sortBy => {
    // await this.props.fetchDiary(
    //   this.props.navigation.getParam('userId')
    //     ? this.props.navigation.getParam('userId')
    //     : null,
    //   this.props.navigation.getParam('therapistDiary') ? true : false,
    // );
    console.log("diary", this.props.auth);
    const diary = this.props.auth.diary;
    let moods = [];
    if (sortBy !== this.state.sortBy) {
      if (sortBy === "Day") {
        let date = moment().format("YYYY-MM-DD");
        // alert(moment(mood.date).format('YYYY-MM-DD'))
        moods = diary.filter(mood => {
          return moment(mood.date).format("YYYY-MM-DD") === date;
        });
        console.log("mday", moods);

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
        console.log("WeekMoods", weekMoods);
        this.setState({ moodList: weekMoods, sortBy });
      } else if (sortBy === "Month") {
        let monthMoods = [];
        for (let i = 0; i < 30; i++) {
          let date = moment()
            .subtract("day", i)
            .format("YYYY-MM-DD");

          monthMoods = [
            ...monthMoods,
            ...diary.filter(mood => {
              return moment(mood.date).format("YYYY-MM-DD") === date;
            })
          ];
        }
        console.log("MonthMoods", monthMoods);
        this.setState({ moodList: monthMoods, sortBy });
      }
    }
  };

  async componentDidMount() {
    await this.props.fetchDiary(
      this.props.navigation.getParam("userId")
        ? this.props.navigation.getParam("userId")
        : null,
      this.props.navigation.getParam("therapistDiary") ? true : false
    );

    console.log("diary", this.props.auth.diary);
    await this.getDiary("Day");

    //   .catch(err => {
    //     if (err.response) {
    //       Snack('error', err.response.data.error);
    //     } else {
    //       Snack('error', 'Unknown error occured, please contact an Admin');
    //     }
    //   });
    // http
    //   .get(`/users/diary?sortBy=Day`, {
    //     headers: {Authorization: `Bearer ${this.state.user?.jwt}`},
    //   })
    //   .then(resp => {
    //     this.setState({moodList: resp.data.data});
    //   })
    //   .catch(err => {
    //     if (err.response) {
    //       Snack('error', err.response.data.error);
    //     } else {
    //       Snack('error', 'Unknown error occured, please contact an Admin');
    //     }
    //   });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
    return true;
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const { user } = this.state;
    return (
      <Drawer
        open={!!this.state.drawer}
        type="overlay"
        content={
          <List
            navigation={this.props.navigation}
            onClose={() => this.setState({ drawer: false })}
            onLogout={user.role}
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
            title={
              this.props.navigation.getParam("therapistDiary")
                ? "History"
                : "Diary"
            }
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            //   iconRight={"exit-to-app"}
            //   logout={this.logout}
          />
          <View
            style={{ flex: 1, justifyContent: "space-between", width: "100%" }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Icon
                name={"chart-pie"}
                color={"black"}
                type="material-community"
                underlayColor="transparent"
                size={40}
                containerStyle={{
                  alignSelf: "flex-end",
                  top: theme.size(5),
                  right: theme.size(5)
                }}
                onPress={() =>
                  this.props.navigation.navigate("TherapistPatientHistory", {
                    userId: this.state.userId,
                    data: this.state.moodList,
                    therapistDiary: this.props.navigation.getParam(
                      "therapistDiary"
                    )
                      ? true
                      : false
                  })
                }
              />
              <Text
                style={[
                  styles.h1,
                  { textAlign: "center", color: theme.colorPrimary }
                ]}
              >
                Mood diary
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    textAlign: "center",

                    marginBottom: theme.size(20)
                  }
                ]}
              >
                You can see your mood history
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  marginBottom: theme.size(20)
                }}
              >
                {this.state.sortBy === "Day" ? (
                  <Button
                    containerStyle={{ width: "30%" }}
                    title="Day"
                    ViewComponent={LinearGradient}
                    onPress={() => this.getDiary("Day")}
                  />
                ) : (
                  <Button
                    buttonStyle={{ backgroundColor: "white" }}
                    titleStyle={{ color: "black" }}
                    containerStyle={{ width: "30%" }}
                    title="Day"
                    linearGradientProps={null}
                    onPress={() => this.getDiary("Day")}
                  />
                )}
                {this.state.sortBy === "Week" ? (
                  <Button
                    containerStyle={{ width: "30%" }}
                    title="Week"
                    ViewComponent={LinearGradient}
                    onPress={() => this.getDiary("Week")}
                  />
                ) : (
                  <Button
                    buttonStyle={{ backgroundColor: "white" }}
                    titleStyle={{ color: "black" }}
                    containerStyle={{ width: "30%" }}
                    title="Week"
                    linearGradientProps={null}
                    onPress={() => this.getDiary("Week")}
                  />
                )}
                {this.state.sortBy === "Month" ? (
                  <Button
                    containerStyle={{ width: "30%" }}
                    title="Month"
                    ViewComponent={LinearGradient}
                    onPress={() => this.getDiary("Month")}
                  />
                ) : (
                  <Button
                    buttonStyle={{ backgroundColor: "white" }}
                    titleStyle={{ color: "black" }}
                    containerStyle={{ width: "30%" }}
                    title="Month"
                    linearGradientProps={null}
                    onPress={() => this.getDiary("Month")}
                  />
                )}
              </View>
              {this.state.sortBy === "Month" ? (
                <View
                  style={{
                    flexWrap: "wrap",
                    flexDirection: "row",
                    marginHorizontal: 10
                  }}
                >
                  {this.state.moodList.map(i => (
                    <View
                      style={[
                        { width: 20, height: 20, borderRadius: 3, margin: 0.5 },
                        ["Sad", "Crying", "Depressed"].includes(i.mood)
                          ? { backgroundColor: "#ddd" }
                          : { backgroundColor: "#0f0" }
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <>
                  {this.state.moodList.map(mood => {
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-evenly",
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colorPrimary
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

                            <Moment
                              style={[
                                {
                                  fontSize: theme.size(14),
                                  color: theme.colorGrey,
                                  marginLeft: theme.size(25),
                                  marginRight: theme.size(15)
                                }
                              ]}
                              format="hh:mm A"
                              element={Text}
                            >
                              {mood.date}
                            </Moment>
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
                          <Moment
                            style={[
                              {
                                fontSize: theme.size(14),
                                color: theme.colorGrey
                              }
                            ]}
                            format="DD-MM-YYYY"
                            element={Text}
                          >
                            {mood.date}
                          </Moment>
                        </View>
                        <View style={{ width: "30%" }}>
                          <Icon
                            name={this.getMoodIcon(mood.mood)}
                            underlayColor="transparent"
                            color={
                              this.state.selectedMood === mood.title
                                ? theme.colorPrimary
                                : "black"
                            }
                            type="material-community"
                            size={50}
                          />
                        </View>
                      </View>
                    );
                  })}
                </>
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
