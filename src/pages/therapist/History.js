import React, { Component, useReducer } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  BackHandler,
  Dimensions
} from "react-native";
import { styles, theme } from "../../styles";
import { Icon } from "react-native-elements";
import Header from "../../components/Header";
//import {http} from '../../util/http';

import { PieChart } from "react-native-svg-charts";
import { Text as Textt } from "react-native-svg";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar.js";
import session from "../../data/session";
import Moment from "react-moment";
import LinearGradient from "react-native-linear-gradient";

import * as actions from "../../store/actions";
import { connect } from "react-redux";

class PatientHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.navigation.getParam("userId"),
      user: props.navigation.getParam("user"),
      loading: true,
      data: null,
      moodsTaken: "00",
      firstNote: null,
      positiveEntries: 0,
      negativeEntries: 0
    };
  }

  async componentDidMount() {
    this.props.fetchDiary(
      this.props.navigation.getParam("userId"),
      this.props.navigation.getParam("therapistDiary") ? true : false
    );
    this.getDiary(this.props.navigation.getParam("userId"));
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  getDiary = async id => {
    // alert(this.props.navigation.getParam('therapistDiary'))
    // this.props.fetchDiary()
    console.log("diary therapist", this.props.auth.diary);
    let moods = this.props.auth.diary;
    // .filter(d => d.id === id);
    // alert(this.props.auth.diary.length);
    let positiveEntries = 0,
      negativeEntries = 0;

    for (let i = moods.length - 1; i >= 0; i--) {
      let sum = moods[i].energy + moods[i].anxiety + moods[i].confidence;
      if (sum > 0) {
        positiveEntries++;
      } else {
        negativeEntries++;
      }
    }
    let energy = moods.reduce((acc, item) => acc + item.energy, 0);
    // >= 0
    //   ? moods.reduce((acc, item) => acc + item.energy, 0)
    // : 0;
    let anxiety = moods.reduce((acc, item) => acc + item.anxiety, 0);
    //  >= 0
    //   ? moods.reduce((acc, item) => acc + item.anxiety, 0)
    //   : 0;
    let confidence = moods.reduce((acc, item) => acc + item.confidence, 0);
    //  >= 0
    //   ? moods.reduce((acc, item) => acc + item.confidence, 0)
    //   : 0;

    let data = [];
    if (energy) {
      data.push({
        key: 1,
        amount: energy < 0 ? energy * -1 : energy,
        svg: { fill: "#E5BB32" },
        label: "Energy  " + energy
      });
    }
    if (anxiety) {
      data.push({
        key: 2,
        amount: anxiety < 0 ? anxiety * -1 : anxiety,
        svg: { fill: "#30B799" },
        label: "Anxiety  " + anxiety
      });
    }
    if (confidence) {
      data.push({
        key: 3,
        amount: confidence < 0 ? confidence * -1 : confidence,
        svg: { fill: "#DF7A33" },
        label: "Confidence  " + confidence
      });
    }
    // alert(moods.length);
    this.setState({
      data: data,
      loading: false,
      moodsTaken: moods.length,
      firstNote: moods[0]?.date,
      positiveEntries,
      negativeEntries
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userId !== this.props.navigation.getParam("userId")) {
      this.setState({
        data: null,
        moodsTaken: "00",
        firstNote: null,
        userId: this.props.navigation.getParam("userId"),
        loading: true
      });
      this.props.fetchDiary(
        this.props.navigation.getParam("userId"),
        this.props.navigation.getParam("therapistDiary")
      );
      this.getDiary();
    }
  }

  goBack = () => {
    this.props.navigation.goBack();
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  render() {
    let Labels;
    if (this.state.data) {
      Labels = ({ slices, height, width }) => {
        return slices.map((slice, index) => {
          const { labelCentroid, pieCentroid, data } = slice;
          return (
            <Textt
              key={index}
              x={pieCentroid[0]}
              y={pieCentroid[1]}
              fill={"white"}
              textAnchor={"middle"}
              alignmentBaseline={"middle"}
              fontSize={20}
            >
              {data.amount}
            </Textt>
          );
        });
      };
    }

    return (
      <View style={styles.fillSpace}>
        <Header
          title={"Moods Average"}
          changeDrawer={this.goBack}
          icon={"arrow-back"}
          customStyles={{
            height: (76 * Dimensions.get("window").height) / 896
          }}
          //   iconRight={"exit-to-app"}
          //    logout={this.logout}
        />
        <View style={{ flex: 1, width: "100%" }}>
          <Text
            style={[
              styles.h1,
              {
                textAlign: "center",
                color: theme.colorPrimary,
                marginTop: theme.size(10)
              }
            ]}
          >
            Emotional History
          </Text>
          <Text
            style={[
              styles.bodyText,
              { textAlign: "center", marginTop: theme.size(2) }
            ]}
          />
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: "30%",
                justifyContent: "flex-end",
                marginLeft: "2%"
              }}
            >
              {this.state.data
                ? this.state.data.map((item, index) => {
                    return (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                        key={index}
                      >
                        <View
                          style={{
                            backgroundColor: item.svg.fill,
                            height: theme.size(12),
                            width: theme.size(12)
                          }}
                        />
                        <Text
                          style={[
                            styles.subtitle,
                            {
                              fontSize: theme.size(12),
                              marginLeft: theme.size(10)
                            }
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                    );
                  })
                : null}
            </View>
            <View style={{ width: "70%", justifyContent: "flex-start" }}>
              {this.state.data?.length ? (
                <PieChart
                  style={{ height: 200, width: 150 }}
                  valueAccessor={({ item }) =>
                    item.amount > 0 ? item.amount : item.amount * -1
                  }
                  data={this.state.data}
                  spacing={0}
                  outerRadius={"95%"}
                >
                  <Labels />
                </PieChart>
              ) : (
                <Text
                  style={[
                    styles.bodyText,
                    {
                      color: "black",
                      height: theme.size(100),
                      marginTop: theme.size(100)
                    }
                  ]}
                >
                  No data to show
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              height: width * 0.33,
              marginTop: theme.size(30)
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[theme.colorGradientStart, theme.colorGradientEnd]}
              style={{
                height: width * 0.33,
                width: width * 0.33,
                backgroundColor: theme.colorPrimary
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text
                  style={[
                    styles.bodyText,
                    { color: theme.colorAccent, textAlign: "center" }
                  ]}
                >
                  Moods taken
                </Text>
                <Text
                  style={[
                    styles.bodyText,
                    {
                      color: theme.colorAccent,
                      fontSize: theme.size(20),
                      marginTop: theme.size(5)
                    }
                  ]}
                >
                  {this.state.moodsTaken}
                </Text>
              </View>
            </LinearGradient>
            <View
              style={{
                backgroundColor: "#f7f7f7",
                width: width * 0.33,
                borderRightColor: theme.colorLightGrey,
                borderRightWidth: theme.size(0.5),
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text
                style={[
                  styles.bodyText,
                  { color: theme.colorMenuHeading, textAlign: "center" }
                ]}
              >
                Positive entries
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  {
                    color: theme.colorMenuHeading,
                    fontSize: theme.size(20),
                    marginTop: theme.size(5)
                  }
                ]}
              >
                {this.state.positiveEntries}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#f7f7f7",
                width: width * 0.33,
                borderRightColor: theme.colorLightGrey,
                borderRightWidth: theme.size(0.5),
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text
                style={[
                  styles.bodyText,
                  { color: theme.colorMenuHeading, textAlign: "center" }
                ]}
              >
                Negative entries
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  {
                    color: theme.colorMenuHeading,
                    fontSize: theme.size(20),
                    marginTop: theme.size(5)
                  }
                ]}
              >
                {this.state.negativeEntries}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: "20%",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              style={[
                styles.bodyText,
                { color: theme.colorMenuHeading, marginTop: theme.size(15) }
              ]}
            >
              First Note Taken
            </Text>
            <Text
              style={[
                styles.bodyText,
                { color: theme.colorMenuHeading, fontSize: theme.size(26) }
              ]}
            >
              {!this.state.firstNote ? (
                "00-00-0000"
              ) : (
                <Moment format="DD-MM-YYYY" element={Text}>
                  {this.state.firstNote}
                </Moment>
              )}
            </Text>
          </View>
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
              onPress: () => this.props.navigation.navigate("Settings")
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
)(PatientHistory);
