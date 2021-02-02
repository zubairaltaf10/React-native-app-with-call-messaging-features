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
import { styles, theme } from "../../styles";
import {
  Avatar,
  Divider,
  Icon,
  Button,
  AirbnbRating,
  ListItem
} from "react-native-elements";
import Header from "../../components/Header";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
export default class AdminUsers extends Component {
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
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    await firebase
      .database()
      .ref(`users/${id}`)
      .on("value", snapshot => {
        if (snapshot.exists()) {
          this.setState({
            user: {
              ...snapshot.val(),
              id: snapshot.key
            },
            loading: false
          });
        }
      });
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
            //role={this.state.user?.role || "ADMIN"}
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
            <ActivityIndicator />
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
                    width: "80%",
                    marginLeft: "10%",
                    // justifyContent: 'space-evenly',
                    marginTop: theme.size(30)
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
                    <View
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
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      marginLeft: 6
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start"
                        // margin: -5,
                        // marginTop:0
                        // marginLeft: theme.size(-5),
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
                      <Icon
                        name="square-edit-outline"
                        type="material-community"
                        color={theme.colorPrimary}
                        size={20}
                        underlayColor="transparent"
                        style={{ paddingTop: -15, marginLeft: 8 }}
                        containerStyle={{ marginLeft: 8, marginTop: -2 }}
                        onPress={() => {
                          this.props.navigation.navigate(
                            "EditTherapistProfileAdmin",
                            {
                              user: this.state.user,
                              userId: this.state.userId,
                              updateProfile: this.updateProfile
                            }
                          );
                        }}
                      />
                    </View>
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontFamily: theme.font.medium,
                          color: theme.colorGrey,
                          // fontSize: 18,
                          marginLeft: 5,
                          marginTop: -5
                        }
                      ]}
                    >
                      {user.address || "Therapist Address"}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start"
                        // margin: -5,
                        // marginTop:0
                        // marginLeft: theme.size(-5),
                      }}
                    >
                      <Icon
                        name="star"
                        color="#F2BC3B"
                        size={15}
                        underlayColor="transparent"
                      />
                      <Text
                        style={[
                          styles.subtitle,
                          {
                            fontFamily: theme.font.regular,
                            color: theme.colorGrey
                          }
                        ]}
                      >
                        {this.state.user.averageRating?.toFixed(1) || 0} |{" "}
                        {this.state.user.totalRatings || 0} Reviews
                      </Text>
                    </View>
                  </View>
                </View>
                <Divider
                  style={{
                    marginTop: theme.size(20),
                    height: theme.size(1),
                    width: "100%",
                    backgroundColor: theme.colorLightGrey
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
                      styles.title,
                      {
                        color: theme.colorPrimary,
                        fontFamily: theme.font.medium
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
                        fontSize: 12,
                        textAlign: "justify"
                      }
                    ]}
                  >
                    {this.state.user.about}
                  </Text>
                </View>
                <Divider
                  style={{
                    marginTop: theme.size(20),
                    height: theme.size(1),
                    width: "100%",
                    backgroundColor: theme.colorLightGrey
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
                      styles.title,
                      {
                        color: theme.colorPrimary,
                        fontFamily: theme.font.medium
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
                        color: theme.colorMenuHeading
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
                        ...styles.subtitle,
                        color: theme.colorGrey,
                        fontFamily: theme.font.regular
                      }}
                    >
                      {/* {alert(this.state.user.selectedFocus?.join("  ⦿  "))} */}
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
                        color: theme.colorMenuHeading
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
                        ...styles.subtitle,
                        color: theme.colorGrey,
                        fontFamily: theme.font.regular
                      }}
                    >
                      {this.state.user.focus?.join("  ⦿  ")}
                    </Text>
                    {/* {this.state.user?.focus?.map(item => <Badge value={item} />)} */}
                  </View>
                </View>

                <Divider
                  style={{
                    marginTop: theme.size(20),
                    height: theme.size(1),
                    width: "100%",
                    backgroundColor: theme.colorLightGrey
                  }}
                />
                <View
                  style={{
                    height: "100%",
                    marginTop: theme.size(20),
                    width: "100%",
                    flexDirection: "column",
                    marginBottom: theme.size(50)
                  }}
                >
                  <Text
                    style={[
                      { marginLeft: "10%" },
                      styles.title,
                      {
                        color: theme.colorPrimary,
                        fontFamily: theme.font.medium
                      },
                      this.state.user.reviews
                        ? { color: theme.colorPrimary }
                        : {
                            color: theme.colorDarkGrey,
                            textAlign: "center",
                            marginLeft: 0,
                            marginTop: 20
                          }
                    ]}
                  >
                    {this.state.user.reviews
                      ? "Reviews"
                      : "No Reviews Available"}
                  </Text>
                  {this.state.user.reviews && (
                    <>
                      <View
                        style={{
                          paddingHorizontal: "5%",
                          width: "100%",
                          alignItems: "flex-start",
                          marginTop: theme.size(10)
                        }}
                      >
                        {/* {alert(
                        Object.entries(this.state.user.reviews).map(entry => ({
                          ...entry[1],
                          userId: entry[0]
                        }))
                      )} */}
                        <FlatList
                          style={{ width: "100%", flex: 1 }}
                          data={Object.entries(this.state.user.reviews).map(
                            entry => ({ ...entry[1], id: entry[0] })
                          )}
                          renderItem={({ item, index }) => {
                            return (
                              <>
                                <ListItem
                                  containerStyle={{ paddingBottom: 0 }}
                                  style={[
                                    {
                                      // borderBottomWidth: theme.size(1),
                                      //  paddingVertical:-10,
                                      // paddingBottom:-50
                                    },
                                    this.state.selectedCommentIndex === index
                                      ? { borderLeftColor: theme.colorPrimary }
                                      : { borderLeftColor: theme.colorGrey }
                                  ]}
                                  leftAvatar={
                                    <Avatar
                                      rounded
                                      size={40}
                                      source={{
                                        uri: item.user?.photo
                                          ? item.user.photo
                                          : ""
                                      }}
                                    />
                                  }
                                  title={
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: -5
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.subtitle,
                                          {
                                            color: theme.colorGrey,
                                            marginLeft: theme.size(5),
                                            fontFamily: theme.font.medium,
                                            textAlign: "justify",
                                            textAlignVertical: "center"
                                          }
                                        ]}
                                      >
                                        {item.user?.name || "Anonymous"}
                                      </Text>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          justifyContent: "flex-start",
                                          marginLeft: theme.size(-5)
                                        }}
                                      >
                                        <Icon
                                          name="star"
                                          color="#F2BC3B"
                                          size={15}
                                          underlayColor="transparent"
                                        />
                                        <Text
                                          style={[
                                            styles.bodyText,
                                            { color: theme.colorGrey }
                                          ]}
                                        >
                                          {item.rating.toFixed(1) || 0}
                                        </Text>
                                      </View>
                                    </View>
                                  }
                                  subtitle={
                                    <Text
                                      numberOfLines={1}
                                      style={[
                                        styles.subtitle,
                                        {
                                          color: theme.colorGrey,
                                          marginLeft: theme.size(5),

                                          textAlign: "justify"
                                        }
                                      ]}
                                    >
                                      {item.review || "review"}
                                    </Text>
                                  }
                                  titleStyle={{
                                    ...styles.subtitle,
                                    color: theme.colorMenuHeading
                                  }}
                                  onPress={() => {}}
                                  disabled
                                />
                              </>
                            );
                          }}
                          onEndReached={this.loadMore}
                          onEndReachedThreshold={1}
                          keyExtractor={item => item.id}
                        />
                      </View>
                    </>
                  )}
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
