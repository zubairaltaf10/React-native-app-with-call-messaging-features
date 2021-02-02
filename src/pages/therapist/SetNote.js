import React, { Component } from "react";
import {
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from "react-native";
import { styles, theme } from "../../styles";
import { ListItem, Icon, Button } from "react-native-elements";
import Header from "../../components/Header";
import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import session from "../../data/session";
import Input from "../../components/Input";
import Slider from "../../components/Slider";
import LinearGradient from "react-native-linear-gradient";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import BottomBar from "../../components/BottomBar";
import NetworkUtils from "../../components/NetworkUtil";
class SetNote extends Component {
  constructor(props) {
    super(props);
    let { width } = Dimensions.get("window");
    this.state = {
      loading: false,
      description: "",
      anxiety: 0,
      energy: 0,
      confidence: 0,
      width: width - 32,
      userId: props.navigation.getParam("userId"),
      mood: props.navigation.getParam("mood")
    };
  }

  async componentDidMount() {
    const user = await session.getUser();
    this.setState({ user });
    console.log("Note", user);
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  componentDidUpdate(prevProps, prevState) {
    const mood = this.props.navigation.getParam("mood");
    if (prevState.mood !== mood) {
      this.setState({ mood: mood });
    }
  }

  handlePress = (x, property) => {
    let value = Math.round((x - 16) / 17);
    if (value >= 20) {
      value = 20;
    }
    if (value <= 0) {
      value = 0;
    }
    value = value - 10;
    this.setState({ [property]: value });
  };

  handleTap = (evt, property) => {
    let x = evt.nativeEvent.locationX;
    let value = Math.round((x - 16) / 17);
    if (value >= 20) {
      value = 20;
    }
    if (value <= 0) {
      value = 0;
    }
    value = value - 10;
    this.setState({ [property]: value });
  };

  onSubmit = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    const user = await session.getUser();
    if (!this.state.loading) {
      let { anxiety, confidence, energy, description, mood } = this.state;
      if (description.length === 0) {
        Snack("error", "Must describe what you are feeling");
      } else {
        this.setState({ loading: true });
        let length = 0;
        let date = new Date().toISOString();
        let newMood = {
          mood,
          date,
          anxiety,
          confidence,
          energy,
          description
        };
        await firebase
          .database()
          .ref(`therapistDiary/${user.jwt}/${this.state.userId}`)
          .once("value", snap => {
            if (snap.exists()) {
              length = snap.val().length;
            }
          });
        await firebase
          .database()
          .ref(`therapistDiary/${user.jwt}/${this.state.userId}/${length}`)
          .set(newMood)
          .then(resp => {
            Snack("success", "Note added successfully");
            this.setState({
              loading: false,
              description: "",
              anxiety: 0,
              energy: 0,
              confidence: 0,
              mood: ""
            });
            this.props.navigation.goBack(null);
            this.props.navigation.goBack(null);
          })
          .catch(err => {
            this.setState({ loading: false });
            if (err.message) {
              Snack("error", err.message);
            } else {
              Snack("error", "Unknown error occured, please contact an Admin");
            }
          });
      }
    }
  };

  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
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
            title={"Set mood"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            // iconRight={"exit-to-app"}
            // logout={this.logout}
          />
          <View
            style={{ flex: 1, width: "100%", justifyContent: "space-between" }}
          >
            <ScrollView style={[styles.bodyPadding]}>
              <Text
                style={[
                  styles.h1,
                  {
                    textAlign: "center",
                    color: theme.colorPrimary,
                    marginVertical: theme.size(20)
                  }
                ]}
              >
                Notes
              </Text>
              <Text
                style={[
                  styles.title,
                  {
                    textAlign: "center",
                    fontFamily: theme.font.medium,
                    marginBottom: theme.size(10)
                  }
                ]}
              >
                Type what you are feeling
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Input
                  placeholder={"Im feeling..."}
                  onChange={this.onChange}
                  inputStyle={styles.title}
                  propertyName={"description"}
                  multiline={true}
                  numberOfLines={3}
                  value={this.state.description}
                  maxLength={1000}
                />
                <Text
                  style={{
                    textAlign: "right",

                    ...styles.title,
                    ...Platform.select({
                      ios: {
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        minHeight: 50
                      },
                      android: {
                        paddingHorizontal: 10
                      }
                    })
                  }}
                >
                  {this.state.description.length + 0}/1000 characters
                </Text>
              </View>
              <Slider
                width={this.state.width}
                handleGesture={this.handleGesture}
                value={this.state.anxiety}
                property={"anxiety"}
                title={"Anxiety"}
                handlePress={this.handlePress}
                handleTap={this.handleTap}
              />
              <Slider
                width={this.state.width}
                handlePress={this.handlePress}
                value={this.state.energy}
                property={"energy"}
                title={"Energy level"}
                handlePress={this.handlePress}
                handleTap={this.handleTap}
              />
              <Slider
                width={this.state.width}
                handlePress={this.handlePress}
                value={this.state.confidence}
                property={"confidence"}
                title={"Self-Confidence"}
                handlePress={this.handlePress}
                handleTap={this.handleTap}
              />
              <Button
                title="Save"
                onPress={() => this.onSubmit()}
                buttonStyle={{
                  // backgroundColor: theme.colorGrey,
                  borderRadius: theme.size(6),
                  alignSelf: "center",
                  height: 48
                  //  margin:10
                }}
                titleStyle={
                  {
                    // ...styles.title,
                    // color: theme.colorAccent,
                    // fontFamily: theme.font.medium
                  }
                }
                containerStyle={{
                  marginVertical: theme.size(20),
                  marginTop: 40
                }}
                loading={this.state.loading}
                ViewComponent={LinearGradient}
              />
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
    // }
  }
}

export default SetNote;
