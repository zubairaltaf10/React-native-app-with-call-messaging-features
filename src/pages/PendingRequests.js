import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  ImageBackground
} from "react-native";
import { styles, theme } from "../styles";
import { ListItem, Icon, Button, Divider } from "react-native-elements";
import Header from "../components/Header";
import ImageView from "react-native-image-view";
//import { http } from "../../util/http";
import firebase from "../services/firebase";
import Snack from "../components/Snackbar";
import BottomBar from "../components/BottomBar.js";
import session from "../data/session";
import LinearGradient from "react-native-linear-gradient";
import ProfileOptionsBar from "../components/ProfileOptionsBar";

import * as actions from "../store/actions";
import { connect } from "react-redux";
import Drawer from "react-native-drawer";
import List from "../components/List";
import { addActivity } from "../util/addActivity";
import Snackbar from "../components/Snackbar";
import ConfirmationModal from "../components/ConfirmationModal";
import moment from "moment";
import NetworkUtils from "../components/NetworkUtil";
import NetworkUtilModal from "../components/NetworkUtilModal";
class PendingRequests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      requests: [],
      loading: true,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      modalShow1on1: false,
      modalShowChangeTherapist: false,
      modalShowDonateORBuy: false,
      selectedSession: null
    };
    // this.props.fetchUsers();
  }
  async componentDidMount() {
    const user = await session.getUser();
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    await firebase
      .database()
      .ref("BuySessionRequests")
      .orderByChild("user/id")
      .equalTo(user.id)
      // .orderByChild("status")
      // .equalTo("pending")
      .on("value", snap => {
        if (snap.exists()) {
          // alert(JSON.stringify(snap.val()));
          this.setState({
            requests: [
              ...this.state.requests,
              ...Object.values(snap.val()).map(r => {
                if (r.status === "pending" && r.user.id === user.id) {
                  return {
                    ...r,
                    requestType: "Buy Session Request"
                  };
                }
              })
            ],
            loading: false
          });
        }
      });
    await firebase
      .database()
      .ref("DonateSessionRequests")
      .orderByChild("user/id")
      .equalTo(user.id)
      // .orderByChild("status")
      // .equalTo("pending")
      .on("value", snap => {
        if (snap.exists()) {
          // alert(JSON.stringify(snap.val()));
          this.setState({
            requests: [
              ...this.state.requests,
              ...Object.values(snap.val()).map(r => {
                if (r.status === "pending" && r.user.id === user.id) {
                  return {
                    ...r,
                    requestType: "Donate Session Request"
                  };
                }
              })
            ],
            loading: false
          });
        }
      });
    await firebase
      .database()
      .ref("OneOnOneSessionRequests")
      .orderByChild("user/id")
      .equalTo(user.id)
      // .orderByChild("status")
      // .equalTo("pending")
      .on("value", snap => {
        if (snap.exists()) {
          // alert(JSON.stringify(snap.val()));
          this.setState({
            requests: [
              ...this.state.requests,
              ...Object.values(snap.val()).map(r => {
                if (r.status === "pending" && r.user.id === user.id) {
                  return {
                    ...r,
                    requestType: "1-to-1 Session Request"
                  };
                }
              })
            ],
            loading: false
          });
        }
      });
    await firebase
      .database()
      .ref(`ChangeTherapistRequests/${user.id}`)
      .orderByChild("status")
      .equalTo("pending")
      // .orderByChild("status")
      // .equalTo("pending")
      .on("value", snap => {
        if (snap.exists()) {
          // alert(JSON.stringify(snap.val()));
          this.setState({
            requests: [
              ...this.state.requests,
              ...Object.values(snap.val()).map(r => {
                if (r.status === "pending" && r.user.id === user.id) {
                  return {
                    ...r,
                    requestType: "Change Therapist Request"
                  };
                }
              })
            ],
            loading: false
          });
        }
      });

    this.state.requests.sort(function(a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.date) - new Date(a.date);
    });
    console.log("reques pending", this.state.requests);
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    // this.getRequests();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
    return true;
  };

  componentDidUpdate(prevProps, prevState) {}

  // getRequests = async () => {
  //   // alert('loa')

  //   await this.props.fetchOneOnOneSessionRequests();
  //   const user = await session.getUser();
  //   // alert("la");
  //   let requests = [];
  //   let oneOnOne = await this.props.auth.oneOnOneSessionRequests.filter(
  //     r => r.status === "pending" && r.user.id === user.id
  //   );
  //   oneOnOne = oneOnOne?.map(r => ({
  //     ...r,
  //     requestType: "1-to-1 Session Request"
  //   }));
  //   requests = [...requests, ...oneOnOne];
  //   this.setState({
  //     requests,
  //     loading: false
  //   });

  //   await this.props.fetchDonateSessionRequests();
  //   let donate = await this.props.auth.donateSessionRequests.filter(
  //     r => r.status === "pending" && r.user.id === user.id
  //   );
  //   donate = donate?.map(r => ({
  //     ...r,
  //     requestType: "Donate Session Request"
  //   }));
  //   requests = [...requests, ...donate];
  //   this.setState({
  //     requests,
  //     loading: false
  //   });
  //   await this.props.fetchBuySessionRequests();

  //   let buy = await this.props.auth.buySessionRequests.filter(
  //     r => r.status === "pending" && r.user.id === user.id
  //   );
  //   buy = buy?.map(r => ({
  //     ...r,
  //     requestType: "Buy Session Request"
  //   }));
  //   requests = [...requests, ...buy];
  //   this.setState({
  //     requests,
  //     loading: false
  //   });
  //   await this.props.fetchChangeTherapistRequests();
  //   let changeTherapist = await this.props.auth.changeTherapistRequests.filter(
  //     r => r.status === "pending" && r.user.id === user.id
  //   );
  //   changeTherapist = changeTherapist?.map(r => ({
  //     ...r,
  //     requestType: "Change Therapist Request"
  //   }));
  //   requests = [...requests, ...changeTherapist];
  //   this.setState({
  //     requests,
  //     loading: false
  //   });
  // };

  goBack = () => {
    this.props.navigation.goBack();
    // this.props.navigation.navigate('Dashboard')
  };

  selectItem = index => {
    this.setState({
      requestIndex: index === this.state.requestIndex ? null : index
    });
  };

  // acceptRequest = async () => {
  //   if (!(await NetworkUtils.isNetworkAvailable())) {
  //     return;
  //   }
  //   let request = {
  //     ...this.state.request,
  //     status: "approved"
  //   };
  //   let updates = {};
  //   updates["OneOnOneSessionRequests/" + this.state.request.id] = request;
  //   // alert(JSON.stringify(requests[this.state.requestIndex]));
  //   await firebase
  //     .database()
  //     .ref()
  //     .update(updates)
  //     .then(() => {
  //       // this.setState({ requests });
  //       this.setState({ paymentVerificationModalVisible: false });
  //       addActivity(null, "1on1 Session request has been accepted");
  //       Snackbar("success", "Payment request has been approved");
  //     });
  //   this.getRequests();
  // };
  // rejectRequest = async () => {
  //   if (!(await NetworkUtils.isNetworkAvailable())) {
  //     return;
  //   }
  //   let request = {
  //     ...this.state.request,
  //     status: "rejected"
  //   };
  //   let updates = {};
  //   updates["OneOnOneSessionRequests/" + this.state.request.id] = request;

  //   await firebase
  //     .database()
  //     .ref()
  //     .update(updates)
  //     .then(() => {
  //       // this.setState({ requests });

  //       this.setState({ paymentVerificationModalVisible: false });
  //       addActivity(null, "1on1 Session request has been rejected");
  //       Snackbar("success", "1on1 Session request has been rejected");
  //     });
  //   this.getRequests();
  // };

  filterBySearch = async searchBy => {
    await this.getRequests();
    const requests = await this.state.requests.filter(r =>
      r.user.name.includes(searchBy)
    );
    this.setState({
      requests,
      loading: false
    });
  };
  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };
  renderStatusButttons = item => {
    switch (this.state.filter) {
      case "pending":
        return (
          <TouchableOpacity
            onPress={() => {
              // this.selectItem(index);
              this.setState({
                paymentVerificationModalVisible: true,
                request: item
              });
            }}
            style={[
              {
                height: 25,
                borderWidth: 2,
                borderColor: theme.colorGradientStart,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100
              }
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                {
                  color: theme.colorGradientStart,
                  fontFamily: "Montserrat-Regular",
                  fontSize: 14,
                  alignSelf: "center",
                  // paddingHorizontal: 20,
                  paddingBottom: 4
                }
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
        );
        break;
      case "approved":
        return (
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[theme.colorGradientStart, theme.colorGradientEnd]}
            style={[
              {
                height: 25,

                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100
              }
            ]}
          >
            <TouchableOpacity onPress={() => {}}>
              <Text
                numberOfLines={1}
                style={[
                  {
                    color: "white",
                    fontFamily: "Montserrat-Regular",
                    fontSize: 14,
                    alignSelf: "center",
                    // paddingHorizontal: 20,
                    paddingBottom: 4
                  }
                ]}
              >
                Approved
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        );
        break;
      case "rejected":
        return (
          <TouchableOpacity
            onPress={() => {
              this.setState({ request: item });
              this.setState({ paymentVerificationModalVisible: true });
            }}
            style={[
              {
                height: 25,
                //   borderWidth: 2,

                backgroundColor: "#aaa",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100
              }
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                {
                  color: "white",
                  fontFamily: "Montserrat-Regular",
                  fontSize: 14,
                  alignSelf: "center",
                  // paddingHorizontal: 20,
                  paddingBottom: 4
                }
              ]}
            >
              Rejected
            </Text>
          </TouchableOpacity>
        );
        break;

      default:
        break;
    }
  };
  rightElement = (
    <TouchableOpacity
      disabled
      style={[
        {
          height: 25,
          borderWidth: 2,
          borderColor: theme.colorGradientStart,
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
          width: 100
        }
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          {
            color: theme.colorGradientStart,
            fontFamily: "Montserrat-Regular",
            fontSize: 14,
            alignSelf: "center",
            // paddingHorizontal: 20,
            paddingBottom: 4
          }
        ]}
      >
        Pending
      </Text>
    </TouchableOpacity>
  );

  confirmationModal = item => {
    if (item.requestType == "1-to-1 Session Request") {
      this.setState({ modalShow1on1: true, selectedSession: item });
      console.log(item, "item");
    } else if (item.requestType == "Donate Session Request") {
      this.setState({ modalShowDonateORBuy: true, selectedSession: item });
      console.log(item, "item");
    } else if (item.requestType == "Buy Session Request") {
      this.setState({ modalShowDonateORBuy: true, selectedSession: item });
      console.log(item, "item");
    } else if (item.requestType == "Change Therapist Request") {
      this.setState({ modalShowChangeTherapist: true, selectedSession: item });
      console.log(item, "item");
    }
  };

  renderItem = item => {
    switch (item.requestType) {
      case "1-to-1 Session Request":
        return (
          <ListItem
            style={{
              borderLeftColor: theme.colorGrey,
              borderLeftWidth: theme.size(5)
            }}
            key={item}
            // leftAvatar={{ source: { uri: item.photo } }}
            title={item.requestType}
            subtitle={"Reason: " + item.reason}
            titleStyle={[styles.title]}
            subtitleStyle={[styles.subtitle]}
            rightElement={this.rightElement}
            bottomDivider
            onPress={() => this.confirmationModal(item)}
            // onPress={() => this.selectItem(index)}
          />
        );
        break;
      case "Donate Session Request":
        return (
          <ListItem
            style={{
              borderLeftColor: theme.colorGrey,
              borderLeftWidth: theme.size(5)
            }}
            key={item}
            // leftAvatar={{ source: { uri: item.photo } }}
            title={item.requestType}
            subtitle={item.sessions + " Sessions for " + item.amount + " Rs"}
            titleStyle={[styles.title]}
            subtitleStyle={[styles.subtitle]}
            rightElement={this.rightElement}
            bottomDivider
            onPress={() => this.confirmationModal(item)}
            // onPress={() => this.selectItem(index)}
          />
        );
        break;
      case "Buy Session Request":
        return (
          <ListItem
            style={{
              borderLeftColor: theme.colorGrey,
              borderLeftWidth: theme.size(5)
            }}
            key={item}
            // leftAvatar={{ source: { uri: item.photo } }}
            title={item.requestType}
            subtitle={item.sessions + " Sessions for " + item.amount + " Rs"}
            titleStyle={[styles.title]}
            subtitleStyle={styles.subtitle}
            rightElement={this.rightElement}
            onPress={() => this.confirmationModal(item)}
            // {
            //   <Button
            //     title="Pending"
            //     ViewComponent={LinearGradient}
            //     linearGradientProps={{
            //       colors: [theme.colorAccent, theme.colorAccent],
            //       start: { x: -10, y: 0 },
            //       end: { x: 1, y: 1 }
            //     }}
            //     // disabledStyle={{}}
            //     containerStyle={{
            //       width: 100,
            //       height: 10,
            //       padding: 0,
            //       margin: 0,
            //       backgroundColor: "#ddd"
            //     }}
            //     disabled
            //     // type={'outline'}
            //     buttonStyle={{
            //       width: 100,
            //       height: 25,
            //       padding: 0,
            //       margin: 0,
            //       backgroundColor: "#ddd",
            //       borderWidth: 1,
            //       borderColor: theme.colorGradientEnd
            //     }}
            //     disabledTitleStyle={{
            //       ...styles.subtitle,
            //       color: theme.colorGradientEnd
            //     }}
            //   />
            // }
            bottomDivider
            // onPress={() => this.selectItem(index)}
          />
        );
        break;
      case "Change Therapist Request":
        return (
          <ListItem
            style={{
              borderLeftColor: theme.colorGrey,
              borderLeftWidth: theme.size(5)
            }}
            key={item}
            // leftAvatar={{ source: { uri: item.photo } }}
            title={item.requestType}
            subtitle={"Reason: " + item.reason}
            titleStyle={[styles.title]}
            subtitleStyle={[styles.subtitle]}
            rightElement={this.rightElement}
            bottomDivider
            onPress={() => this.confirmationModal(item)}
            // onPress={() => this.selectItem(index)}
          />
        );
        break;

      default:
        break;
    }
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
        <ConfirmationModal
          visible={this.state.modalShow1on1}
          updateVisible={() => this.setState({ modalShow1on1: false })}
          //   message={'Are you sure you want to'}
          title={this.state.selectedSession?.requestType}
          close={() => this.setState({ modalShow1on1: false })}
          removeTherapist={() => {}}
          data={{
            name: this.state.user.name || "",
            photo: this.state.user.photo || ""
          }}
          // horizontalButtons={true}
          singleButton={true}
        >
          {[
            {
              label: "Date Taken:",
              value:
                moment(this.state.selectedSession?.date).format("DD/MM/YYYY") ||
                "No Date"
            },
            {
              label: "Reason:",
              value: this.state.selectedSession?.reason
            },
            {
              label: "Status:",
              value: this.state.selectedSession?.status
            }
          ].map((item, index) => (
            <>
              {index !== 0 && (
                <Divider
                  style={{ marginVertical: theme.size(10), width: "100%" }}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "center"
                  //   marginLeft: 10,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    // padding: 20,

                    fontFamily: "Montserrat-Bold",
                    fontSize: 12,
                    flex: 1.5
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    // padding: 20,
                    color: "#1D1D26",
                    fontFamily: "Montserrat-Medium",
                    fontSize: 12,
                    flex: 1
                  }}
                >
                  {item.value}
                </Text>
              </View>
            </>
          ))}
        </ConfirmationModal>

        <ConfirmationModal
          visible={this.state.modalShowDonateORBuy}
          updateVisible={() => this.setState({ modalShowDonateORBuy: false })}
          //   message={'Are you sure you want to'}
          title={this.state.selectedSession?.requestType}
          close={() => this.setState({ modalShowDonateORBuy: false })}
          removeTherapist={() => {}}
          data={{
            name: this.state.user.name || "",
            photo: this.state.user.photo || ""
          }}
          // horizontalButtons={true}
          singleButton={true}
        >
          {[
            {
              label: "Date Taken:",
              value:
                moment(this.state.selectedSession?.date).format("DD/MM/YYYY") ||
                "No Date"
            },
            {
              label: "Amount:",
              value: this.state.selectedSession?.amount
            },
            {
              label: "Sessions:",
              value: this.state.selectedSession?.sessions
            },
            {
              label: "Status:",
              value: this.state.selectedSession?.status
            }
          ].map((item, index) => (
            <>
              {index !== 0 && (
                <Divider
                  style={{ marginVertical: theme.size(10), width: "100%" }}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "center"
                  //   marginLeft: 10,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    // padding: 20,

                    fontFamily: "Montserrat-Bold",
                    fontSize: 12,
                    flex: 1.5
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    // padding: 20,
                    color: "#1D1D26",
                    fontFamily: "Montserrat-Medium",
                    fontSize: 12,
                    flex: 1
                  }}
                >
                  {item.value}
                </Text>
              </View>
            </>
          ))}
          <Text
            style={{
              marginTop: 10,
              textAlign: "left",
              marginBottom: 10,
              fontFamily: "Montserrat-Bold",
              fontSize: 12,
              flex: 1.5
            }}
          >
            Receipt
          </Text>
          <ImageBackground
            style={{
              height: 150,
              width: "100%",
              backgroundColor: "#ddd",
              position: "relative"
            }}
            resideMode="contain"
            source={{ uri: this.state.selectedSession?.reciept }}
          />
        </ConfirmationModal>

        <ConfirmationModal
          visible={this.state.modalShowChangeTherapist}
          updateVisible={() =>
            this.setState({ modalShowChangeTherapist: false })
          }
          //   message={'Are you sure you want to'}
          title={this.state.selectedSession?.requestType}
          close={() => this.setState({ modalShowChangeTherapist: false })}
          removeTherapist={() => {}}
          data={{
            name: this.state.user.name || "",
            photo: this.state.user.photo || ""
          }}
          // horizontalButtons={true}
          singleButton={true}
        >
          {[
            {
              label: "Date Taken:",
              value:
                moment(this.state.selectedSession?.date).format("DD/MM/YYYY") ||
                "No Date"
            },
            {
              label: "Reason:",
              value: this.state.selectedSession?.reason
            },
            {
              label: "Status:",
              value: this.state.selectedSession?.status
            }
          ].map((item, index) => (
            <>
              {index !== 0 && (
                <Divider
                  style={{ marginVertical: theme.size(10), width: "100%" }}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "center"
                  //   marginLeft: 10,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    // padding: 20,

                    fontFamily: "Montserrat-Bold",
                    fontSize: 12,
                    flex: 1.5
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    // padding: 20,
                    color: "#1D1D26",
                    fontFamily: "Montserrat-Medium",
                    fontSize: 12,
                    flex: 1
                  }}
                >
                  {item.value}
                </Text>
              </View>
            </>
          ))}
        </ConfirmationModal>
        {this.state.loading ? (
          <View style={[styles.fillSpace, { justifyContent: "space-between" }]}>
            <Header
              title={"Pending Requests"}
              changeDrawer={this.goBack}
              icon={"arrow-back"}
              customStyles={{
                height: (76 * Dimensions.get("window").height) / 896
              }}
              // iconRight={"exit-to-app"}
              // logout={this.logout}
            />
            <ActivityIndicator color={theme.colorGrey} />
            <View
              style={{ flex: 0, width: "100%", justifyContent: "flex-end" }}
            >
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
        ) : (
          <View style={styles.fillSpace}>
            <Header
              title={"Pending Requests"}
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
                width: "100%",
                justifyContent: "space-between",
                backgroundColor: "white"
              }}
            >
              {this.state.requests && this.state.requests?.length > 0 ? (
                <FlatList
                  data={this.state.requests.filter(r => r != null)}
                  renderItem={({ item, index }) => {
                    {
                      return (
                        <View style={{ flexDirection: "column" }}>
                          {/* {alert(JSON.stringify(this.state.requests))} */}
                          {this.renderItem(item)}
                        </View>
                      );
                    }
                  }}
                  onEndReached={this.loadMore}
                  onEndReachedThreshold={500}
                  keyExtractor={item => item?.id}
                />
              ) : (
                <View style={{ ...styles.fillSpace }}>
                  <Text
                    style={[
                      styles.h2,
                      { textAlign: "center", color: theme.colorPrimary }
                    ]}
                  >
                    No Pending Requests
                  </Text>
                </View>
              )}
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
)(PendingRequests);
