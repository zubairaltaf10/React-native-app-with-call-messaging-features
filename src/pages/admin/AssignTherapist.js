import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Button,
  BackHandler,
  FlatList,
  Dimensions
} from "react-native";
import { styles, theme } from "../../styles";
import {
  Overlay,
  SearchBar,
  Badge,
  Icon,
  Avatar,
  Divider,
  ListItem,
  Input
} from "react-native-elements";
import debounce from "lodash/debounce";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import Header from "../../components/Header";
import BottomBar from "../../components/BottomBar";
import LinearGradient from "react-native-linear-gradient";
import session from "../../data/session";
import Snack from "../../components/Snackbar";
import * as actions from "../../store/actions";
import { connect } from "react-redux";
import { toLower } from "lodash";
import Drawer from "react-native-drawer";
import sendMessage from "../../util/sendMessage";
import List from "../../components/List";
import { printNewTherapistMessage } from "../../util/index";
import { notificationManager } from "../../components/notifications";
import NetworkUtils from "../../components/NetworkUtil";
import LoadingModal from "../../components/LoadingModal";
import NetworkUtilModal from "../../components/NetworkUtilModal";
class AssignTherapist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      searchResults: [],
      patientId: props.navigation.getParam("patientId"),
      loading: true,
      page: 1,
      hasMore: false
    };
    // this.searchTherapists = debounce(this.searchTherapists, 500);
  }
  async componentDidMount() {
    const user = await session.getUser();
    this.setState({ user });
    await this.getAllTherapists();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.patientId !== this.props.navigation.getParam("patientId")) {
  //     this.setState({ patientId: this.props.navigation.getParam("patientId") });
  //   }
  // }

  getAllTherapists = async () => {
    const user = await session.getUser();

    let users = this.props.auth.users.filter(
      user =>
        user.role === "THERAPIST" &&
        (user.available === true || user.status === "available")
    );

    this.setState({
      searchResults: users,
      results: users,
      loading: false,
      hasMore: false
    });
  };

  loadMore = async () => {
    if (this.state.hasMore) {
      let page = this.state.page + 1;
      const user = await session.getUser();
    }
  };

  filterBySearch = async searchBy => {
    const user = await session.getUser();
    // await this.fetchAllTherapists()
    let results = this.state.results.filter(item =>
      toLower(JSON.stringify(item)).includes(toLower(searchBy))
    );
    this.setState({
      searchResults: results
    });
  };

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

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  broadcastPushNotifications = (inputValue, user, therapist, type) => {
    console.log("daasdm");
    const channel = user;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }
    const sender = therapist;
    const fromTitle = "Admin";
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != this.state.user.id ||
        participant.jwt != this.state.user?.jwt ||
        participant._id != this.state.user._id
      ) {
        console.log("HEYYY", participant);
        notificationManager.sendPushNotification(
          participant,
          fromTitle,
          message,
          type,
          { fromUser: sender },
          false
        );
      }
    });
  };

  back = () => {
    this.props.navigation.goBack();
    // this.props.navigation.navigate('Dashboard')
  };

  assignTherapist = async therapistId => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    this.setState({ loadingModal: true });
    //Adding patients into therapist profile
    let therapist = null;
    let patient = null;
    patient = await firebase
      .database()
      .ref(`users/${this.state.patientId}`)
      .once("value", snap => {
        if (snap.exists()) {
          patient = snap.val();
          // patient=patient
        }
      });
    // alert(JSON.stringify(this.state.patientId))
    patient = patient.val();

    if (patient?.status === "assigned") {
      Snack("Error", "Client already connected to a therapist");
      return;
    }
    therapist = await firebase
      .database()
      .ref(`users/${therapistId}`)
      .once("value", snap => {
        if (snap.exists()) {
          therapist = snap.val();
          // patient=patient
        }
      });
    therapist = therapist.val();

    let therapistPatients = [];
    if (therapist.patients) {
      therapistPatients = [
        ...therapist.patients,
        {
          id: this.state.patientId,
          photo: patient.photo,
          name: patient.name,
          status: "active"
        }
      ];
    } else {
      therapistPatients = [
        {
          id: this.state.patientId,
          photo: patient.photo,
          name: patient.name,
          status: "active"
        }
      ];
    }
    let patientTherapists = [];
    if (patient.therapists) {
      patientTherapists = [
        ...patient.therapists,
        {
          id: therapistId,
          name: therapist.name,
          photo: therapist.photo,
          status: "active"
        }
      ];
    } else {
      patientTherapists = [
        {
          id: therapistId,
          name: therapist.name,
          photo: therapist.photo,
          status: "active"
        }
      ];
    }

    try {
      await firebase
        .database()
        .ref(`users/${therapistId}/patients`)
        .set(therapistPatients);

      await firebase
        .database()
        .ref(`users/${this.state.patientId}`)
        .set({ ...patient, therapists: patientTherapists, status: "assigned" })
        .then(() => {
          this.setState({ loadingModal: false });

          this.broadcastPushNotifications(
            "A new therapist has been connected with you",
            [patient],
            therapist,
            "PersonalChat"
          );

          const id1 = therapist._id || therapist.jwt;
          const id2 = patient._id || patient.jwt;
          const channel = {
            id: id1 < id2 ? id1 + id2 : id2 + id1,
            participants: [patient]
          };
          sendMessage(
            therapist,
            channel,
            printNewTherapistMessage(therapist.name, patient.name),
            ""
          );

          this.back();
        });

      // Snack("Success", "Client Added Succesfully");
      Snack("success", "Therapist Assigned Succesfully");
    } catch (error) {
      console.log("error", error);
    }
    //this.setState({ isSearchModalOpen: false });
    // const id1 = therapist._id || therapist.jwt;
    // const id2 = patient._id || patient.jwt;
    // const channel = {
    //   id: id1 < id2 ? id1 + id2 : id2 + id1,
    //   participants: [patient]
    // };
    // console.log(channel, "cjannel");
    // this.props.navigation.navigate("PersonalChat", {
    //   channel
    // });

    // console.log(patient, therapist, "theraistchat");

    this.getAllTherapists();
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
        <LoadingModal visible={!!this.state.loadingModal} />
        {this.state.loading ? (
          <View style={styles.fillSpace}>
            <Header
              title={"Loading"}
              changeDrawer={this.back}
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
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  height: "10%",
                  width: "100%",
                  backgroundColor: "#000000"
                }}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                  style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: theme.colorPrimary
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate("Dashboard")}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        height: "100%",
                        width: "100%"
                      }}
                    >
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                          width: "100%"
                        }}
                      >
                        <Icon
                          name="home-outline"
                          color="white"
                          type="material-community"
                          underlayColor="transparent"
                        />
                        <Text
                          style={[
                            styles.subtitle,
                            { color: theme.colorAccent }
                          ]}
                          onPress={() =>
                            this.props.navigation.navigate("Dashboard")
                          }
                        >
                          Home
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Assign therapist"}
              changeDrawer={this.goBack}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />
            {/* <SearchBar
            placeholder={'Search'}
            onChangeText={async query => {
              this.setState({query});
              await this.fetchAllTherapists();
              await this.searchTherapists();
            }}
            onClear={() => this.setState({query: ''})}
            value={this.state.query}
            containerStyle={{
              width: '100%',
              backgroundColor: 'white',
              borderTopWidth: 0,
              borderBottomWidth: 0,
              borderRadius: 0,
              padding: 0,
            }}
            // rightIcon={ <Icon name="star" color="#F2BC3B" size={15} />}
            lightTheme={true}
            showLoading={this.state.loading}
          /> */}
            <Input
              keyboardType={"default"}
              onChangeText={searchBy => this.filterBySearch(searchBy)}
              value={this.state.searchBy}
              placeholder="Search Name, A/D/P"
              placeholderTextColor={"#9BC8FF"}
              autoCapitalize="none"
              inputStyle={{
                marginHorizontal: 10,
                ...styles.subtitle
              }}
              rightIcon={{
                name: "search",
                color: theme.colorPrimary,
                size: 25
              }}
              rightIconContainerStyle={{ marginHorizontal: 10 }}
              inputContainerStyle={{
                borderWidth: 1,
                borderRadius: 5,
                borderColor: "#ddd",
                padding: 0,
                height: 50,

                width: "100%",
                marginVertical: 20,
                backgroundColor: "#fff"
              }}
            />
            <View
              style={{
                flex: 1,
                width: "100%",
                justifyContent: "space-between"
              }}
            >
              <View style={{ flexDirection: "column", width: "100%" }}>
                {this.state.searchResults &&
                this.state.searchResults.length > 0 ? (
                  <FlatList
                    data={this.state.searchResults}
                    renderItem={({ item, index }) => {
                      return (
                        <>
                          <ListItem
                            style={[
                              {
                                borderLeftWidth: theme.size(5)
                              },
                              this.state.selectedCommentIndex === index
                                ? { borderLeftColor: theme.colorPrimary }
                                : { borderLeftColor: theme.colorGrey }
                            ]}
                            leftAvatar={
                              <View
                                style={{
                                  // borderWidth: 1,
                                  borderRadius: 100,
                                  // borderColor: theme.colorGrey,
                                  // padding: 5,
                                  width: 50,
                                  height: 50,
                                  justifyContent: "center",
                                  alignItems: "center"
                                }}
                              >
                                <Avatar
                                  rounded
                                  size={40}
                                  source={{ uri: item.photo ? item.photo : "" }}
                                />
                                <View
                                  style={[
                                    {
                                      width: 10,
                                      height: 10,
                                      borderRadius: 100,
                                      backgroundColor: theme.colorGrey,
                                      position: "absolute",
                                      bottom: 10,
                                      right: 5
                                    },
                                    item?.available
                                      ? { backgroundColor: "#01E501" }
                                      : null
                                  ]}
                                />
                              </View>
                            }
                            title={
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <Text
                                  style={[
                                    styles.title,
                                    {
                                      // color: theme.colorGrey,
                                      marginLeft: theme.size(5),
                                      fontFamily: theme.font.medium,
                                      textAlign: "justify",
                                      textAlignVertical: "center"
                                    }
                                  ]}
                                >
                                  {item.name}
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
                                    {item.averageRating || "0"}
                                  </Text>
                                </View>
                              </View>
                            }
                            subtitle={
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                {/* <Text
                                  style={[
                                    styles.subtitle,
                                    {
                                      color: theme.colorGrey,
                                      marginLeft: theme.size(5),

                                      textAlign: 'justify',
                                    },
                                  ]}>
                                 jhbhj
                                </Text> */}
                                <View>
                                  <Text
                                    style={[
                                      styles.subtitle,
                                      {
                                        color: theme.colorGrey,
                                        marginLeft: theme.size(5)
                                      }
                                    ]}
                                  >
                                    {item.doctorType}
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
                                      name="map-marker-outline"
                                      type="material-community"
                                      size={15}
                                      color={theme.colorGrey}
                                      underlayColor="transparent"
                                    />
                                    <Text
                                      style={[
                                        styles.subtitle,
                                        {
                                          color: theme.colorGrey
                                          // marginTop: theme.size(5),
                                        }
                                      ]}
                                    >
                                      {item.address}
                                    </Text>
                                  </View>
                                </View>
                                <TouchableOpacity
                                  style={{
                                    width: "50%",
                                    marginTop: theme.size(5),
                                    alignItems: "flex-end"
                                  }}
                                  onPress={() => this.assignTherapist(item._id)}
                                >
                                  <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={[
                                      theme.colorGradientStart,
                                      theme.colorGradientEnd
                                    ]}
                                    style={{
                                      // width: '70%',
                                      paddingHorizontal: 20,
                                      paddingVertical: 5,
                                      backgroundColor: theme.colorPrimary,
                                      borderRadius: 5
                                    }}
                                  >
                                    <Text
                                      style={[
                                        styles.subtitle,
                                        { color: "white", textAlign: "center" }
                                      ]}
                                    >
                                      Assign
                                    </Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              </View>
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
                ) : (
                  <Text
                    style={[
                      styles.h2,
                      { textAlign: "center", marginTop: theme.size(10) }
                    ]}
                  >
                    No Therapists Found
                  </Text>
                )}
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
)(AssignTherapist);
