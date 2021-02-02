import React, { Component } from "react";
import {
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform
} from "react-native";
import { styles, theme } from "../styles";
import { ListItem, Icon, Button } from "react-native-elements";
import Header from "../components/Header";
//import {http} from '../../util/http';
// import firebase from "../../services/firebase";
// import Snack from "../../components/Snackbar";
import BottomBar from "../components/BottomBar";
import session from "../data/session";
import Input from "../components/Input";
import Slider from "../components/Slider";
import LinearGradient from "react-native-linear-gradient";
import Drawer from "react-native-drawer";
import List from "../components/List";

class ViewMood extends Component {
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
      mood: props.navigation.getParam("mood")
    };
  }

  async componentDidMount() {
    const user = await session.getUser();
    const { mood } = this.state;
    // alert(JSON.stringify(mood))
    this.setState({
      anxiety: mood.anxiety,
      confidence: mood.confidence,
      energy: mood.energy,
      description: mood.description
    });
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
    if (prevState.mood !== this.props.navigation.getParam("mood")) {
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

  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
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
            ////role={this.state.user?.role || "USER"}
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
            title={"Mood Detail"}
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

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Input
                  placeholder={"I'm feeling..."}
                  onChange={this.onChange}
                  propertyName={"description"}
                  inputStyle={{
                    ...styles.title,
                    ...Platform.select({
                      ios: {
                        paddingHorizontal: 10
                      },
                      android: {
                        paddingHorizontal: 10
                      }
                    })
                  }}
                  multiline={true}
                  numberOfLines={3}
                  value={this.state.description}
                  maxLength={1000}
                  editable={false}
                />
              </View>
              <Slider
                width={this.state.width}
                handleGesture={this.handleGesture}
                value={this.state.anxiety}
                property={"anxiety"}
                title={"Anxiety"}
                handlePress={this.handlePress}
                handleTap={this.handleTap}
                enable={this.props.navigation.getParam("enable")}
              />
              <Slider
                width={this.state.width}
                handlePress={this.handlePress}
                value={this.state.energy}
                property={"energy"}
                title={"Energy level"}
                handleTap={this.handleTap}
                enable={this.props.navigation.getParam("enable")}
              />
              <Slider
                width={this.state.width}
                handlePress={this.handlePress}
                value={this.state.confidence}
                property={"confidence"}
                title={"Self-Confidence"}
                handleTap={this.handleTap}
                enable={this.props.navigation.getParam("enable")}
              />
            </ScrollView>

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
      </Drawer>
    );
    // }
  }
}

export default ViewMood;
