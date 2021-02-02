import React, { Component, useReducer } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { styles, theme } from "../../styles";
import { Avatar, Divider, Icon, Button } from "react-native-elements";
import Header from "../../components/Header";
//import { http } from '../../util/http';
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import Badge from "../../components/Badge";
import * as actions from "../../store/actions";
import { connect } from "react-redux";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
class TherapistProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.navigation.getParam("userId"),
      user: null,
      loading: true,
      loggedinUser: props.navigation.getParam("user")
    };
  }

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    await this.getUser(this.props.navigation.getParam("userId"));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  getUser = async id => {
    const user = this.props.auth.users.filter(
      user => user?._id === id || user.id === id
    )[0];
    this.setState({ user, loading: false });
    // http.get(`/admin/therapists/${id}`, { headers: { 'Authorization': `Bearer ${this.state.loggedinUser.jwt}` } })
    //     .then(resp => {
    //         this.setState({ user: resp.data.data, loading: false })
    //     })
    //     .catch(err => {
    //         if (err.response) {
    //             Snack("error", err.response.data.error)
    //         }
    //         else {
    //             Snack("error", "Unknown error occured, please contact an Admin");
    //         }
    //     })
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
      this.getUser(this.props.navigation.getParam("userId"));
    }
  }

  goBack = () => {
    this.props.navigation.goBack();
  };

  updateProfile = (
    services,
    focus,
    name,
    about,
    address,
    phone,
    available,
    doctorType,
    avatarSource
  ) => {
    let user = {
      services,
      focus,
      name,
      about,
      address,
      phone,
      available,
      doctorType,
      photo: avatarSource
    };
    this.setState({
      user: user
    });
  };

  render() {
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
        {this.state.loading ? (
          <View style={styles.fillSpace}>
            <ActivityIndicator
              style={{ width: "100%", flex: 1, height: "100%" }}
              size={"large"}
              color={theme.colorGrey}
            />
          </View>
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Therapist profile"}
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
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginTop: theme.size(30)
                  }}
                >
                  <View
                    style={{
                      borderWidth: 1,
                      borderRadius: 100,
                      borderColor: theme.colorGrey,
                      padding: 5,
                      width: 110,
                      height: 110,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Avatar
                      rounded
                      size={100}
                      source={{ uri: user?.photo ? user.photo : "" }}
                    />
                    <View
                      style={[
                        {
                          width: 20,
                          height: 20,
                          borderRadius: 100,
                          backgroundColor: theme.colorGrey,
                          position: "absolute",
                          bottom: 5,
                          right: 5
                        },
                        this.state.user?.available
                          ? { backgroundColor: "#01E501" }
                          : null
                      ]}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <Text
                      style={[
                        styles.h1,
                        {
                          fontFamily: theme.font.regular,
                          fontSize: 18,
                          marginLeft: 5
                        }
                      ]}
                    >
                      {user.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        // marginLeft: theme.size(-5),
                        margin: -5
                      }}
                    >
                      <Icon
                        name="map-marker-outline"
                        type="material-community"
                        size={20}
                        color={theme.colorGrey}
                        underlayColor="transparent"
                      />
                      <Text
                        style={[
                          styles.h2,
                          { color: theme.colorGrey, fontSize: 14, marginTop: 3 }
                        ]}
                      >
                        {this.state.user?.address || "HC"}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        margin: -5
                        // marginLeft: theme.size(-5),
                      }}
                    >
                      <Icon
                        name="star"
                        color="#F2BC3B"
                        underlayColor="transparent"
                      />

                      <Text
                        style={[
                          styles.subtitle,
                          { color: theme.colorGrey, marginTop: 3, fontSize: 14 }
                        ]}
                      >
                        {this.state.user.averageRating?.toFixed(1) || 45} |{" "}
                        {this.state.user.totalRatings || 89} reviews
                      </Text>
                    </View>
                  </View>
                </View>
                <Divider
                  style={{
                    marginTop: theme.size(20),
                    height: theme.size(1),
                    width: "100%"
                  }}
                />
                <View
                  style={{
                    marginTop: theme.size(20),
                    marginLeft: "10%",
                    width: "80%",
                    flexDirection: "column"
                  }}
                >
                  <Text
                    style={[
                      styles.h2,
                      {
                        color: theme.colorPrimary,
                        fontFamily: theme.font.medium,
                        fontSize: 16
                      }
                    ]}
                  >
                    About
                  </Text>
                  <Text
                    style={[
                      styles.bodyText,

                      {
                        color: theme.colorGrey,
                        marginLeft: theme.size(5),
                        fontFamily: theme.font.regular,
                        fontSize: 14
                      }
                    ]}
                  >
                    {this.state.user.about}Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor
                    incididunt ut labore dolor sit amet, consectetur, adipisci
                    velit, sam quaerat voluptatem.
                  </Text>
                </View>
                <Divider
                  style={{
                    marginTop: theme.size(20),
                    height: theme.size(1),
                    width: "100%"
                  }}
                />
                <View
                  style={{
                    marginTop: theme.size(20),
                    marginLeft: "10%",
                    width: "90%",
                    flexDirection: "column"
                  }}
                >
                  <Text
                    style={[
                      styles.subtitle,
                      {
                        color: theme.colorPrimary,
                        fontFamily: theme.font.medium,
                        fontSize: 16
                      }
                    ]}
                  >
                    Information
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      {
                        marginLeft: theme.size(20),
                        marginTop: theme.size(10),
                        color: theme.colorMenuHeading,
                        fontSize: 14
                      }
                    ]}
                  >
                    Services:
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginLeft: theme.size(20),
                      // marginLeft: '10%',
                      paddingRight: 10
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colorGrey,
                        fontFamily: theme.font.regular
                      }}
                    >
                      {this.state.user.services?.join("  ⦿  ")}
                    </Text>
                    {/* {this.state.user.services?.map(item => (
                    <Badge value={item} />
                  ))} */}
                  </View>

                  <Text
                    style={[
                      styles.subtitle,
                      {
                        marginLeft: theme.size(20),
                        marginTop: theme.size(10),
                        color: theme.colorMenuHeading,
                        fontSize: 14
                      }
                    ]}
                  >
                    Focus:
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginLeft: theme.size(20),
                      paddingRight: 10
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colorGrey,
                        fontFamily: theme.font.regular
                      }}
                    >
                      {this.state.user.focus?.join("  ⦿  ")}
                    </Text>
                    {/* {this.state.user?.focus?.map(item => <Badge value={item} />)} */}
                  </View>
                </View>
                {/* <Divider
                style={{
                  marginTop: theme.size(100),
                  height: theme.size(1),
                  width: '100%',
                }}
              />
              <View style={{ height: '15%', marginTop: theme.size(20), width: '100%', flexDirection: 'column' }}>
                                <Text style={[styles.h1, { color: theme.colorPrimary, marginLeft: "10%" }]}>
                                    Availability
                                </Text>
                                <View style={{ height: '100%', marginTop: theme.size(20), width: '100%', flexDirection: 'row' }}>
                                    <View style={{ backgroundColor: "white", width: '34%', borderRightColor: theme.colorGrey, borderRightWidth: theme.size(0.5), justifyContent: "center", alignItems: "center" }}>
                                        <Text style={[styles.h2, { color: theme.colorTextDark, fontWeight: "bold" }]}>Friday</Text>
                                        <Text style={[styles.h2, { color: theme.colorTextDark, fontWeight: "bold" }]}>7PM - 8PM</Text>
                                    </View>
                                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={[theme.colorGradientStart, theme.colorGradientEnd]} style={{ height: '100%', width: '33%', backgroundColor: theme.colorPrimary }} >
                                        <View style={{ width: '100%', height: '100%', justifyContent: "center", alignItems: "center" }}>
                                            <Text style={[styles.h2, { color: theme.colorAccent, fontWeight: "bold" }]}>Saturday</Text>
                                            <Text style={[styles.h2, { color: theme.colorAccent, fontWeight: "bold" }]}>8PM - 9PM</Text>
                                        </View>
                                    </LinearGradient>
                                    <View style={{ backgroundColor: "white", width: '33%', borderRightColor: theme.colorGrey, borderRightWidth: theme.size(0.5), justifyContent: "center", alignItems: "center" }}>
                                        <Text style={[styles.h2, { color: theme.colorTextDark, fontWeight: "bold" }]}>Sunday</Text>
                                        <Text style={[styles.h2, { color: theme.colorTextDark, fontWeight: "bold" }]}>8PM - 9PM</Text>
                                    </View>
                                </View>
                            </View> */}
                <Divider
                  style={{
                    marginTop: theme.size(30),
                    height: theme.size(1),
                    width: "100%"
                  }}
                />
                <View
                  style={{
                    marginTop: theme.size(50),
                    // marginLeft: '10%',
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Button
                      icon={{
                        name: "pencil-outline",
                        type: "material-community",
                        size: 15,
                        color: "white"
                      }}
                      title="Edit profile"
                      iconRight={true}
                      iconContainerStyle={{
                        alignSelf: "flex-end",
                        marginLefT: 40
                      }}
                      onPress={() =>
                        this.props.navigation.navigate(
                          "EditTherapistProfileAdmin",
                          {
                            user: this.state.user,
                            back: "TherapistProfileAdmin",
                            updateProfile: this.updateProfile,
                            userId: this.state.loggedinUser?.jwt
                          }
                        )
                      }
                      buttonStyle={{
                        borderRadius: 5,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      containerStyle={{
                        marginVertical: theme.size(10),
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      ViewComponent={LinearGradient}
                    />
                  </View>
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
)(TherapistProfile);
