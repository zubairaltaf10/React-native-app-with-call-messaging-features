import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { styles, theme } from "../styles";
import {
  ListItem,
  Icon,
  Button,
  Overlay,
  Divider,
  Avatar
} from "react-native-elements";
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
import Input from "../components/Input";
import Drawer from "react-native-drawer";
import List from "../components/List";
import NetworkUtils from "../components/NetworkUtil";
import { notificationManager } from "../components/notifications";
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

export default class ForumPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: false,
      page: 1,
      hasMore: false,
      user: props.navigation.getParam("user"),
      post: props.navigation.getParam("post"),
      forumPostModalVisible: false,
      newComment: "",
      selectedCommentIndex: -1
    };
    // this.getPosts(1);
  }

  async componentDidMount() {
    console.log("forumPost", this.props.navigation.getParam("post"));
    firebase
      .database()
      .ref("posts/" + this.state.post.id)
      .on("value", snap => {
        if (snap.exists()) {
          this.setState({ post: snap.val() });
        }
      });

    this.setState({ user: await session.getUser() });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.goBack();
  };

  goBack = () => {
    this.props.navigation.goBack(null);
  };

  submitComment = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    //   return
    if (!this.state.newComment || this.state.newComment === "") {
      Snackbar("error", "Please write some comment");
      return;
    }
    let comments = this.state.post.comments;

    const newComment = {
      name: this.state.user?.name,
      photo:
        this.state.user?.photo ||
        "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg",
      authorId: this.state.user?.jwt,
      description: this.state.newComment,
      time: moment().format("HH:mm"),
      date: moment().format("YYYY-MM-DD"),
      hide: false
    };
    // alert(this.state.selectedCommentIndex);
    if (comments?.length) {
      if (this.state.selectedCommentIndex === -1) {
        comments.push(newComment);
      } else {
        // comments.insert(this.state.selectedCommentIndex , newComment);
        comments.splice(this.state.selectedCommentIndex + 1, 0, newComment);
        console.log("comments", comments);
      }
    } else {
      comments = [];
      comments.push(newComment);
    }
    await firebase
      .database()
      .ref(`posts/${this.state.post.id}/comments`)
      .set(comments)
      .then(res => {
        this.setState({ selectedCommentIndex: -1, newComment: "", comments });
        Snackbar("success", "Comment posted successfully");

        this.broadcastPushNotifications(
          "User has replied to your post",
          [this.state.post.author],
          "disable"
        );
      });
    //   key
    // alert(key);
  };

  broadcastPushNotifications = (inputValue, admin, type) => {
    console.log("daasdm");
    const channel = admin;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }

    console.log(this.state.user, "change therapist req admi");
    const sender = this.state.user;
    const fromTitle = sender.name;
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != this.state.user.id ||
        participant.jwt != this.state.user.jwt ||
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
  setCommentIndex = index => {
    if (this.state.selectedCommentIndex === index) {
      this.setState({ selectedCommentIndex: -1 });
    } else {
      this.setState({ selectedCommentIndex: index });
    }
  };
  changeCommentHideStatus = async (index, status) => {
    let comments = this.state.post.comments;
    comments[index] = { ...comments[index], hide: status };
    await firebase
      .database()
      .ref(`posts/${this.state.post.id}/comments`)
      .set(comments)
      .then(res => {
        this.setState({ selectedCommentIndex: -1, comments });
        Snackbar("success", "Comment status changed successfully");
      });
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
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.fillSpace}>
            <Header
              style={{ top: 0, position: "absolute" }}
              title={"Post"}
              changeDrawer={this.goBack}
              icon={"arrow-back"}
              customStyles={{
                paddingTop: theme.size(0),
                height: theme.size(56)
              }}
              logout={this.logout}
            />
            <KeyboardAvoidingView
              style={{ flex: 1, width: "100%" }}
              // behavior={Platform.OS == "ios" ? "padding" : "height"}
              contentContainerStyle={{ bottom: 0 }}
            >
              {!this.state.loading ? (
                <View
                  style={{
                    flex: 1,
                    width: "100%",
                    justifyContent: "space-between"
                  }}
                >
                  {// this.state.posts && this.state.posts.length > 0
                  this.state.post ? (
                    <>
                      {/* <Divider
                  style={{
                    marginTop: theme.size(20),
                    height: theme.size(1),
                    width: '100%',
                  }} */}
                      {/* /> */}
                      <View>
                        <ListItem
                          style={{
                            top: 0
                            // borderLeftColor: theme.colorGrey,
                            // borderLeftWidth: theme.size(5),
                          }}
                          key={this.state.post.id}
                          leftAvatar={
                            <Avatar
                              rounded
                              size={40}
                              source={{ uri: this.state.post.author?.photo }}
                            />
                          }
                          title={
                            <View
                              style={{
                                flex: 1,
                                flexDirection: "column",
                                justifyContent: "space-around",
                                marginLeft: 20
                              }}
                            >
                              <Text
                                style={[
                                  styles.title,
                                  {
                                    fontFamily: theme.font.regular,
                                    color: theme.colorDarkGrey,
                                    marginLeft: 5
                                  }
                                ]}
                              >
                                {this.state.post?.author.name}
                              </Text>

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
                                  name="calendar-today"
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
                                    }
                                  ]}
                                >
                                  {this.state.post?.time} •{" "}
                                  {this.state.post?.date}
                                </Text>
                              </View>
                            </View>
                          }
                          titleStyle={styles.title}
                          bottomDivider
                          //   subtitle={this.state.post.description}
                          subtitleStyle={styles.subtitle}
                        />
                        <ListItem
                          title={
                            <Text
                              style={[
                                styles.bodyText,
                                {
                                  color: theme.colorMenuText,
                                  marginLeft: theme.size(5),
                                  fontFamily: theme.font.medium,
                                  marginBottom: theme.size(10),
                                  // fontSize: 14,
                                  textAlign: "justify"
                                }
                              ]}
                            >
                              {this.state.post.description}
                            </Text>
                          }
                          titleStyle={{
                            ...styles.subtitle,
                            color: theme.colorMenuHeading
                          }}
                          bottomDivider
                        />
                        <FlatList
                          data={this.state.post.comments}
                          keyExtractor={item => item.description}
                          renderItem={({ item, index }) =>
                            this.state.user.role !== "ADMIN" && !item.hide ? (
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
                                  <Avatar
                                    rounded
                                    size={30}
                                    source={{ uri: item.photo }}
                                  />
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
                                      {item.name}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.subtitle,
                                        {
                                          color: theme.colorGrey,
                                          marginLeft: theme.size(5),

                                          textAlign: "justify",
                                          fontSize: 8
                                        }
                                      ]}
                                    >
                                      {item.time} • {item.date}
                                    </Text>
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
                                      {item.description}
                                    </Text>
                                  </View>
                                }
                                titleStyle={{
                                  ...styles.subtitle,
                                  color: theme.colorMenuHeading
                                }}
                                onPress={() => this.setCommentIndex(index)}
                              />
                            ) : this.state.user.role === "ADMIN" ? (
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
                                  <Avatar
                                    rounded
                                    size={30}
                                    source={{ uri: item.photo }}
                                  />
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
                                      {item.name}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.subtitle,
                                        {
                                          color: theme.colorGrey,
                                          marginLeft: theme.size(5),

                                          textAlign: "justify",
                                          fontSize: 8
                                        }
                                      ]}
                                    >
                                      {item.time} • {item.date}
                                    </Text>
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
                                      {item.description}
                                    </Text>
                                    {!item.hide ? (
                                      <Icon
                                        name="eye"
                                        type="feather"
                                        size={20}
                                        underlayColor="transparent"
                                        color={theme.colorGrey}
                                        onPress={() =>
                                          this.changeCommentHideStatus(
                                            index,
                                            true
                                          )
                                        }
                                      />
                                    ) : (
                                      <Icon
                                        name="eye-off"
                                        type="feather"
                                        size={20}
                                        underlayColor="transparent"
                                        color={theme.colorLightGrey}
                                        onPress={() =>
                                          this.changeCommentHideStatus(
                                            index,
                                            false
                                          )
                                        }
                                      />
                                    )}
                                  </View>
                                }
                                titleStyle={{
                                  ...styles.subtitle,
                                  color: theme.colorMenuHeading
                                }}
                                onPress={() => this.setCommentIndex(index)}
                              />
                            ) : null
                          }
                        />
                      </View>

                      <Input
                        multiline={true}
                        key
                        // style={{position: 'absolute', bottom: 0}}
                        placeholder={"Type Your Comment Here..."}
                        inputStyle={{
                          ...styles.subtitle,
                          textAlignVertical: "center",
                          // justifyContent:'center',
                          ...Platform.select({ ios: { paddingTop: 11 } })
                        }}
                        containerStyle={{
                          // position: "absolute",
                          bottom: 0,
                          backgroundColor: theme.colorAccent,
                          // borderRadius: 4,
                          borderWidth: 1,
                          paddingHorizontal: 0,
                          marginTop: 10,
                          justifyContent: "center",
                          alignItems: "center"
                          // paddingHorizontal:5
                        }}
                        leftIcon={{ name: "keyboard", color: theme.colorGrey }}
                        rightIcon={
                          <Icon
                            name="send"
                            underlayColor="transparent"
                            // color={theme.colorPrimary}
                            onPress={() => {
                              this.submitComment();
                            }}
                            color={theme.colorPrimary}
                            ViewComponent={LinearGradient}
                          />
                        }
                        keyboardType={"default"}
                        onChangeText={newComment => {
                          // alert(newComment)
                          this.setState({ newComment });
                        }}
                        propertyName={"newComment"}
                        value={this.state.newComment}
                        //   autoCapitalize="none"
                      />
                    </>
                  ) : (
                    <Text style={[styles.h2, { textAlign: "center" }]}>
                      No Post Found
                    </Text>
                  )}

                  {/* <BottomBar
              options={[
                {
                  title: 'More',
                  icon: {
                    name: 'more-horiz',
                    color: 'white',
                    type: 'material-icons',
                  },
                  onPress: () => this.props.navigation.navigate('Dashboard'),
                },
                {
                  title: 'Home',
                  icon: {
                    name: 'home-outline',
                    color: 'white',
                    type: 'material-community',
                  },
                  onPress: () => this.props.navigation.navigate('Dashboard'),
                },
              ]}
            /> */}
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <ActivityIndicator />
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Drawer>
    );
  }
}
