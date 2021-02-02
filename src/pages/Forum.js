import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { styles, theme } from "../styles";
import { ListItem, Icon, Input, Button, Overlay } from "react-native-elements";
import Header from "../components/Header";
//import { http } from "../util/http";
import Snack from "../components/Snackbar";
import firebase from "../services/firebase";
import session from "../data/session";
import BottomBar from "../components/BottomBar";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import CommentBadge from "../components/CommentBadge";
import Moment from "react-moment";
import Snackbar from "../components/Snackbar";
import MaskedView from "@react-native-community/masked-view";
import List from "../components/List";
import Drawer from "react-native-drawer";
import { timeFormat } from "../util/timeFormat";
import NetworkUtils from "../components/NetworkUtil";
import NetworkUtilModal from "../components/NetworkUtilModal";
let date = new Date();
let date2 = new Date();
date2.setDate(date2.getDate() - 1);
let posts = [
  {
    id: 1,
    author: "Jon snow",
    description: "I know nothing seriously.",
    time: "4:50 pm",
    comments: 150,
    authorPhoto:
      "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg",
    date: date
  },
  {
    id: 2,
    author: "!Jon snow",
    description: "I know everything seriously.",
    time: "10:50 pm",
    comments: 427,
    authorPhoto:
      "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg",
    date: date2
  }
];
let currentDate = null;

