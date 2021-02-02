import React, { Component } from "react";
import { ScrollView, View, Text, BackHandler, Dimensions } from "react-native";
import { styles, theme } from "../styles/index";
import Input from "../components/Input";
import ImageInput from "../components/ImageInput";
import { Button, Avatar, CheckBox } from "react-native-elements";
import { Divider, Badge } from "react-native-elements";
//import { http } from "../util/http";
import firebase from "../services/firebase";
import Snack from "../components/Snackbar";
import ImagePicker from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import TermsModal from "../pages/Terms";
import { notificationManager } from "./../components/notifications/index";
import messaging from "@react-native-firebase/messaging";
import Axios from "axios";
import session from "../data/session";
import Header from "../components/Header";
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
import NetworkUtils from "../components/NetworkUtil";
import NetworkUtilModal from "../components/NetworkUtilModal";
import { KeyboardAvoidingView } from "react-native";
export default class signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      phone: "",
      email: "",
      password: "",
      password2: "",
      checked: false,
      signupOptions: props.navigation.getParam("signupOptions"),
      image: null,
      avatarSource: "",
      loading: false,
      termsModalVisible: false,
      data: []
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  async componentDidMount() {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    const user = await session.getUser();
    if (user) {
      const {
        name,
        phone,
        email,
        password,

        photo,
        role
      } = user;
      this.setState({
        name,
        phone,
        email,
        password,

        avatarSource: photo,
        role,
        locked: true
      });
    }
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  handleBackButtonClick() {
    this.state.locked
      ? this.props.navigation.navigate("dashboard")
      : this.props.navigation.navigate("signupOptions");
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.navigation.getParam("signupOptions")) {
      const old = prevState.signupOptions;
      const updated = this.props.navigation.getParam("signupOptions");
      if (
        old?.orientation !== updated?.orientation ||
        old?.religious !== updated?.religious ||
        old?.religion !== updated?.religion ||
        old?.onMedication !== updated?.onMedication ||
        old?.sleepingHabits !== updated?.sleepingHabits ||
        JSON.stringify(old.selectedDiseases) !==
          JSON.stringify(updated.selectedDiseases)
      ) {
        this.setState({
          signupOptions: this.props.navigation.getParam("signupOptions")
        });
      }
    }
  }

  broadcastPushNotifications = (inputValue, user, admin, type) => {
    console.log(admin, "heyyy");
    const channel = admin;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }
    const sender = user;
    const fromTitle = sender.name;
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != user.id ||
        participant.jwt != user.jwt ||
        participant._id != user._id
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

  updateTerms = () => {
    this.setState({ checked: !this.state.checked });
  };

  onSubmit = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }

    this.setState({ loading: true });
    if (this.state.locked) {
      var updates = {};
      const user = await session.getUser();
      if (
        this.state.phone.length === 0 ||
        !this.state.phone.match(
          "^((\\+92)|(0092))-{0,1}\\d{3}-{0,1}\\d{7}$|^\\d{11}$|^\\d{4}-\\d{7}$"
        )
      ) {
        this.setState({ loading: false });
        Snack("error", "Please enter valid phone number");
      } else {
        // alert(1)
        session.loggingIn({
          ...user,
          name: this.state.name,
          photo: this.state.avatarSource,
          phone: this.state.phone
        });
        updates["users/" + user.id + "/name"] = this.state.name;
        updates["users/" + user.id + "/photo"] = this.state.avatarSource;
        updates["users/" + user.id + "/phone"] = this.state.phone;
        // updates['users/'+user.id+'/name']=this.state.name
        firebase
          .database()
          .ref()
          .update(updates);
        this.props.navigation.navigate("Dashboard");
        this.setState({ loading: false });
        // alert(2)
      }
    } else if (await this.valid()) {
      const { name, phone, email, password } = this.state;
      const {
        orientation,
        religious,
        religion,
        onMedication,
        sleepingHabits,
        selectedDiseases
      } = this.state.signupOptions;
      // const body = new FormData();
      // body.append('name', name);
      // body.append('phone', phone);
      // body.append('email', email);
      // body.append('password', password);

      // body.append('orientation', orientation);
      // body.append('religious', religious);
      // body.append('religion', religion);
      // body.append('onMedication', onMedication);
      // body.append('sleepingHabits', sleepingHabits);
      // body.append('selectedDiseases', JSON.stringify(selectedDiseases));
      // if (this.state.image) {
      //     body.append('file', {
      //         uri: this.state.image.uri,
      //         type: this.state.image.type,
      //         name:'image'
      //     });
      // }
      const body = {
        name,
        phone,
        email,
        password,
        orientation,
        religious,

        religion,
        onMedication,
        sleepingHabits,
        selectedDiseases,
        photo: this.state.avatarSource
          ? this.state.avatarSource
          : "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg",
        role: "USER",
        status: "unassigned",
        sessionRequested: false,
        sessionsTaken: 0,
        sessionsLeft: 0,
        therapists: []
      };
      console.log(body);
      const config = { headers: { "content-type": "multipart/form-data" } };

      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async resp => {
          this.setState({ loading: false });
          const pushToken = await this.fetchPushTokenIfPossible();
          Snack("success", "Signup successful.");
          firebase
            .database()
            .ref(`users/${resp.user.uid}`)
            .set({
              ...body,
              id: resp.user.uid,
              pushToken: pushToken,
              allowNotification: false
            })
            .then(res => {
              var users = [];
              firebase
                .database()
                .ref("users")
                .once("value", snap => {
                  if (snap.exists()) {
                    const values = snap.val();

                    users = Object.values(values).filter(key => {
                      if (key.role === "THERAPIST" || key.role === "ADMIN") {
                        return key;
                      }
                    });

                    console.log(users, "signasdasUPasdadsasdPP");

                    this.broadcastPushNotifications(
                      "New client has joined the application",
                      {
                        ...body,
                        id: resp.user.uid,
                        pushToken: pushToken,
                        allowNotification: false
                      },
                      users,
                      "new_user"
                    );
                  }
                });
            })
            .then(res => {
              console.log("new user data stored", res);
              Axios.get(
                `http://us-central1-pukaar-4988e.cloudfunctions.net/sendMail`,
                {
                  params: {
                    dest: body.email,
                    subject: `Welcome Aboard`,
                    body: `Congratulations on joining our team! <br/><br/>Hi ${
                      body.name
                    },\nFirstly, we want to congratulate you for reaching out for help. We understand that this process may be new and difficult for you. You have taken the first (and most courageous) step. You have been matched with a certified counselor who will guide you through the next steps.\n\nSo you're probably asking - how does this work? it's quite simple, actually. Just like with any counseling, you and your counselor will discuss any challenges you're facing or might face, and you will develop some positive ways to reach your goals. The difference is that you don't need to come to an office and you don't need to schedule any time out of your day.\nInstead, you can write whenever it's convenient for you, and move forward at a pace that you feel comfortable with.\n\nPleases note that your messages with your counselor arent in real-time but it wont be too long before you get a response from your counselor. Your sessions also have another benefit - you can re-read and reflect on our conversations at any time. Often, going back to a conversation can be very helpful as it's one of those things that will help you and your counselor move forward together.\n\nWhat happens if you feel you and your counselor dont't connect well? While we try to match you with the best counselor for your needs, that can certainly happen! There are over many therapists who work on this platform and you can switch to work with another counselor at any time.\n\nThank you for trying Pukaar.\n\nSincerely,\nTeam Pukaar
      <br/>`
                  }
                }
              );
            })
            .catch(err => {
              console.log("new user data stored error", err);
            });
          this.props.navigation.navigate("Login");
        })
        .catch(err => {
          console.log(err);
          this.setState({ loading: false });
          if (err.message) {
            Snack("error", err.message);
            console.log(err, "jkhhkkhkh");
            return false;
          } else {
            Snack("error", "Unknown error occured, please contact an Admin");
            return false;
          }
        });
    } else {
      this.setState({ loading: false });
    }
  };
  uriToBlob = uri => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
      };
      xhr.onerror = function() {
        // something went wrong
        reject(new Error("uriToBlob failed"));
      };
      // this helps us get a blob
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  };

  uploadToFirebase = async (blob, callback) => {
    var storageRef = firebase.storage().ref();
    var id = await firebase
      .database()
      .ref(`/uploads`)
      .push().key;
    var uploadTask = storageRef.child(`uploads/${id}.png`).put(blob, {
      contentType: "image/png",
      quality: 0.7
    });
    uploadTask.on(
      "state_changed",
      function(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case firebase.storage.TaskState?.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState?.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      function(error) {
        // Handle unsuccessful uploads
      },
      function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log("File available at", downloadURL);

          callback(downloadURL);
        });
      }
    );
  };
  fetchPushTokenIfPossible = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // await messaging().registerDeviceForRemoteMessages();

      console.log("Authorization status:", authStatus);
      return await messaging().getToken();
    }
  };

  handleImage = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    ImagePicker.showImagePicker(
      {
        title: "Select Picture",
        storageOptions: {
          skipBackup: true,
          path: "images"
        },
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.5
      },
      async response => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          Snack("error", "Unknown error occured, please contact an Admin");
        } else if (response.customButton) {
          console.log("User tapped custom button: ", response.customButton);
        } else {
          // You can also display the image using data:
          // const source = { uri: 'data:image/jpeg;base64,' + response.data };
          const blob = await this.uriToBlob(response.uri);
          await this.uploadToFirebase(blob, downloadURL =>
            this.setState({ avatarSource: downloadURL, loading: false })
          );

          // this.setState({ image: response, avatarSource: response.uri });
          // alert(this.state.avatarSource);
        }
      }
    );
  };

  valid = async () => {
    if (!this.state.avatarSource) {
      // if (
      //   this.state.image.type !== 'image/jpeg' &&
      //   this.state.image.type !== 'image/png' &&
      //   this.state.image.type !== 'image/jpg'
      // ) {
      Snack("error", "Select your profile picture.");
      //   return false;
      // }
      // if (this.state.image.fileSize >= 9000000) {
      //   Snack('error', 'File size too large. Must be below 9 Mb');
      //   return false;
      // }
    }
    if (!this.state.checked) {
      Snack("error", "Must agree to the terms and conditions.");
      return false;
    }
    const { name, phone, email, password, password2 } = this.state;
    let phoneVerified = true;
    await firebase
      .database()
      .ref(`users`)
      .orderByChild("phone")
      .equalTo(phone)
      .once("value", snap => {
        if (snap.exists()) {
          Snack("error", "User is already registered against this number");
          phoneVerified = false;
          return false;
        } else if (
          phone.length === 0 ||
          !phone.match(
            "^((\\+92)|(0092))-{0,1}\\d{3}-{0,1}\\d{7}$|^\\d{11}$|^\\d{4}-\\d{7}$"
          )
        ) {
          Snack("error", "Please enter valid phone number");
          phoneVerified = false;
          return false;
        }
      });

    if (!phoneVerified) {
      return false;
    }
    // if (
    //   phone.length === 0 ||
    //   !phone.match(
    //     "^((\\+92)|(0092))-{0,1}\\d{3}-{0,1}\\d{7}$|^\\d{11}$|^\\d{4}-\\d{7}$"
    //   )
    // ) {
    //   Snack("error", "Please enter valid phone number");
    //   return false;
    // }
    if (email.length === 0 || !emailRegex.test(email)) {
      Snack("error", "Please enter valid email");
      return false;
    }
    if (password !== password2) {
      Snack("error", "Passwords do not match");
      return false;
    }
    if (
      name.length > 0 &&
      email.length > 0 &&
      password.length > 0 &&
      password2.length > 0
    ) {
      return true;
    } else {
      Snack("error", "All fields must be filled");
      return false;
    }
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  updateVisible = () => {
    this.setState({
      termsModalVisible: !this.state.termsModalVisible
    });
  };

  render() {
    return (
      <View style={styles.fillSpace}>
        {this.state.locked && (
          <Header
            title={"Edit Profile"}
            changeDrawer={() => this.props.navigation.navigate("Dashboard")}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            //   iconRight={"exit-to-app"}
            // logout={() => {
            //   session.loggingOut();
            //   this.props.navigation.navigate("Login", { update: true });
            // }}
          />
        )}
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
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <ScrollView style={[styles.bodyPadding]}>
            <View
              style={{
                marginBottom: theme.size(10),
                marginTop: theme.size(30)
              }}
            >
              {!this.state.locked && (
                <Text
                  style={[
                    styles.h1,
                    { textAlign: "center", color: theme.colorPrimary }
                  ]}
                  numberOfLines={1}
                >
                  Sign up
                </Text>
              )}
            </View>
            {!this.state.locked && (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                {/* <Divider style={{ backgroundColor: theme.colorPrimary, marginTop: theme.size(10), height: theme.size(2), width: '60%' }} /> */}
                <Divider
                  style={{
                    backgroundColor: theme.colorGrey,
                    marginTop: theme.size(10),
                    height: theme.size(2),
                    width: "60%"
                  }}
                />
                <View style={{ flexDirection: "row" }}>
                  <Badge
                    value="1"
                    badgeStyle={{ backgroundColor: "grey" }}
                    containerStyle={{ top: -10, left: -30 }}
                    onPress={() => this.handleBackButtonClick()}
                  />
                  <Badge value="2" containerStyle={{ top: -10, left: 30 }} />
                </View>
              </View>
            )}
            <View style={{ alignItems: "center", marginTop: theme.size(10) }}>
              <Avatar
                rounded
                size="large"
                source={
                  this.state.avatarSource
                    ? {
                        uri: this.state.avatarSource
                          ? this.state.avatarSource
                          : ""
                      }
                    : require("./../../assets/person.jpg")
                }
                showEditButton
                // onPress={() => this.handleImage()}
                editButton={{
                  onPress: () => this.handleImage(),
                  containerStyle: { padding: 0 }
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: theme.paddingBodyVertical
              }}
            >
              <Input
                placeholder={"Your Name"}
                value={this.state.name}
                leftIcon={{ name: "person-outline", color: theme.colorGrey }}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,

                  textAlignVertical: "center"
                }}
                onChange={this.onChange}
                propertyName={"name"}
              />
              <Input
                placeholder={"Contact number"}
                value={this.state.phone}
                leftIcon={{
                  name: "phone-outline",
                  type: "material-community",
                  color: theme.colorGrey
                }}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,

                  textAlignVertical: "center"
                }}
                keyboardType={"numeric"}
                onChange={this.onChange}
                propertyName={"phone"}
              />

              <Input
                placeholder={"E-mail"}
                value={this.state.email}
                leftIcon={{ name: "mail-outline", color: theme.colorGrey }}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,

                  textAlignVertical: "center"
                }}
                keyboardType={"email-address"}
                onChange={this.onChange}
                propertyName={"email"}
                autoCapitalize="none"
                disabled={!!this.state.locked}
              />
              <Input
                placeholder={"Password"}
                value={this.state.password}
                leftIcon={{ name: "lock-outline", color: theme.colorGrey }}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,

                  textAlignVertical: "center"
                }}
                secureTextEntry={true}
                onChange={this.onChange}
                propertyName={"password"}
                autoCapitalize="none"
                disabled={!!this.state.locked}
              />
              <Input
                placeholder={"Confirm Password"}
                value={
                  this.state.locked ? this.state.password : this.state.password2
                }
                leftIcon={{ name: "lock-outline", color: theme.colorGrey }}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,

                  textAlignVertical: "center"
                }}
                secureTextEntry={true}
                onChange={this.onChange}
                propertyName={"password2"}
                autoCapitalize="none"
                disabled={!!this.state.locked}
              />
            </View>
            {!this.state.locked && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <CheckBox
                    containerStyle={{
                      marginHorizontal: 0,
                      paddingHorizontal: 0
                    }}
                    checked={this.state.checked}
                    onPress={() => this.updateTerms()}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                  />
                  <Text
                    style={[
                      styles.subtitle,
                      { fontSize: theme.size(12), paddingHorizontal: 10 }
                    ]}
                  >
                    I agree to the{" "}
                    <Text
                      style={{ color: theme.colorPrimary }}
                      onPress={() => this.setState({ termsModalVisible: true })}
                    >
                      terms and conditions
                    </Text>{" "}
                    of Pukaar.
                  </Text>
                </View>
                {/* <TermsModal
                  visible={!this.state.termsModalVisible}
                  updateVisible={this.updateVisible}
                /> */}
              </>
            )}
            <View
              style={{
                marginTop: theme.size(10),
                marginBottom: theme.size(10)
              }}
            >
              {this.state.loading ? (
                <Button
                  buttonStyle={{
                    paddingVertical: theme.size(10),
                    borderRadius: 5
                  }}
                  loading
                  ViewComponent={LinearGradient}
                />
              ) : (
                <Button
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
                  title={this.state.locked ? "Update Profile" : "Sign up"}
                  onPress={() => this.onSubmit()}
                  ViewComponent={LinearGradient}
                />
              )}
            </View>
            {!this.state.locked && (
              <View style={{ marginBottom: theme.size(10) }}>
                <Text
                  style={[styles.bodyText, { textAlign: "center" }]}
                  numberOfLines={2}
                >
                  Already have an account?{" "}
                  <Text
                    style={{ color: theme.colorPrimary }}
                    onPress={() => this.props.navigation.navigate("Login")}
                  >
                    Login
                  </Text>
                </Text>
                <Text
                  style={[styles.bodyText, { textAlign: "center" }]}
                  numberOfLines={2}
                >
                  {/* Pukaar is free for a limited time only. */}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  }
}
