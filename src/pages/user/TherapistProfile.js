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
import {
  Avatar,
  Divider,
  Icon,
  Button,
  AirbnbRating
} from "react-native-elements";
import Header from "../../components/Header";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Snack from "../../components/Snackbar";
import BottomBar from "../../components/BottomBar";
import session from "../../data/session";
import LinearGradient from "react-native-linear-gradient";
import Input from "../../components/Input";

import Badge from "../../components/Badge";
import * as actions from "../../store/actions";
import { connect } from "react-redux";
import Drawer from "react-native-drawer";
import List from "../../components/List";
import NetworkUtils from "../../components/NetworkUtil";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class TherapistProfileUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      review: "",
      rating: 3,
      buttonLoading: false,
      reviewGiven: false
    };
  }

  getUser = async () => {
    const user = await session.getUser();
    let patient = null;
    await firebase
      .database()
      .ref(`users/${user.id}`)
      .on("value", snap => {
        if (snap.exists()) {
          patient = { ...snap.val() };
        }
      });
    // alert(JSON.stringify(patient));
    patient = Array.isArray(patient) ? patient[0] : patient;

    let therapistIndexInFirebase = null;
    let therapist = null;
    let reviewGiven = false;
    let review = null;

    patient.therapists?.forEach((t, index) => {
      if (t.status === "active") {
        therapist = t;
        therapistIndexInFirebase = index;
        return true;
      } else {
        return false;
      }
    });

    if (therapist) {
      therapist = Array.isArray(therapist) ? therapist[0] : therapist;
      await firebase
        .database()
        .ref(`users/${therapist.id}`)
        .on("value", snap => {
          if (snap.exists()) {
            therapist = { ...therapist, ...snap.val() };
          }
        });
      // alert(JSON.stringify(therapist));

      if (therapist?.status === "available" || therapist?.available === true) {
        reviewGiven = therapist.reviewGiven;
        // therapist = this.props.auth.users.filter(
        //   user => user._id === therapist.id
        // );
        // therapist = Array.isArray(therapist) ? therapist[0] : therapist;
        review = !therapist.reviewGiven
          ? null
          : therapist?.reviews[patient._id];
        // alert(JSON.stringify(therapist));
        this.setState({
          user: therapist,
          therapistIndexInFirebase,
          loading: false,
          reviewGiven: reviewGiven ? true : false,
          rating: review?.rating || 5,
          review: review?.review || ""
        });
      }
    }
    this.setState({
      loading: false
    });

    this.updateAverageRating();
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  async componentDidMount() {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    await this.getUser();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };
  updateAverageRating = () => {
    let averageRating = 0,
      totalRatings = 0;
    if (this.state?.user?.id) {
      firebase
        .database()
        .ref(`users/${this.state.user?._id}/reviews`)
        .on("value", snap => {
          if (snap.exists()) {
            let average = array => array.reduce((a, b) => a + b) / array.length;
            let ratings = [];
            Object.entries(snap.val()).forEach(val =>
              ratings.push(val[1].rating)
            );

            let ref = firebase.database().ref(`users/${this.state.user?._id}`);
            ref.child("averageRating").set(average(ratings));
            ref.child("totalRatings").set(ratings?.length);
          }
          //   this.setState()
        });
    }
  };
  submitReview = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    if (this.state.review?.length === 0) {
      Snack("error", "Review cant be empty");
    } else {
      const user = await session.getUser();

      const { rating, review } = this.state;
      let therapistId = this.state.user._id;
      // alert(JSON.stringify(this.state.user));
      this.setState({ buttonLoading: true });
      // alert();
      try {
        await firebase
          .database()
          .ref(`users/${this.state.user._id}/reviews/${user.jwt}`)
          .set({
            rating,
            review,
            date: Date(),
            user: { photo: user.photo, name: user.name }
          })
          .then(res => {});
        await firebase
          .database()
          .ref(
            `users/${user.jwt}/therapists/${
              this.state.therapistIndexInFirebase
            }/reviewGiven`
          )
          .set(true);
        this.setState({
          buttonLoading: false,
          reviewGiven: true
        });
        this.updateAverageRating();
        Snack("success", "Review Submitted Successfully");
      } catch (err) {
        this.setState({ buttonLoading: false });
        if (err.message) {
          Snack("error", err.message);
          return false;
        } else {
          Snack("error", "Unknown error occured, please contact an Admin");
          return false;
        }
      }
    }
  };

  goToChat = async () => {
    const user = await session.getUser();
    this.props.navigation.navigate("UserChat", { user: user });
  };

  render() {
    // this.updateAverageRating();

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
          {!this.state.loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              {user ? (
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
                      height: "15%",
                      marginTop: theme.size(20),
                      width: "100%",
                      flexDirection: "column",
                      marginBottom: theme.size(50)
                    }}
                  >
                    {this.state.reviewGiven ? (
                      <>
                        <View
                          style={{
                            marginLeft: "10%",
                            alignItems: "flex-start",
                            marginTop: theme.size(20)
                          }}
                        >
                          <AirbnbRating
                            count={5}
                            isDisabled={this.state.reviewGiven}
                            defaultRating={this.state.rating}
                            size={25}
                            showRating={false}
                            readOnly={true}
                          />
                        </View>
                        <View
                          style={{
                            marginLeft: "10%",
                            width: "80%",
                            alignItems: "flex-start",
                            marginBottom: theme.size(10)
                          }}
                        >
                          <Input
                            placeholder={this.state.review}
                            onChange={this.onChange}
                            inputStyle={{
                              ...styles.subtitle,
                              color: theme.colorGrey,
                              fontFamily: theme.font.medium
                            }}
                            propertyName={"review"}
                            multiline={true}
                            numberOfLines={5}
                            value={this.state.review}
                            editable={false}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.bodyText, { marginLeft: "10%" }]}>
                          Review your therapist/counsellor
                        </Text>
                        <View
                          style={{
                            marginLeft: "10%",
                            alignItems: "flex-start",
                            marginTop: theme.size(20)
                          }}
                        >
                          <AirbnbRating
                            count={5}
                            isDisabled={this.state.reviewGiven}
                            defaultRating={this.state.rating}
                            size={25}
                            showRating={false}
                            onFinishRating={rating => this.setState({ rating })}
                          />
                        </View>
                        <View
                          style={{
                            marginLeft: "10%",
                            width: "80%",
                            alignItems: "flex-start",
                            marginBottom: theme.size(10),
                            flexDirection: "row"
                          }}
                        >
                          <Input
                            placeholder={"Write your review here..."}
                            inputStyle={{
                              ...styles.subtitle
                            }}
                            onChange={this.onChange}
                            propertyName={"review"}
                            multiline={true}
                            numberOfLines={5}
                            value={this.state.review}
                            maxLength={1000}
                          />
                        </View>
                        <Text
                          style={{
                            textAlign: "right",
                            ...styles.subtitle,
                            marginRight: 50
                          }}
                        >
                          {this.state.review.length + 0}/1000 characters
                        </Text>
                        <View
                          style={{
                            marginLeft: "10%",
                            width: "80%",
                            alignItems: "flex-start"
                          }}
                        >
                          <Button
                            title="Add review +"
                            onPress={() => this.submitReview()}
                            ViewComponent={LinearGradient}
                            containerStyle={{ width: "100%" }}
                            loading={this.state.buttonLoading}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </ScrollView>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    width: "100%",
                    alignItems: "center"
                  }}
                >
                  <Text style={[styles.h2, { color: theme.colorPrimary }]}>
                    No therapist assigned to you currently
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.fillSpace}>
              <ActivityIndicator color="#ddd" />
            </View>
          )}
          <BottomBar
            options={[
              {
                title: "Chat",
                icon: {
                  name: "forum-outline",
                  color: "white",
                  type: "material-community"
                },
                onPress: () => this.goToChat()
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

    //  else {
    //   return (
    //     <View style={styles.fillSpace}>
    //       <Header
    //         title={"Therapist Profile"}
    //         changeDrawer={this.goBack}
    //         icon={"arrow-back"}
    //         customStyles={{
    //           height: (76 * Dimensions.get("window").height) / 896
    //         }}
    //         iconRight={"exit-to-app"}
    //         logout={this.logout}
    //       />
    //       <View
    //         style={{
    //           flex: 1,
    //           justifyContent: "center",
    //           width: "100%",
    //           alignItems: "center"
    //         }}
    //       >
    //         <Text style={[styles.h2, { color: theme.colorPrimary }]}>
    //           No therapist assigned to you currently
    //         </Text>
    //       </View>

    //       <BottomBar
    //         options={[
    //           {
    //             title: "Chat",
    //             icon: {
    //               name: "forum-outline",
    //               color: "white",
    //               type: "material-community"
    //             },
    //             onPress: () => this.goToChat()
    //           },
    //           {
    //             title: "Home",
    //             icon: {
    //               name: "home-outline",
    //               color: "white",
    //               type: "material-community"
    //             },
    //             onPress: () => this.props.navigation.navigate("Dashboard")
    //           }
    //         ]}
    //       />
    //     </View>
    //   );
    // }
  }
}
const mapToStateProps = state => {
  return { auth: state.auth };
};
export default connect(
  mapToStateProps,
  actions
)(TherapistProfileUser);
