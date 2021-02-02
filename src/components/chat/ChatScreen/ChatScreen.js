import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import firebase from "firebase";
import {
  Platform,
  BackHandler,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  AppState
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import Chat from "../Chat/Chat";
import { channelManager } from "../firebase";
import { firebaseStorage } from "../../../services/storage";
import {
  Avatar,
  Header,
  Icon,
  Input,
  Overlay,
  Button
} from "react-native-elements";
import session from "../../../data/session";
import { notificationManager } from "../../notifications";
import { setMediaChatReceivers } from "../../../store/actions/audioActions.js";
import AudioVideoChat from "../Audio/AudioChat";
// import styless from "../AudioRecord/styles";
import Snackbar from "../../Snackbar";
import {} from "../../../util/enums/doctorTypes";
import Sound from "react-native-sound";
import { AudioRecorder, AudioUtils } from "react-native-audio";
import { v4 as uuidv4 } from "uuid";
import LinearGradient from "react-native-linear-gradient";
import { styles as appStyles, styles, theme } from "../../../styles";
import fire from "../../../services/firebase";
import NetworkUtils from "../../NetworkUtil";
import NetworkUtilModal from "../../NetworkUtilModal";
import moment from "moment";
class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.channel = this.props.navigation.getParam("channel");
    this.state = {
      thread: [],
      inputValue: "",
      therapistPress: null,
      channel: this.channel,
      downloadUrl: "",
      uploadProgress: 0,
      isMediaViewerOpen: false,
      isRenameDialogVisible: false,
      selectedMediaIndex: null,
      user: null,
      isLoggingIn: false,
      loading: true,
      startAudio: false,
      hasPermission: false,
      currentTime: 0.0,
      recording: false,
      showSessionTimer: false,
      paused: false,
      stoppedRecording: false,
      finished: false,
      startTime: null,
      appState: AppState.currentState,
      audioPath:
        Platform.OS === "ios"
          ? AudioUtils.MainBundlePath + `/${uuidv4()}.aac`
          : AudioUtils.DocumentDirectoryPath + `/${uuidv4()}.aac`,
      playAudio: false,
      fetchChats: false,
      hoursCounter: "00",
      minutesCounter: "00",
      secondsCounter: "3600",
      loadingFooter: false,
      lastVisible: null,
      role: null,
      audioSettings: {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        MeteringEnabled: true,
        IncludeBase64: true,
        AudioEncodingBitRate: 32000
      }
    };
    this.timerInterval = null;
    this.onEndReachedCalledDuringMomentum = false;
    this.title = this.channel.name;

    if (!this.title) {
      this.title =
        this.channel.participants.length > 0
          ? this.channel.participants[0].name
          : "Chat";
    }
    this.didFocusSubscription = props.navigation.addListener(
      "didFocus",
      payload =>
        BackHandler.addEventListener(
          "hardwareBackPress",
          this.onBackButtonPressAndroid
        )
    );

    this.groupSettingsActionSheetRef = React.createRef();
    this.privateSettingsActionSheetRef = React.createRef();
  }

  capitalize = s => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  onTimerStart = () => {
    this.timerInterval = setInterval(() => {
      const { hoursCounter, minutesCounter, secondsCounter } = this.state;
      let sec = (Number(secondsCounter) + 1).toString(),
        min = minutesCounter,
        hr = hoursCounter;

      if (Number(secondsCounter) === 59) {
        min = (Number(minutesCounter) + 1).toString();
        sec = "00";
      }

      if (Number(minutesCounter) === 59 && Number(secondsCounter) === 59) {
        hr = (Number(hoursCounter) + 1).toString();
        min = "00";
        sec = "00";
      }

      this.setState({
        minutesCounter: min.length === 1 ? "0" + min : min,
        secondsCounter: sec.length === 1 ? "0" + sec : sec,
        hoursCounter: hr.length === 1 ? "0" + hr : hr
      });
    }, 1000);
  };

  startTimer = duration => {
    var timer = duration;

    this.timerInterval = setInterval(() => {
      let minutes = parseInt(timer / 60, 10);
      let seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      if (--timer < 0) {
        timer = duration;
      }
      this.setState({
        minutesCounter: minutes,
        secondsCounter: seconds
      });

      this.endTime(seconds, minutes);
    }, 1000);
  };

  async componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    // if (this.props.navigation.getParam("seen")) {
    //   this.props.unsubscribeCount;
    // }

    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    let userHold = await session.getUser();

    await fire
      .database()
      .ref(`users/${userHold._id}`)
      .on("value", snap => {
        if (snap.exists()) {
          this.setState({ user: snap.val() });
        }
      });

    if (this.channel.participants[0].role == "USER") {
      let hold = await fire
        .database()
        .ref(`users/${this.channel.participants[0].id}`)
        .on("value", snap => {
          if (snap.exists()) {
            this.setState({ sessionReq: snap.val() });

            this.state.user?.patients.map((i, index) => {
              if (
                i.status == "active" &&
                i.id ==
                  (this.channel.participants[0]?._id ||
                    this.channel.participants[0]?.id ||
                    this.channel.participants[0]?.jwt)
              ) {
                firebase
                  .database()
                  .ref(
                    `users/${this.state.user?._id ||
                      this.state.user?.id ||
                      this.state.user?.jwt}`
                  )
                  .child("patients")
                  .child(index)
                  .on("value", item => {
                    let a = moment(Date()); //now
                    let b = new Date(item.val()?.startSessionTimer);

                    if (a.diff(b, "seconds") <= 3600) {
                      this.setState({
                        // secondsCounter: (3600 - a.diff(b, "seconds")).toString()
                      });
                      console.log(snap.val()?.enablePatientCall, "lkasdasdal");
                      if (snap.val()?.enablePatientCall == true) {
                        this.setState({ showSessionTimer: true });
                        console.log(
                          (3600 - a.diff(b, "seconds")).toString(),
                          "lkl"
                        );
                        var duration = (3600 - a.diff(b, "seconds")).toString();
                        var timer = duration;

                        this.timerInterval = setInterval(() => {
                          let minutes = parseInt(timer / 60, 10);
                          let seconds = parseInt(timer % 60, 10);

                          minutes = minutes < 10 ? "0" + minutes : minutes;
                          seconds = seconds < 10 ? "0" + seconds : seconds;
                          if (--timer < 0) {
                            timer = duration;
                          }
                          this.setState({
                            minutesCounter: minutes,
                            secondsCounter: seconds
                          });

                          this.endTime(seconds, minutes);
                        }, 1000);
                      } else {
                        clearInterval(this.timerInterval);
                      }
                    } else {
                      if (snap.val()?.enablePatientCall == true) {
                        if (a.diff(b, "seconds") > 3600) {
                          this.setState({
                            feedbackModalVisible: true,
                            showSessionTimer: false
                          });
                          firebase
                            .database()
                            .ref(
                              `users/${this.channel.participants[0]?._id ||
                                this.channel.participants[0]?.id ||
                                this.channel.participants[0]?.jwt}`
                            )
                            .update({ enablePatientCall: false });
                        }
                      }
                    }
                  });
              }
            });
          }
        });
      // fire
      //   .database()
      //   .ref(`users/${this.channel.participants[0].id}`)
      //   .onDisconnect()
      //   .update({ enablePatientCall: "pending" });
    }

    if (this.channel.participants[0].role == "THERAPIST") {
      await fire
        .database()
        .ref(`users/${this.state.user?.id}`)
        .on("value", snap => {
          if (snap.exists()) {
            // this.setState({ sessionReq: snap.val() });

            this.channel.participants[0]?.patients.map((i, index) => {
              if (
                i.status == "active" &&
                i.id ==
                  (this.state.user?._id ||
                    this.state.user?.id ||
                    this.state.user?.jwt)
              ) {
                firebase
                  .database()
                  .ref(
                    `users/${this.channel.participants[0]?._id ||
                      this.channel.participants[0]?.id ||
                      this.channel.participants[0]?.jwt}`
                  )
                  .child("patients")
                  .child(index)
                  .on("value", item => {
                    let a = moment(Date()); //now
                    let b = new Date(item.val()?.startSessionTimer);

                    if (a.diff(b, "seconds") <= 3600) {
                      this.setState({
                        // secondsCounter: (3600 - a.diff(b, "seconds")).toString()
                      });
                      if (snap.val()?.enablePatientCall == true) {
                        this.setState({ showSessionTimer: true });
                        var duration = (3600 - a.diff(b, "seconds")).toString();
                        var timer = duration;

                        this.timerInterval = setInterval(() => {
                          let minutes = parseInt(timer / 60, 10);
                          let seconds = parseInt(timer % 60, 10);

                          minutes = minutes < 10 ? "0" + minutes : minutes;
                          seconds = seconds < 10 ? "0" + seconds : seconds;
                          if (--timer < 0) {
                            timer = duration;
                          }
                          this.setState({
                            minutesCounter: minutes,
                            secondsCounter: seconds
                          });

                          this.endTime(seconds, minutes);
                        }, 1000);
                      } else {
                        clearInterval(this.timerInterval);
                      }
                    } else {
                      if (snap.val()?.enablePatientCall == true) {
                        if (a.diff(b, "seconds") > 3600) {
                          this.setState({ showSessionTimer: false });
                          firebase
                            .database()
                            .ref(
                              `users/${this.state.user?._id ||
                                this.state.user?.id ||
                                this.state.user?.jwt}`
                            )
                            .update({ enablePatientCall: false });
                          Snackbar("success", "Your session has ended");
                        }
                      }
                    }

                    // else {
                    //   this.setState({ showSessionTimer: false });
                    //   firebase
                    //     .database()
                    //     .ref(
                    //       `users/${this.state.user?._id ||
                    //         this.state.user?.id ||
                    //         this.state.user?.jwt}`
                    //     )
                    //     .update({ enablePatientCall: false });
                    //   Snackbar("success", "Your session has ended");
                    // }
                  });
              }
            });
          }
        });
      // fire
      //   .database()
      //   .ref(`users/${this.state.user.id}`)
      //   .onDisconnect()
      //   .update({ enablePatientCall: "pending" });
    }

    if (this.channel.participants[0].id == this.channel?.senderID) {
      if (this.props.navigation.getParam("seen") == true) {
        await fire
          .firestore()
          .collection("channels")
          .doc(this.channel?.channelID)
          .update({
            seen: this.props.navigation.getParam("seen")
          });
      } else {
        console.log("Do nothing at all");
      }
    }
    AudioRecorder.requestAuthorization().then(isAuthorised => {
      this.setState({ hasPermission: isAuthorised });

      if (!isAuthorised) return;

      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = data => {
        this.setState({ currentTime: data.currentTime });
        //this.onTimerStart();
      };

      AudioRecorder.onFinished = data => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === "ios") {
          this._finishRecording(
            data.status === "OK",
            data.audioFileURL,
            data.audioFileSize
          );
        }
      };
    });

    this.props.navigation.setParams({
      onAudioChat: this.onAudioChat
    });
    this.willBlurSubscription = this.props.navigation.addListener(
      "willBlur",
      payload =>
        BackHandler.removeEventListener(
          "hardwareBackPress",
          this.onBackButtonPressAndroid
        )
    );

    // console.log(this.channel, 'zawardo');
    this.threadUnsubscribe = channelManager.subscribeThreadSnapshot(
      this.channel,
      this.onThreadCollectionUpdate
    );
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
    this.threadUnsubscribe();
    this.didFocusSubscription && this.didFocusSubscription.remove();
    this.willBlurSubscription && this.willBlurSubscription.remove();
  }
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log(this.state.user, "okokoko");
      var a = moment(Date()); //now
      var b = moment("2020-12-17T18:03:55");

      console.log(a.diff(b, "minutes")); // 44700
      console.log(a.diff(b, "hours")); // 745
      console.log(a.diff(b, "days")); // 31
      console.log(a.diff(b, "weeks")); // 4

      console.log("App has come to the foreground!");
    }
    this.setState({ appState: nextAppState });
  };

  checkPermission() {
    if (Platform.OS !== "android") {
      return Promise.resolve(true);
    }
    const rationale = {
      title: "Microphone Permission",
      message:
        "AudioExample needs access to your microphone so you can record audio."
    };
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      rationale
    ).then(result => {
      console.log("Permission result:", result);
      return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
    });
  }

  onBackButtonPressAndroid = () => {
    if (this.props.navigation.getParam("admin") == true) {
      this.props.navigation.navigate("Dashboard");
      return true;
    } else {
      this.props.navigation.pop();
      this.props.navigation.push("Dashboard");
      return true;
    }
  };

  broadcastPushNotificationsAudio = (inputValue, admin, type) => {
    const channel = admin;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }
    const sender = this.state.user;
    const fromTitle = sender.name;
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != this.state.user?.id ||
        participant.jwt != this.state.user?.jwt ||
        participant._id != this.state.user?._id
      ) {
        notificationManager.sendPushNotification(
          participant,
          fromTitle,
          message,
          type,
          { fromUser: sender },
          true
        );
      }
    });
  };

  onAudioChat = async () => {
    if (this.state.user.role === "USER") {
      if (this.state.user.enablePatientCall == true) {
        await this.props.setMediaChatReceivers({
          receivers: this.channel.participants,
          channelId: this.channel.id,
          channelTitle: this.channel.name,
          type: "audio"
        });
        this.broadcastPushNotificationsAudio(
          "User is calling you",
          this.channel.participants,
          "UserChat"
        );
        AudioVideoChat.showAudioChatModal();
      } else {
        if (
          this.state.user?.sessionsLeft &&
          this.state.user?.sessionsLeft > 0
        ) {
          if (!!this.state.user?.sessionRequested) {
            if (this.state.user.sessionRequested === true || session == true) {
              Snackbar(
                "error",
                "You have already requested for a session. Please wait for Therapist Approval"
              );
            } else {
              firebase
                .database()
                .ref(
                  `users/${this.state.user?._id ||
                    this.state.user?.id ||
                    this.state.user?.jwt}`
                )
                .update({ sessionRequested: true })
                .then(snap => {
                  this.sendMessage(
                    `${this.state.user?.name} is requesting a session with you`
                  );
                  Snackbar(
                    "success",
                    "You have succefully requested for a sessions"
                  );
                  this.broadcastPushNotificationsAudio(
                    "User is requesting a session with you",
                    this.channel.participants,
                    "UserChat"
                  );
                });
            }
          } else {
            firebase
              .database()
              .ref(
                `users/${this.state.user?._id ||
                  this.state.user?.id ||
                  this.state.user?.jwt}/sessionRequested`
              )
              .set(true)
              .then(snap => {
                this.sendMessage(
                  `${this.state.user?.name} is requesting a session with you`
                );
                Snackbar(
                  "success",
                  "You have succefully requested for a session"
                );
                this.broadcastPushNotificationsAudio(
                  "User is requesting a session with you",
                  this.channel.participants,
                  "UserChat"
                );
              });
          }
        } else {
          Snackbar("error", "You have no sessions left");
        }
      }
    } else {
      if (
        this.props.navigation.getParam("admin") === true ||
        this.props.navigation.getParam("longPress") == true
      ) {
        console.log("Do nothing");
      } else {
        await this.props.setMediaChatReceivers({
          receivers: this.channel.participants,
          channelId: this.channel.id,
          channelTitle: this.channel.name,
          type: "audio"
        });
        this.broadcastPushNotificationsAudio(
          "Therapist is calling you",
          this.channel.participants,
          "UserChat"
        );
        AudioVideoChat.showAudioChatModal();
      }
    }
  };

  onThreadCollectionUpdate = querySnapshot => {
    const data = [];
    this.setState({
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
    });

    querySnapshot.forEach(doc => {
      // console.log(doc.data(), 'im here');
      const message = doc.data();
      if (
        this.state.user?.jwt == "8ER8DgByeVhjYaO2D613aSVUi172" ||
        this.state.user?._id == "8ER8DgByeVhjYaO2D613aSVUi172" ||
        this.state.user?.id == "8ER8DgByeVhjYaO2D613aSVUi172" ||
        !message.content ||
        message.content.length == 0 ||
        !message.content.startsWith("XARQEGWE13SD")
      ) {
        data.push({ ...message, id: doc.id });
      }
    });

    //  console.log(data, 'hello');

    this.setState({ thread: data, loading: false });
  };

  onChangeTextInput = text => {
    this.setState({
      inputValue: text
    });
  };

  createOne2OneChannel = () => {
    const self = this;
    return new Promise(resolve => {
      channelManager
        .createChannel(self.state.user, self.state.channel.participants)
        .then(response => {
          //console.log(response.channel, 'jadshasdhhksdajsdakjdaskjsdadas');
          self.setState({ channel: response.channel });
          self.threadUnsubscribe = channelManager.subscribeThreadSnapshot(
            response.channel,
            self.onThreadCollectionUpdate
          );
          resolve(response.channel);
        });
    });
  };

  onSendInput = async () => {
    const self = this;
    if (
      this.state.thread.length > 0 ||
      this.state.channel.participants.length > 1
    ) {
      self.sendMessage();
      return;
    }
    // If we don't have a chat id, we need to create it first together with the participations
    this.createOne2OneChannel().then(_response => {
      self.sendMessage();
    });
  };

  sendMessage = value => {
    const self = this;
    const inputValue = value || this.state.inputValue;
    const downloadURL = this.state.downloadUrl;
    self.setState({
      inputValue: "",
      downloadUrl: ""
    });
    // console.log(this.state.channel, "llklkl");
    channelManager
      .sendMessage(this.state.user, this.state.channel, inputValue, downloadURL)
      .then(response => {
        if (response.error) {
          alert(error);
          self.setState({
            inputValue: inputValue,
            downloadUrl: downloadURL
          });
        } else {
          self.broadcastPushNotifications(inputValue, downloadURL);
        }
      });
  };

  broadcastPushNotifications = (inputValue, downloadURL) => {
    const channel = this.state.channel;
    const participants = channel.participants;
    if (!participants || participants.length == 0) {
      return;
    }
    const sender = this.state.user;
    const isGroupChat = channel.name && channel.name.length > 0;
    const fromTitle = sender.name;
    var message;
    if (isGroupChat) {
      if (downloadURL) {
        if (downloadURL.mime && downloadURL.mime.startsWith("audio")) {
          message = sender.name + "sent a audio.";
        } else {
          message = sender.name + "sent a photo.";
        }
      } else {
        message = sender.name + ":" + inputValue;
      }
    } else {
      if (downloadURL) {
        if (downloadURL.mime && downloadURL.mime.startsWith("audio")) {
          message = sender.name + " " + "sent you a audio.";
        } else {
          message = sender.name + " " + "sent you a photo.";
        }
      } else {
        message = inputValue;
      }
    }

    participants.forEach(participant => {
      if (
        participant.id != this.state.user?.id ||
        participant.jwt != this.state.user?.jwt ||
        participant._id != this.state.user?._id
      ) {
        notificationManager.sendPushNotification(
          participant,
          fromTitle,
          message,
          "PersonalChatMessage",
          { fromUser: sender },
          true
        );
      }
    });
  };

  onAddMediaPress = photoUploadDialogRef => {
    photoUploadDialogRef.current.show();
  };

  onAddAudioPress = audioUploadDialogRef => {
    audioUploadDialogRef.current.show();
  };

  onLaunchCamera = () => {
    const self = this;
    const { jwt, name, image, _id } = this.state.user;

    ImagePicker.openCamera({
      cropping: false,
      width: 500,
      height: 700
    })
      .then(image1 => {
        const source = image1.path;
        const mime = image1.mime;

        const data = {
          content: "",
          created: channelManager.currentTimestamp(),
          senderFirstName: name,
          senderID: jwt || _id,
          senderLastName: "",
          senderProfilePictureURL: image,
          url: "http://fake"
        };

        self.startUpload({ source, mime }, data);
      })
      .catch(function(error) {
        self.setState({ loading: false });
      });
  };

  onOpenPhotos = () => {
    const { jwt, name, image, _id } = this.state.user;
    const self = this;

    ImagePicker.openPicker({
      width: 500,
      height: 700,
      cropping: false,
      multiple: false
    })
      .then(image1 => {
        const source = image1.path;
        const mime = image1.mime;

        const data = {
          content: "",
          created: channelManager.currentTimestamp(),
          senderFirstName: name,
          senderID: jwt || _id,
          senderLastName: "",
          senderProfilePictureURL: image,
          url: "http://fake"
        };

        self.startUpload({ source, mime }, data);
      })
      .catch(function(error) {
        console.log(error);
        self.setState({ loading: false });
      });
  };

  startUpload = ({ source, mime }, data) => {
    const self = this;
    var getFileBlob = function(url, cb) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.addEventListener("load", function() {
        cb(xhr.response);
      });
      xhr.send();
    };
    const filename =
      new Date() + "-" + source.substring(source.lastIndexOf("/") + 1);
    const uploadUri =
      Platform.OS === "ios" ? source.replace("file://", "") : source;
    //  console.log(source, mime, 'sadadasdadssa')
    getFileBlob(uploadUri, blob => {
      firebaseStorage.uploadFileWithProgressTracking(
        filename,
        blob,
        async (snapshot, taskSuccess) => {
          const uploadProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          self.setState({ uploadProgress });

          if (taskSuccess === "success") {
            const url = await snapshot.ref.getDownloadURL();

            self.setState({ downloadUrl: { url, mime }, uploadProgress: 0 });
            self.onSendInput();
          }
        },
        error => {
          self.setState({ uploadProgress: 0 });
          alert("Oops! An error has occured. Please try again.");
          console.log(error);
        }
      );
    });
  };

  sortMediafromThread = () => {
    this.imagesUrl = [];
    this.images = [];

    this.state.thread.forEach(item => {
      if (item.url && item.url != "") {
        if (item.url.mime && item.url.mime.startsWith("image")) {
          this.imagesUrl.push(item.url.url);
          this.images.push({
            id: item.id,
            url: item.url
          });
        }
        if (item.url.mime && item.url.mime.startsWith("audio")) {
          this.imagesUrl.push(item.url.url);
          this.images.push({
            id: item.id,
            url: item.url
          });
        } else if (!item.url.mime && item.url.startsWith("https://")) {
          // To handle old format before video feature
          this.imagesUrl.push(item.url);
          this.images.push({
            id: item.id,
            url: item.url
          });
        }
      }
    });

    return this.imagesUrl;
  };

  onChatMediaPress = item => {
    const index = this.images.findIndex(image => {
      return image.id === item.id;
    });

    this.setState({
      selectedMediaIndex: index,
      isMediaViewerOpen: true
    });
  };

  onMediaClose = () => {
    this.setState({ isMediaViewerOpen: false });
  };

  async _pause() {
    if (!this.state.recording) {
      console.warn("Can't pause, not recording!");
      return;
    }

    try {
      const filePath = await AudioRecorder.pauseRecording();
      this.setState({ paused: true });
    } catch (error) {
      console.error(error);
    }
  }

  async _resume() {
    if (!this.state.paused) {
      console.warn("Can't resume, not paused!");
      return;
    }

    try {
      await AudioRecorder.resumeRecording();
      this.setState({ paused: false });
    } catch (error) {
      console.error(error);
    }
  }

  async _stop() {
    if (!this.state.recording) {
      console.warn("Can't stop, not recording!");
      return;
    }

    this.setState({ stoppedRecording: true, recording: false, paused: false });

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === "android") {
        this._finishRecording(true, filePath);
        //    this._play();
        this.uploadAudio();
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async _cancel() {
    if (!this.state.recording) {
      console.warn("Can't stop, not recording!");
      return;
    }

    this.setState({ stoppedRecording: true, recording: false, paused: false });

    try {
      const filePath = await AudioRecorder.stopRecording();
      if (Platform.OS === "android") {
        this._finishRecording(true, filePath);
        //    this._play();
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async _play() {
    //  alert("HEYY");
    if (this.state.recording) {
      await this._stop();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.audioPath, "", error => {
        if (error) {
          console.log("failed to load the sound", error);
        }
      });

      setTimeout(() => {
        sound.play(success => {
          if (success) {
            console.log("successfully finished playing");
          } else {
            console.log("playback failed due to audio decoding errors");
          }
        });
      }, 100);
    }, 100);
  }

  async _record() {
    if (this.state.recording) {
      console.warn("Already recording!");
      return;
    }

    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }

    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath);
    }

    this.setState({ recording: true, paused: false });

    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  _finishRecording(didSucceed, filePath, fileSize) {
    this.setState({ finished: didSucceed });
  }

  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000,
      MeteringEnabled: true
    });
  }

  uploadAudio = async () => {
    const { jwt, name, image, _id } = this.state.user;
    const self = this;
    let storageRef = firebase.storage().ref("audio");
    const filename =
      new Date() +
      "-" +
      this.state.audioPath.substring(this.state.audioPath.lastIndexOf("/") + 1);
    const uploadUri =
      Platform.OS === "android"
        ? this.state.audioPath.replace("", "file://")
        : this.state.audioPath;

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        try {
          resolve(xhr.response);
        } catch (error) {
          console.log("error:", error);
        }
      };

      xhr.responseType = "blob";
      xhr.open("GET", uploadUri, true);
      xhr.send(null);
    });

    storageRef
      .child(filename)
      .put(blob, {
        contentType: "audio/aac"
      })
      .then(async snapshot => {
        const uploadProgress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        self.setState({ uploadProgress });
        const url = await snapshot.ref.getDownloadURL();
        const mime = "audio/acc";
        let recordTime = this.state.currentTime.toFixed(0);

        const data = {
          content: "",
          created: channelManager.currentTimestamp(),
          senderFirstName: name,
          senderID: jwt || _id,
          senderLastName: "",
          senderProfilePictureURL: image,
          url: "http://fake"
        };

        if (recordTime > 0) {
          self.setState({
            downloadUrl: { url, mime, recordTime },
            uploadProgress: 0
          });
          self.onSendInput();
        }
      })
      .catch(e => {
        self.setState({ uploadProgress: 0 });
        alert("Oops! An error has occured. Please try again.");
        console.log(e, "eroor");
      });
  };
  therapistSessionComponent(chatStatus) {
    if (!this.state.showSessionTimer) {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            height: 70,
            alignItems: "center"
          }}
        >
          <Text style={styles.subtitle}>Start session with client</Text>
          <TouchableOpacity
            style={{
              // width: 150,
              marginTop: theme.size(5),
              alignItems: "flex-end"
            }}
            disabled={chatStatus == "inactive" ? true : false}
            // onPress={() =>
            //   this.props.navigation.getParam("admin")
            //     ? null
            //     : this.props.navigation.state.params.onAudioChat()
            // }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[theme.colorGradientStart, theme.colorGradientEnd]}
              style={{
                // width: '70%',
                width: 120,
                height: 30,
                // paddingHorizontal: 20,
                // paddingVertical: 5,
                backgroundColor: theme.colorPrimary,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: "white",
                    textAlign: "center",
                    textAlignVertical: "center"
                  }
                ]}
                onPress={() => {
                  if (this.state.sessionReq.sessionRequested === true) {
                    this.setState({
                      showSessionTimer: true,
                      startTime: Date(),
                      therapistPress: true
                    }),
                      //  this.startTimer(this.state.secondsCounter);
                      firebase
                        .database()
                        .ref(
                          `users/${this.channel.participants[0]?._id ||
                            this.channel.participants[0]?.id ||
                            this.channel.participants[0]?.jwt}`
                        )
                        .update({ enablePatientCall: true })
                        .then(snap => {});

                    // let query = firebase
                    //   .database()
                    //   .ref(
                    //     `users/${this.state.user?._id ||
                    //       this.state.user?.id ||
                    //       this.state.user?.jwt}`
                    //   )
                    //   .child("patients")

                    //   .once("value", item => {
                    //     console.log(item.val(), "7676");

                    //   });
                    if (this.state.secondsCounter == "3600") {
                      this.state.user?.patients.map((i, index) => {
                        if (
                          i.status == "active" &&
                          i.id ==
                            (this.channel.participants[0]?._id ||
                              this.channel.participants[0]?.id ||
                              this.channel.participants[0]?.jwt)
                        ) {
                          let query = firebase
                            .database()
                            .ref(
                              `users/${this.state.user?._id ||
                                this.state.user?.id ||
                                this.state.user?.jwt}`
                            )
                            .child("patients")
                            .child(index)
                            .update({ startSessionTimer: Date() });
                        }
                      });
                    }
                  } else {
                    Snackbar(
                      "error",
                      "User has not requested for a  session yet"
                    );
                  }
                }}
              >
                START
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            height: 70,
            alignItems: "center"
          }}
        >
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.subtitle}>Your session has started</Text>

            <Text style={styles.subtitle}>Time Remaining</Text>
          </View>

          <TouchableOpacity
            style={{
              // width: 150,
              marginTop: theme.size(5),
              alignItems: "flex-end"
            }}
            disabled={chatStatus == "inactive" ? true : false}
            // onPress={() =>
            //   this.props.navigation.getParam("admin")
            //     ? null
            //     : this.props.navigation.state.params.onAudioChat()
            // }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[theme.colorGradientStart, theme.colorGradientEnd]}
              style={{
                // width: '70%',
                width: 120,
                height: 30,
                // paddingHorizontal: 20,
                // paddingVertical: 5,
                backgroundColor: theme.colorPrimary,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "white" }}>
                {this.state.minutesCounter} : {this.state.secondsCounter}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
  }
  patientSessionComponent(chatStatus) {
    if (!this.state.showSessionTimer) {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            height: 70,
            alignItems: "center"
          }}
        >
          <Text style={styles.subtitle}>Request session with therapist</Text>
          <TouchableOpacity
            style={{
              marginTop: theme.size(5),
              alignItems: "flex-end"
            }}
            disabled={chatStatus == "inactive" ? true : false}
            onPress={() =>
              this.props.navigation.getParam("admin")
                ? null
                : this.props.navigation.state.params.onAudioChat()
            }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[theme.colorGradientStart, theme.colorGradientEnd]}
              style={{
                // width: '70%',
                width: 120,
                height: 30,
                // paddingHorizontal: 20,
                // paddingVertical: 5,
                backgroundColor: theme.colorPrimary,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: "white",
                    textAlign: "center",
                    textAlignVertical: "center"
                  }
                ]}
              >
                REQUEST
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            height: 70,
            alignItems: "center"
          }}
        >
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.subtitle}>Your session has started</Text>

            <Text style={styles.subtitle}>Time Remaining</Text>
          </View>

          <TouchableOpacity
            style={{
              // width: 150,
              marginTop: theme.size(5),
              alignItems: "flex-end"
            }}
            disabled={chatStatus == "inactive" ? true : false}
            // onPress={() =>
            //   this.props.navigation.getParam("admin")
            //     ? null
            //     : this.props.navigation.state.params.onAudioChat()
            // }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[theme.colorGradientStart, theme.colorGradientEnd]}
              style={{
                // width: '70%',
                width: 120,
                height: 30,
                // paddingHorizontal: 20,
                // paddingVertical: 5,
                backgroundColor: theme.colorPrimary,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "white" }}>
                {this.state.minutesCounter} : {this.state.secondsCounter}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
  }
  logout = () => {
    session.loggingOut();
    session.isAuthenticated(false);
    this.props.navigation.navigate("Login", { update: true });
  };

  statusChecker = () => {
    const { user, channel } = this.state;
    let hold = null;
    let chatStatus = null;

    if (user?.role === "THERAPIST") {
      hold = user?.patients;
    } else if (user?.role === "USER") {
      hold = user?.therapists;
    }

    hold?.map(item => {
      if (item.id === channel.participants[0]._id) {
        chatStatus = item.status;
      }
    });

    return chatStatus;
  };

  showRequest = () => {
    let chatStatus = this.statusChecker();
    if (this.state.user?.role === "USER") {
      return this.patientSessionComponent(chatStatus);
    } else {
      return this.therapistSessionComponent(chatStatus);
    }
  };

  retrieveMore = async () => {
    if (this.state.lastVisible) {
      this.setState({ loadingFooter: true });

      setTimeout(async () => {
        let snapshot = await firebase
          .firestore()
          .collection("channels")
          .doc(this.state.channel?.id)
          .collection("thread")
          .orderBy("created", "desc")
          .startAfter(this.state.lastVisible.data()?.created)
          .limit(10)
          .get();

        if (!snapshot.empty) {
          let list = this.state.thread;

          this.setState({
            lastVisible: snapshot.docs[snapshot.docs.length - 1]
          });

          snapshot.forEach(doc => {
            list.push(doc.data());
          });

          this.setState({ thread: list });
          if (snapshot.docs.length < 3) this.setState({ lastVisible: null });
        } else {
          this.setState({ lastVisible: null });
          //    setLastDoc(null);
        }

        this.setState({ loadingFooter: false });
      }, 1000);
    }

    this.onEndReachedCalledDuringMomentum = true;
  };

  renderFooter = () => {
    if (!this.state.loadingFooter) return true;

    return (
      <ActivityIndicator
        color={theme.colorGrey}
        size={"small"}
        style={{ backgroundColor: "white" }}
      />
    );
  };

  onEndReached = () => {
    if (!this.onEndReachedCalledDuringMomentum && !this.state.loadingFooter) {
      this.retrieveMore();
    }
  };

  onMomentumScrollBegin = () => {
    this.onEndReachedCalledDuringMomentum = false;
  };

  endTime = (seconds, minutes) => {
    if (seconds == "00" && minutes == "00") {
      clearInterval(this.timerInterval);

      this.setState({ showSessionTimer: false });
      if (this.state.user?.role == "THERAPIST") {
        this.setState({ feedbackModalVisible: true });
      }

      if (this.state.user?.role == "USER") {
        firebase
          .database()
          .ref(
            `users/${this.state.user?._id ||
              this.state.user?.id ||
              this.state.user?.jwt}`
          )
          .update({ enablePatientCall: false });
        Snackbar("success", "Your session has ended");
      }
    }
  };

  render() {
    const longPress = this.props.navigation.getParam("longPress");
    let chatStatus = this.statusChecker();
    return (
      <>
        <Header
          style={{ top: 0 }}
          ViewComponent={LinearGradient} // Don't forget this!
          linearGradientProps={{
            colors: [theme.colorGradientStart, theme.colorGradientEnd]
            // start: { x: 0, y: 0.5 },
            // end: { x: 1, y: 0 }
          }}
          containerStyle={[
            {
              //paddingTop: theme.size(40),
              elevation: 5,
              shadowRadius: 5,
              shadowColor: theme.colorGrey,
              // shadowOffset:{height:5,width:5},
              paddingTop:
                Platform.OS === "ios"
                  ? (20 * Dimensions.get("window").height) / 896
                  : null,
              paddingHorizontal: 10
            }
            // props.customStyles
          ]}
          statusBarProps={{ hidden: true }}
          leftComponent={
            <Icon
              name="arrow-back"
              size={28}
              color={theme.colorAccent}
              onPress={() => {
                if (this.props.navigation.getParam("admin")) {
                  this.props.navigation.navigate("Dashboard");
                } else {
                  this.props.navigation.pop();
                  this.props.navigation.push("Dashboard");
                }
              }}
            />
          }
          centerComponent={
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                // height: "35%",
                width: "100%",
                flexDirection: "row"
                // justifyContent:'space-around'
                // backgroundColor: theme.colorLightGrey
              }}
            >
              <View
                style={{
                  // borderWidth: 1,
                  borderRadius: 100,
                  // borderColor: theme.colorGrey,
                  padding: 5,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "transparent"
                }}
              >
                <Avatar
                  rounded
                  size={40}
                  source={{
                    uri:
                      this.props.navigation.getParam("admin") === true
                        ? this.props.navigation.getParam("userPatient")
                            ?.photo || ""
                        : this.channel.participants[0]?.photo || ""
                  }}
                  // showEditButton
                  // // onPress={() => this.handleImage()}
                  // editButton={{
                  //   onPress: () => this.handleImage(),
                  //   containerStyle: { padding: 0 },
                  //   size: 20,
                  //   style: { margin: 5 },
                  //   iconStyle: { padding: 5 }
                  // }}
                />
              </View>
              <Text
                style={[
                  {
                    ...appStyles.h2,
                    fontFamily: theme.font.regular,
                    paddingHorizontal: 15,
                    // paddingTop: 5,
                    alignSelf: "center",
                    textAlignVertical: "center"
                  },
                  { color: theme.colorAccent }
                ]}
              >
                {this.title}
              </Text>
            </View>
            //   {
            //   text: ,
            //   style: ,
            // }
          }
          rightComponent={
            <>
              {/* <IconButton
                source={require("../../../../assets/chat/call.png")}
                tintColor={"white"}
                onPress={() =>
                  this.props.navigation.getParam("admin")
                    ? null
                    : this.props.navigation.state.params.onAudioChat()
                }
                marginRight={15}
                width={20}
                height={20}
              /> */}
              {/* {this.props.navigation.getParam("admin") === true ? null : this
                  .state.user?.role === "USER" ? ( */}
              {/* <Icon
                name="exit-to-app"
                color={theme.colorAccent}
                size={28}
                onPress={() => this.logout()}
                // marginRight={15}
                // width={20}
                // height={20}
              /> */}

              <Icon
                name="call"
                color={theme.colorAccent}
                onPress={() => {
                  this.props.navigation.getParam("admin") === true
                    ? null
                    : this.state.user?.role == "USER"
                    ? chatStatus == "inactive"
                      ? null
                      : this.props.navigation.state.params.onAudioChat()
                    : this.props.navigation.state.params.onAudioChat();
                }}
                underlayColor="transparent"
                // marginRight={15}
                // width={20}
                // height={20}
              />
              {/* ) : (
             
              )} */}
            </>
          }
        />
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
        {this.props.navigation.getParam("admin") === true || longPress == true
          ? null
          : this.showRequest()}

        <Overlay
          isVisible={!!this.state.feedbackModalVisible}
          // onBackdropPress={() => {
          //   this.setState({ feedbackModalVisible: false });
          // }}
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
              <Text
                style={[
                  appStyles.h2,
                  {
                    fontFamily: theme.font.semibold,
                    padding: 0,
                    paddingTop: 10
                  }
                ]}
              >
                Feedback
              </Text>

              <View style={{ marginVertical: theme.size(20), width: "80%" }}>
                <Input
                  inputContainerStyle={{
                    borderBottomWidth: 0
                  }}
                  multiline={true}
                  placeholder={"Write your feedback here."}
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
                  onChangeText={feedback => this.setState({ feedback })}
                />
              </View>

              <View
                style={{
                  // flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "80%"
                }}
              >
                {/* <Button
                  title="Cancel"
                  buttonStyle={{
                    backgroundColor: theme.colorGrey,
                    borderRadius: theme.size(6)
                    //  marginLeftl:10
                  }}
                  titleStyle={{ color: theme.colorAccent }}
                  onPress={() => {
                    this.setState({
                      feedbackModalVisible: false,
                      selectedReason: ""
                    });
                    // props.updateVisible(null, 'remove');
                    // setRejectedModalVisible(true);
                  }}
                  containerStyle={{
                    width: "40%",
                    marginVertical: theme.size(10)
                  }}
                  linearGradientProps={null}
                /> */}

                <Button
                  title="Done"
                  buttonStyle={{
                    borderRadius: theme.size(6)

                    // marginRight:10,
                  }}
                  titleStyle={{ color: theme.colorAccent }}
                  onPress={async () => {
                    if (this.state.feedback) {
                      // let timer = `${this.state.minutesCounter} : ${
                      //   this.state.secondsCounter
                      // }`;
                      // if (Number(this.state.hoursCounter) > 0) {
                      //   timer = `${this.state.hoursCounter} : ${
                      //     this.state.minutesCounter
                      //   } : ${this.state.secondsCounter}`;
                      // }
                      this.setState({ feedbackModalVisible: false });

                      var ref = await fire
                        .database()
                        .ref(
                          "SessionsSummary/" +
                            `${this.state.user?.id}/` +
                            ` ${this.channel.participants[0]?.id ||
                              "id-missing"}`
                        )
                        .push();
                      ref
                        .set({
                          id: ref.key,
                          feedback: this.state.feedback,
                          date: Date(),
                          startTime: this.state.startTime,
                          endTime: Date(),
                          duration: "60",
                          clientName: this.channel.participants[0].name,
                          therapist: {
                            name: this.state.user?.name,
                            // email: this.props.user.email,
                            id: this.state.user?.id
                            // photo: this.state.user.photo
                          }
                        })
                        .then(res => {
                          this.setState({
                            // hoursCounter: "00",
                            minutesCounter: "00",
                            secondsCounter: "3600"
                          });
                          Snackbar("success", "Feedback Saved Succesfully");
                        });
                      ref = await fire
                        .database()
                        .ref(`users/${this.channel.participants[0]?.id}`);
                      let reciever = {};
                      let updates = {};
                      await ref.on("value", snap => {
                        if (snap.exists()) {
                          reciever = snap.val();
                        }
                      });

                      if (reciever.sessionRequested === true) {
                        reciever["sessionRequested"] = false;
                        reciever["enablePatientCall"] = "pending";
                        reciever["sessionsLeft"] = reciever.sessionsLeft - 1;
                        reciever["sessionsTaken"] =
                          (reciever.sessionsTaken || 0) + 1;
                      } else {
                        reciever["sessionRequested"] = false;
                        reciever["enablePatientCall"] = "pending";
                        reciever["sessionsTaken"] =
                          (reciever.sessionsTaken || 0) + 1;
                      }
                      updates[
                        `users/${this.channel.participants[0]?.id}`
                      ] = reciever;
                      await fire
                        .database()
                        .ref()
                        .update(updates);
                    } else {
                      Snackbar("error", "Please give some reason");
                    }
                  }}
                  containerStyle={{
                    width: "40%",
                    marginVertical: theme.size(10)
                  }}
                  ViewComponent={LinearGradient} // Don't forget this!
                  linearGradientProps={{
                    colors: [theme.colorGradientStart, theme.colorGradientEnd],
                    start: { x: 0, y: 0 },
                    end: { x: 2, y: 2 }
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </Overlay>

        {this.renderFooter()}
        <Chat
          user={
            this.props.navigation.getParam("admin") === true
              ? this.props.navigation.getParam("userPatient")
              : longPress == true
              ? this.props.navigation.getParam("user")
              : this.state.user
          }
          thread={this.state.thread}
          loading={this.state.loading}
          inputValue={this.state.inputValue}
          onAddMediaPress={this.onAddMediaPress}
          onAddAudioPress={this.onAddAudioPress}
          onSendInput={this.onSendInput}
          onChangeTextInput={this.onChangeTextInput}
          onLaunchCamera={this.onLaunchCamera}
          onOpenPhotos={this.onOpenPhotos}
          uploadProgress={this.state.uploadProgress}
          sortMediafromThread={this.sortMediafromThread()}
          isMediaViewerOpen={this.state.isMediaViewerOpen}
          selectedMediaIndex={this.state.selectedMediaIndex}
          onChatMediaPress={this.onChatMediaPress}
          onMediaClose={this.onMediaClose}
          groupSettingsActionSheetRef={this.groupSettingsActionSheetRef}
          privateSettingsActionSheetRef={this.privateSettingsActionSheetRef}
          audioRecord={this.state.playAudio}
          onAudioRecord={() => this._record()}
          onAudioRecordingState={this.state.recording}
          onAudioStop={() => this._stop()}
          onAudioPause={() => this._pause()}
          onAudioPlay={() => this._play()}
          onAudioCancel={() => this._cancel()}
          currentAudioTimeSeconds={this.state.currentTime}
          currentAudioTimeMinutes={this.state.minutesCounter}
          admin={this.props.navigation.getParam("admin")}
          channel={this.state.channel}
          longPress={longPress}
          footer={this.renderFooter}
          endReach={this.retrieveMore}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
        />
      </>
    );
  }
}

ChatScreen.propTypes = {
  thread: PropTypes.array,
  setChatThread: PropTypes.func,
  createThread: PropTypes.func,
  createChannel: PropTypes.func,
  user: PropTypes.object,
  setDisconnectCall: PropTypes.func,
  setEnableCall: PropTypes.func
};

const mapStateToProps = ({ chat }) => {
  return {
    // user: auth.users,
    thread: chat.thread
  };
};

export default connect(
  mapStateToProps,
  { setMediaChatReceivers }
)(ChatScreen);