export default class Forum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: false,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      forumPostModalVisible: false
    };
  }

  async componentDidMount() {
    // if (!(await NetworkUtils.isNetworkAvailable())) {
    //   this.setState({ NetworkUtilModal: true });
    //   return;
    // }
    console.log("forum", this.props.navigation.getParam("user"));
    await this.getPosts(1);

    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  getPosts = async page => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    this.setState({ loading: true });
    const user = await session.getUser();
    let posts = [];
    await firebase
      .database()
      .ref("posts")
      .on("value", snap => {
        if (snap.exists()) {
          posts = Object.values(snap.val());
          posts.reverse();
          this.setState({ posts, loading: false });
        }
      });
    posts = [];
    this.state.posts.forEach(post =>
      post.pin ? posts.unshift(post) : posts.push(post)
    );
    this.setState({ posts });
  };
  submitPost = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    if (!this.state.forumPost || this.state.forumPost === "") {
      Snackbar("error", "Please write something to post");
      return;
    }
    this.setState({ forumPostModalVisible: false });
    const ref = await firebase
      .database()
      .ref("posts")
      .push();
    //   key
    // alert(key);
    await ref.set({
      id: ref.key,
      author: this.state.user,
      description: this.state.forumPost,
      time: moment().format("HH:mm"),
      timestamp: moment().toString(),
      comments: [],
      authorPhoto:
        this.state.user?.photo ||
        "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg",
      date: moment().format("YYYY-MM-DD")
    });
    Snackbar("success", "Forum posted successfully");
  };

  loadMore = async () => {
    const user = await session.getUser();
  };

  //   logout = () => {
  //     session.loggingOut();
  //     this.props.navigation.navigate('Login', {update: true});
  //   };
  renderDate = (events, index) => {
    if (index !== 0) {
      return events[index].date === events[index - 1].date ? null : true;
    }
    return true;
  };
  changePostPinStatus = async item => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    // alert(this.state.user?.role);
    const user = await session.getUser();
    if (user?.role === "ADMIN") {
      // alert('j')
      await firebase
        .database()
        .ref(`posts/${item.id}/pin`)
        .set(!item.pin);
      this.setState({});
      await this.getPosts();
    }
  };

  logout = () => {
    session.loggingOut();
    session.isAuthenticated(false);
    this.props.navigation.navigate("Login", { update: true });
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
            title={"View post"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              paddingTop: theme.size(0),
              height: theme.size(56)
            }}
            iconRight={"plus-circle-outline"}
            iconRightType="material-community"
            logout={() => this.setState({ forumPostModalVisible: true })}
          />
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "space-between"
            }}
          >
            {/* <Text>j</Text> */}
            {/* {// this.state.posts && this.state.posts.length > 0 */}
            {!this.state.loading ? (
              <>
                {posts && posts.length > 0 ? (
                  <FlatList
                    // inverted
                    //    keyboardShouldPersistTaps
                    data={this.state.posts}
                    renderItem={({ item, index }) => {
                      return (
                        <>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                              backgroundColor: "#f6f6f6"
                            }}
                          >
                            {this.renderDate(this.state.posts, index) && (
                              <Moment
                                style={[
                                  {
                                    paddingVertical: theme.size(20),
                                    color: theme.colorGrey,
                                    marginLeft: theme.size(15)
                                  }
                                ]}
                                format="DD-MM-YYYY"
                                element={Text}
                              >
                                {item.date}
                              </Moment>
                            )}
                          </View>
                          {item.pin ? (
                            <Icon
                              style={{
                                position: "absolute",
                                right: 5,
                                top: 15,
                                marginTop: 5
                              }}
                              name="pin"
                              type="entypo"
                              size={15}
                              color={theme.colorGrey}
                              ViewComponent={LinearGradient}
                              underlayColor="transparent"
                              onPress={() => {}}
                            />
                          ) : null}
                          <ListItem
                            style={[
                              {
                                borderLeftColor: theme.colorGrey,
                                borderLeftWidth: theme.size(5)
                              },
                              item.pin
                                ? { borderLeftColor: theme.colorPrimary }
                                : { borderLeftColor: theme.colorGrey }
                            ]}
                            key={item.id}
                            leftAvatar={{
                              source: { uri: item.authorPhoto },
                              size: 30
                            }}
                            title={
                              <View style={{ flexDirection: "row" }}>
                                <Text style={{ ...styles.title }}>
                                  {item.author.name}{" "}
                                </Text>
                                <Text
                                  style={{
                                    ...styles.subtitle,
                                    color: theme.colorGrey,
                                    fontSize: 10,
                                    alignSelf: "center",
                                    marginBottom: -3
                                  }}
                                >
                                  •{"  "}
                                  {moment().diff(
                                    moment(item.timestamp),
                                    "days"
                                  ) !== 0
                                    ? moment().diff(
                                        moment(item.timestamp),
                                        "days"
                                      ) + " days ago"
                                    : moment(item.timestamp).fromNow()}
                                </Text>
                              </View>
                            }
                            titleStyle={styles.title}
                            bottomDivider
                            subtitle={
                              <Text
                                style={{ ...styles.subtitle }}
                                numberOfLines={1}
                              >
                                {item.description}
                              </Text>
                            }
                            subtitleStyle={styles.subtitle}
                            rightElement={
                              <MaskedView
                                style={{ width: 40 }}
                                maskElement={
                                  <View
                                    style={{
                                      backgroundColor: "transparent",
                                      justifyContent: "flex-start",
                                      alignItems: "center"
                                    }}
                                  >
                                    <Icon
                                      size={15}
                                      name={"comment"}
                                      type={"material-community"}
                                      underlayColor="transparent"
                                    />
                                    <Text
                                      style={{
                                        ...styles.subtitle,
                                        fontFamily: theme.font.medium,
                                        marginTop: -5
                                      }}
                                    >
                                      {item.comments?.length || 0}
                                    </Text>
                                  </View>
                                }
                              >
                                <LinearGradient
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  colors={[
                                    theme.colorGradientStart,
                                    theme.colorGradientEnd
                                  ]}
                                  style={{ flex: 1 }}
                                />
                              </MaskedView>
                            }
                            onPress={() => {
                              console.log(this.state.posts[index]);
                              this.props.navigation.navigate("ForumPost", {
                                user: this.state.user,
                                post: this.state.posts[index]
                              });
                            }}
                            onLongPress={() => {
                              this.changePostPinStatus(item);
                            }}
                          >
                            {true ? (
                              <Icon
                                style={{
                                  position: "absolute",
                                  right: 5,
                                  top: 15,
                                  marginTop: 5
                                }}
                                underlayColor="transparent"
                                name="pin"
                                type="entypo"
                                size={15}
                                color={theme.colorGrey}
                                ViewComponent={LinearGradient}
                                onPress={() => {}}
                              />
                            ) : null}
                          </ListItem>
                        </>
                      );
                    }}
                    // onEndReached={this.loadMore}
                    // onEndReachedThreshold={500}
                    keyExtractor={item => item.id}
                  />
                ) : (
                  <Text style={[styles.h2, { textAlign: "center" }]}>
                    No Posts Found
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.fillSpace}>
                <ActivityIndicator
                  color={theme.colorGrey}
                  style={{ alignSelf: "center", justifyContent: "center" }}
                />
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
            <Overlay
              isVisible={this.state.forumPostModalVisible}
              onBackdropPress={() => {
                this.setState({ forumPostModalVisible: false });
              }}
              overlayStyle={{ padding: 0, marginVertical: 20 }}
              borderRadius={20}
              height="auto"
            >
              <ScrollView style={{ borderRadius: 20 }}>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: theme.size(10),
                    marginBottom: 30
                  }}
                >
                  <Icon
                    name="close"
                    type="material-community"
                    size={30}
                    underlayColor="transparent"
                    containerStyle={{
                      alignSelf: "flex-end",
                      marginRight: 10
                    }}
                    onPress={() => {
                      this.setState({ forumPostModalVisible: false });
                      // props.updateVisible(null, 'remove');
                    }}
                  />

                  <Text
                    style={[
                      styles.h1,
                      {
                        fontSize: 18,
                        fontFamily: "Montserrat-Bold",
                        padding: 0
                      }
                    ]}
                  >
                    Forum Post
                  </Text>

                  <View
                    style={{ marginVertical: theme.size(20), width: "80%" }}
                  >
                    <Input
                      inputContainerStyle={{
                        borderBottomWidth: 0
                      }}
                      multiline={true}
                      placeholder={"Write your post here."}
                      textAlignVertical={"top"}
                      placeholderTextColor={theme.colorGrey}
                      containerStyle={{
                        padding: 10,
                        borderRadius: 20,
                        backgroundColor: "#ddd",
                        fontFamily: "Montserrat-Medium",
                        fontSize: 12,
                        borderWidth: 0,
                        minHeight: 200
                      }}
                      inputStyle={{
                        fontFamily: "Montserrat-Medium",
                        fontSize: 12
                      }}
                      multiLine={true}
                      onChangeText={forumPost =>
                        this.setState({
                          forumPost
                        })
                      }
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "80%"
                    }}
                  >
                    <Button
                      title="Cancel"
                      buttonStyle={{
                        backgroundColor: theme.colorGrey,
                        borderRadius: theme.size(6)
                        //  marginLeftl:10
                      }}
                      titleStyle={{ color: theme.colorAccent }}
                      onPress={() => {
                        // props.updateVisible(null, 'remove');
                        this.setState({ forumPostModalVisible: false });
                      }}
                      containerStyle={{
                        width: "40%",
                        marginVertical: theme.size(10)
                      }}
                      linearGradientProps={null}
                    />

                    <Button
                      title="Done"
                      buttonStyle={{
                        borderRadius: theme.size(6)

                        // marginRight:10,
                      }}
                      titleStyle={{ color: theme.colorAccent }}
                      onPress={async () => {
                        // alert('b');

                        await this.submitPost();
                        // props.removeTherapist();
                        // setApprovedModalVisible(true);
                      }}
                      containerStyle={{
                        width: "40%",
                        marginVertical: theme.size(10)
                      }}
                      ViewComponent={LinearGradient} // Don't forget this!
                    />
                  </View>
                </View>
              </ScrollView>
            </Overlay>
          </View>
        </View>
      </Drawer>
    );
  }
}
