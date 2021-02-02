import * as React from "react";
import {
  Dimensions,
  DeviceEventEmitter,
  Platform,
  Text,
  StyleSheet
} from "react-native";
import Modal from "react-native-modal-patch";
import InCallManager from "react-native-incall-manager";
import { v4 as uuidv4 } from "uuid";
import { ReactReduxContext } from "react-redux";
import MediaChatTracker from "./tracker";
import AudioChatView from "./AudioChatView";
import { withNavigation } from "react-navigation";
import { AudioRecorder, AudioUtils } from "react-native-audio";
import firebase, { firestore } from "firebase";
const dimensions = Dimensions.get("window");
import moment, { duration } from "moment";
import RtcEngine, {
  AudioRecordingQuality,
  AudioSampleRateType,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode
} from "react-native-agora";
import { notificationManager } from "../../notifications/index";
import { setMediaChatReceivers, signalChatRoomParticipants } from "./firebase";

class AudioChat extends React.Component {
  static contextType = ReactReduxContext;

  static showVideoChatModal = () => {
    if (!AudioChat.modalVisible) {
      DeviceEventEmitter.emit("showVideoChatModal");
    }
  };

  static showAudioChatModal = () => {
    if (!AudioChat.modalVisible) {
      DeviceEventEmitter.emit("showAudioChatModal");
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      appId: "2deeb7b275644229b146207515b86e41",
      token:
        "006dcec86341d194cefb48a188cdedfc3e4IABRwUirHQURk6gRcgnHnYW9O3wcsMcHZbBJOGqcB6RG3QJkFYoAAAAAEABVr+wwAwC+XwEAAQADAL5f",
      channelName: "channel-x",
      joinSucceed: false,
      peerIds: [],
      messages: [],
      sendChannels: [],
      disconnected: false,
      enableSpeakerphone: false,
      room: null,
      connect: false,
      camera: true,
      mic: true,
      pc_config: {
        iceServers: [
          { urls: "stun:stun.services.mozilla.com" },
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "webrtc",
            username: "websitebeaver@mail.com"
          },

          {
            url: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com"
          }
        ]
      },
      remoteStreams: [], // holds all Video Streams (all remote streams)
      peerConnections: {}, // holds all Peer Connections
      selectedVideo: null,

      status: "Please wait...",
      modalVisible: false,
      localStream: null,
      //  remoteStreams: null,
      remoteStream: null,
      isComInitiated: true,
      peerConnectionStarted: false,
      isMuted: false,
      isSpeaker: false,
      hoursCounter: "00",
      minutesCounter: "00",
      secondsCounter: "00",
      initialCallState: "Calling",
      candidate: null,
      remoteON: null,
      rStream: null,
      answerCall: false,
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: false
        }
      },
      startAudio: false,
      hasPermission: false,
      currentTime: 0.0,
      recording: false,
      paused: false,
      stoppedRecording: false,
      finished: false,
      audioPath:
        Platform.OS === "ios"
          ? AudioUtils.MainBundlePath + `/.aac`
          : AudioUtils.DocumentDirectoryPath + `/.aac`,
      playAudio: false
    };
    this.sdp;
    this.candidates = [];
    this.socket = null;
    this.peerConnections = {};
    this.modalVisible = false;
    this.timerInterval = null;
    this.hasChatRoomSubscribe = false;
    this.callAccepted = false;
    this.callRequested = false;
    this.sentOffersId = [];
    this.chatTimeout = 29000;
    // this.chatTimeout = 26000; /single
    this.activeChatRoomParticipants = [];
    this.readConnectionIds = [];
  }

  componentDidMount() {
    const { user } = this.props;

    if (user?.role == "USER") {
      firebase
        .database()
        .ref(`users/${user._id}`)
        .on("value", snap => {
          if (snap.exists()) {
            this.setState({ sessionEnded: snap.val() });
          }
        });
    }

    this.mediaChatTracker = new MediaChatTracker(
      this.context.store,
      user.id || user.userID,
      this.chatTimeout
    );

    this.init();

    this.mediaChatTracker.subscribe();
  }

  init = async () => {
    const { appId } = this.state;
    this._engine = await RtcEngine.create(appId);
    await this._engine.disableVideo();

    this._engine.addListener("Warning", warn => {
      console.log("Warning", warn);
    });

    this._engine.addListener("Error", err => {
      console.log("Error", err);
    });

    this._engine.addListener("UserJoined", (uid, elapsed) => {
      console.log("UserJoined", uid, elapsed);
      // Get current peer IDs
      const { peerIds } = this.state;
      // If new user
      // @ts-ignore
      if (peerIds.indexOf(uid) === -1) {
        this.setState({
          // Add peer ID to state array
          peerIds: [...peerIds, uid]
        });
      }

      if (this.state.peerIds.length == 1) {
        console.log("ads", this.state.peerIds.length);

        this.setState({
          isComInitiated: true,
          peerConnectionStarted: true,
          initialCallState: "Connecting",
          remoteStream: true
        });

        this.onTimerStart();
        InCallManager.stopRingtone();
        InCallManager.stopRingback();

        //    this.createAnswer1()
        //InCallManager.start({ media: "audio" });
      }
    });

    this._engine.addListener("UserOffline", (uid, reason) => {
      console.log("UserOffline", uid, reason);
      const { peerIds } = this.state;
      this.setState({
        // Remove peer ID from state array
        peerIds: peerIds.filter(id => id !== uid)
      });
    });

    // If Local user joins RTC channel
    this._engine.addListener("JoinChannelSuccess", (channel, uid, elapsed) => {
      console.log("JoinChannelSuccess", channel, uid, elapsed);
      // Set state variable to true
      this.setState({
        joinSucceed: true
      });
    });
  };

  startCall = async callstart => {
    // Join Channel using null token and channel name
    if (callstart == false) {
      InCallManager.start({ media: "audio", ringback: "_DTMF_" });
    }

    const room = this.props.channelId;

    await this._engine?.joinChannel(null, room, null, 0).then(async () => {
      await this._engine?.startAudioRecording(
        this.state.audioPath,
        AudioSampleRateType.Type32000,
        AudioRecordingQuality.Medium
      );
    });

    // this.noAnswerTimer = setTimeout(() => {
    //   if (callstart != true) {
    //     console.log("HMMMM", callstart);
    //     this.endCall();
    //   }
    // }, this.chatTimeout - 1000);
  };

  componentWillUnmount() {
    this.mediaChatTracker.unsubscribe();
  }

  componentDidUpdate(prevProps) {
    this.onComponentVisibilityChange(prevProps);
    this.onChannelDataChange(prevProps);
  }

  onComponentVisibilityChange = prevProps => {
    if (this.props.isMediaChatVisible !== prevProps.isMediaChatVisible) {
      this.setState({
        modalVisible: this.props.isMediaChatVisible
      });
      this.modalVisible = this.props.isMediaChatVisible;
      if (!this.props.isMediaChatVisible) {
        if (!this.props.mediaChatData) {
          InCallManager.stop({ busytone: "_DTMF_" });
        }
        this.onEndCall();
      }
    }
  };

  onChannelDataChange = prevProps => {
    if (
      this.props.mediaChatData &&
      prevProps.mediaChatData !== this.props.mediaChatData
    ) {
      if (this.props.mediaChatData.message) {
        this.readChannelData(this.props.mediaChatData);
      }
    }
  };

  handleChannelDataAvailability = () => {
    if (this.props.mediaChatData) {
      //  InCallManager.startRingtone("_DEFAULT_");
      this.setState({
        isComInitiated: false
      });
    } else {
      if (this.props.chatType === "video") {
        InCallManager.start({ media: "audio/video", ringback: "_DTMF_" });
      } else {
        //  InCallManager.start({ media: "audio", ringback: "_DTMF_" });
      }
    }
  };

  // getLocalStream = async () => {
  //   const isFront = true;
  //   const devices = await mediaDevices.enumerateDevices();

  //   const facing = isFront ? "front" : "environment";
  //   const videoSourceId = devices.find(
  //     device => device.kind === "videoinput" && device.facing === facing
  //   );
  //   const facingMode = isFront ? "user" : "environment";
  //   let constraints = {
  //     audio: true,
  //     video: {
  //       mandatory: {
  //         minWidth: 500,
  //         minHeight: 300,
  //         width: WIDTH,
  //         height: HEIGHT,
  //         minFrameRate: 30
  //       },
  //       facingMode,
  //       optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
  //     }
  //   };
  //   if (this.props.chatType === "audio") {
  //     constraints = {
  //       audio: true,
  //       video: false
  //     };
  //   }

  //   console.log(constraints, "lol");

  //   const newLocalStream = await mediaDevices.getUserMedia(constraints);

  //   return newLocalStream;
  // };

  onCallConnectionDataSubscribe = data => {
    const enable = this.callAccepted || this.callRequested;

    data.forEach(dataItem => {
      const haveRead = this.readConnectionIds.includes(dataItem.id);
      if (!haveRead && enable) {
        this.readChannelData(dataItem);
      }
    });
  };

  broadcastPushNotificationsAudio = (inputValue, admin, type) => {
    const channel = admin;
    const participants = channel;
    if (!participants || participants.length == 0) {
      return;
    }
    const sender = this.props.user;
    const fromTitle = sender.name;
    var message = inputValue;

    participants.forEach(participant => {
      if (
        participant.id != this.props.user?.id ||
        participant.jwt != this.props.user?.jwt ||
        participant._id != this.props.user?._id
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

  onModalShow = async () => {
    const { user, channelId } = this.props;
    const userId = user.id || user.userID;

    clearTimeout(this.noAnswerTimer);

    // this.mediaChatTracker.subscribeCallConnectionData(
    //   { channelId, userId },
    //   this.onCallConnectionDataSubscribe
    // );

    if (this.props.mediaChatData) {
      InCallManager.startRingtone("_DEFAULT_");

      this.setState({
        isComInitiated: false
      });

      // this.noAnswerTimer = setTimeout(() => {
      //   this.onEndCall();
      // }, this.chatTimeout - 1000);
    } else {
      // if (this.props.chatType === "video") {
      //   InCallManager.start({ media: "audio/video", ringback: "_DTMF_" });
      // } else {
      // //  InCallManager.start({ media: "audio", ringback: "_DTMF_" });
      // }
      // // signal for communication from user(s)
      this.noAnswerTimer = setTimeout(() => {
        console.log("helllooooo");
        if (this.state.peerIds.length != 1) {
          InCallManager.stop({ busytone: "_DEFAULT_" });
          InCallManager.stopRingtone();
          InCallManager.stopRingback();
          this.endCall();
          this.broadcastPushNotificationsAudio(
            `${this.props.user?.name} tried to call you`,
            this.props.audioVideoChatReceivers,
            "disable"
          );
        }
      }, 60000);
      this.tryToRequestCommunication();
    }
  };

  getPeerConnection = id => {
    const { user, chatType, channelId } = this.props;
    const userId = user.id || user.userID;
    const messageData = {
      senderId: userId,
      receiverId: id,
      type: chatType,
      channelId: channelId
    };

    if (this.peerConnections[id]) {
      return this.peerConnections[id];
    }
    // const pc = new RTCPeerConnection(servers);
    //  this.peerConnections[id] = pc;
    //  pc.addStream(this.state.localStream);
    // pc.onicecandidate = evnt => {
    //   console.log(evnt.candidate, "evbtt");
    //   evnt.candidate
    //     ? this.mediaChatTracker.addCallConnectionData({
    //         ...messageData,
    //         message: {
    //           ice: evnt.candidate.toJSON()
    //         }
    //       })
    //     : console.log("Sent All Ice");

    //   this.setState({ candidate: evnt.candidate });
    // };
    // pc.onaddstream = evnt => {
    //   console.log(evnt.stream, "ONADDSTREAM");
    // setTimeout(() => {
    //   this.setState(
    //     {
    //       rStream: evnt.stream,
    //       remoteStreams: {
    //         ...this.state.remoteStreams,
    //         [id]: evnt.stream
    //       }
    //     },
    //     async () => {
    //       if (
    //         this.props.chatType === "audio" ||
    //         this.props.chatType === "video"
    //       ) {
    //         this.onTimerStart();
    //       }
    //     }
    //   );
    // })

    // };
    return pc;
  };

  tryToRequestCommunication = () => {
    this.requestCall();
  };

  requestCall = async () => {
    this.callRequested = true;
    const { user, channelId } = this.props;
    const userId = user.id || user.userID;

    // this.mediaChatTracker.cleanChatRoomParticipants(channelId);
    // this.mediaChatTracker.addChatRoomParticipants({ channelId, userId });
    //this.subscribeChatRoomParticipants();
    this.sendOffer();

    this.signalReceivers("request", this.props.chatType);
    // this.noAnswerTimer = setTimeout(() => {
    //   if (!this.callAccepted) {
    //     this.endCall();
    //   }
    // }, this.chatTimeout - 1000);
  };

  signalReceivers = async (status, chatType) => {
    // createOffer = () => {
    if (!this.props.canReceiveMediaData) {
      return;
      //   // InCallManager.start({ media: "audio", ringback: "_DTMF_" });
    }
    //   // initiates the creation of SDP

    //   this.pc.createOffer(this.state.sdpConstraints).then(sdp => {
    const {
      //     //offer is made and if it is success then we send the sdp to localdesciotion
      audioVideoChatReceivers,
      //     console.log(JSON.stringify(sdp, "offerrr"));
      user,
      //     // set offer sdp as local description
      channelId,
      //     this.pc.setLocalDescription(sdp);
      channelTitle
      //     console.log("STOPRINNNGGG");
    } = this.props;
    //     this.callAccepted = true;

    //     this.onTimerStart();
    const participantsId = audioVideoChatReceivers.map(
      //     InCallManager.stop();
      receiver => receiver.id || receiver.userID
      //     //  InCallManager.start({ media: "audio", ringback: "_DTMF_" });
    );
    //     this.sendToPeer("offerOrAnswer", sdp);
    const recieverData = [
      //   });
      {
        // };
        name: audioVideoChatReceivers[0].name,
        id: audioVideoChatReceivers[0].id,
        email: audioVideoChatReceivers[0].email,
        phone: audioVideoChatReceivers[0].phone,
        role: audioVideoChatReceivers[0].role
        //  image: 'yooo',
      }
    ];

    const senderData = {
      name: user.name,
      id: user.id || user.userID,
      email: user.email,
      phone: user.phone,
      role: user.role
      // image: 'heyy',
    };
    const currentDate = new Date();
    const currentMiliSeconds = currentDate.getTime();
    const newData = {
      participantsId,
      channelId,
      channelTitle,
      senderId: user.id || user.userID,
      sender: senderData,
      receiver: recieverData,
      type: chatType,
      status,
      id: uuidv4(),
      createdAt: { miliSeconds: currentMiliSeconds }
    };

    await signalChatRoomParticipants(newData);
  };

  createOffer = () => {
    // InCallManager.start({ media: "audio", ringback: "_DTMF_" });
    // initiates the creation of SDP
    this.pc.createOffer(this.state.sdpConstraints).then(sdp => {
      //offer is made and if it is success then we send the sdp to localdesciotion

      // set offer sdp as local description
      this.pc.setLocalDescription(sdp);

      this.callAccepted = true;
      this.onTimerStart();
      InCallManager.stop();
      //  InCallManager.start({ media: "audio", ringback: "_DTMF_" });
      this.sendToPeer("offerOrAnswer", sdp);
    });
  };

  // createOffer = () => {

  //   // InCallManager.start({ media: "audio", ringback: "_DTMF_" });
  //   // initiates the creation of SDP
  //   this.pc.createOffer(this.state.sdpConstraints).then(sdp => {
  //     //offer is made and if it is success then we send the sdp to localdesciotion
  //     console.log(JSON.stringify(sdp, "offerrr"));
  //     // set offer sdp as local description
  //     this.pc.setLocalDescription(sdp);
  //     console.log("STOPRINNNGGG");
  //     this.callAccepted = true;
  //     this.onTimerStart();
  //     InCallManager.stop();
  //     //  InCallManager.start({ media: "audio", ringback: "_DTMF_" });
  //     this.sendToPeer("offerOrAnswer", sdp);
  //   });
  // };

  createAnswer1 = async callStarted => {
    //  InCallManager.stopRingtone();
    //InCallManager.stopRingback();
    this.setState({ remoteON: true });

    this.startCall(true);
  };

  handleNewParticipants = updatedParticipants => {
    if (!this.modalVisible) {
      return;
    }
    const { user } = this.props;
    const remoteStreams = this.state.remoteStreams;
    const userId = user.id || user.userID;
    let offerReceivers = [];
    const exitedParticipants = [];
    const activeParticipants = [...this.activeChatRoomParticipants];
    let sentOffersId = [...this.sentOffersId];

    const sortedParticipants = updatedParticipants.sort((a, b) => {
      if (!a.createdAt) {
        return -1;
      }
      if (!b.createdAt) {
        return 1;
      }
      a = new Date(a.createdAt.seconds);
      b = new Date(b.createdAt.seconds);
      return a > b ? -1 : a < b ? 1 : 0;
    });

    const userIndexAfterSorted = sortedParticipants.findIndex(
      participant => participant.participantId === userId
    );

    if (userIndexAfterSorted > -1) {
      offerReceivers = sortedParticipants.slice(0, userIndexAfterSorted);
      this.offerReceivers = sortedParticipants.slice(0, userIndexAfterSorted);
    }

    offerReceivers.forEach(receiver => {
      this.sendOffer(receiver.participantId);
      this.callAccepted = true;
    });

    activeParticipants.forEach(activeParticipant => {
      const stillActiveParticipant = updatedParticipants.find(
        updatedParticipant =>
          activeParticipant.participantId === updatedParticipant.participantId
      );
      if (!stillActiveParticipant && activeParticipant) {
        exitedParticipants.push(activeParticipant);
      }
    });

    if (remoteStreams) {
      exitedParticipants.forEach(exitedParticipant => {
        if (this.peerConnections[exitedParticipant.participantId]) {
          this.peerConnections[exitedParticipant.participantId].close();
          delete this.peerConnections[exitedParticipant.participantId];
        }
        delete remoteStreams[exitedParticipant.participantId];
        sentOffersId = sentOffersId.filter(
          connectionId => connectionId !== exitedParticipant.participantId
        );
      });

      this.setState({
        remoteStreams
      });
    }

    if (this.callAccepted || this.callRequested) {
      this.activeChatRoomParticipants = [...sortedParticipants];
      this.sentOffersId = sentOffersId;
    }
  };

  sendOffer = async participantId => {
    const alreadySent = this.sentOffersId.includes(participantId);

    if (alreadySent) {
      return;
    }

    const { user, chatType, channelId } = this.props;
    const userId = user.id || user.userID;
    const messageData = {
      senderId: userId,
      receiverId: participantId,
      type: chatType,
      channelId: channelId
    };
    if (this.callAccepted || this.callRequested) {
      // this._record();
      this.startCall(false);
      //  const pc = this.getPeerConnection(participantId);
      //  this.sentOffersId = [...this.sentOffersId, participantId];

      try {
        //   const offer = await pc.createOffer(this.state.sdpConstraints);
        //   await pc.setLocalDescription(offer);
        // await this.mediaChatTracker.addCallConnectionData({
        //   ...messageData
        //   //  message: { sdp: pc.localDescription.toJSON() }
        // });
      } catch (err) {
        console.error(err);
      }

      if (!this.state.peerConnectionStarted) {
        this.setState({
          peerConnectionStarted: true
        });
      }
    }
  };

  sendChannelData = async (receiverId, data, chatType) => {
    if (!this.props.canReceiveMediaData) {
      return;
    }
    const {
      user,
      channelId,
      channelTitle,
      audioVideoChatReceivers
    } = this.props;

    const recieverData = [
      {
        name: audioVideoChatReceivers[0].name,
        id: audioVideoChatReceivers[0].id,
        email: audioVideoChatReceivers[0].email,
        phone: audioVideoChatReceivers[0].phone,
        role: audioVideoChatReceivers[0].role
        //   image: 'yooo',
      }
    ];

    const senderData = {
      name: user.name,
      id: user.id || user.userID,
      email: user.email,
      phone: user.phone,
      role: user.role
      //  image: 'heyy',
    };
    const currentDate = new Date();
    const currentMiliSeconds = currentDate.getTime();
    const newData = {
      receiverId,
      senderId: user.id || user.userID,
      sender: senderData,
      message: data,
      channelId,
      channelTitle,
      receiver: recieverData,
      type: chatType,
      id: uuidv4(),
      status: "active",
      createdAt: { miliSeconds: currentMiliSeconds }
    };

    await setMediaChatReceivers(newData);
  };

  readChannelData = async data => {
    if (this.callAccepted || this.callRequested) {
      const { message, receiverId, senderId, id } = data;
      const { user, chatType, channelId } = this.props;
      // const pc = this.getPeerConnection(senderId);
      const userId = user.id || user.userID;
      const messageData = {
        senderId: userId,
        receiverId: senderId,
        type: chatType,
        channelId: channelId
      };

      this.readConnectionIds = [...this.readConnectionIds, id];

      const dataMessage = message;

      // try {
      //   if (receiverId === userId) {
      //     if (dataMessage.ice !== undefined) {
      //       await pc.addIceCandidate(new RTCIceCandidate(dataMessage.ice));
      //     } else if (dataMessage.sdp.type === "offer") {
      //       await pc.setRemoteDescription(
      //         new RTCSessionDescription(dataMessage.sdp)
      //       );
      //       const answer = await pc.createAnswer(this.state.sdpConstraints);
      //       await pc.setLocalDescription(answer);
      //       console.log("create answer");
      //       await this.mediaChatTracker.addCallConnectionData({
      //         ...messageData,
      //         message: { sdp: pc.localDescription.toJSON() }
      //       });
      //     } else if (dataMessage.sdp.type === "answer") {
      //       await pc.setRemoteDescription(
      //         new RTCSessionDescription(dataMessage.sdp)
      //       );
      //     }
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
    }
  };

  switchCamera = () => {
    this.state.localStream
      .getVideoTracks()
      .forEach(track => track._switchCamera());
  };

  onTimerStart = () => {
    this.timerInterval = setInterval(() => {
      if (this.props.user?.role == "USER") {
        if (this.state.sessionEnded.enablePatientCall === false) {
          this.endCall();
        } else {
          console.log("fire");
        }
      }
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

    //   this._record();
  };

  toggleSpeaker = () => {
    const { enableSpeakerphone } = this.state;
    this._engine
      ?.setEnableSpeakerphone(!enableSpeakerphone)
      .then(() => {
        this.setState({ enableSpeakerphone: !enableSpeakerphone });
      })
      .catch(err => {
        console.warn("setEnableSpeakerphone", err);
      });
    // this.setState(
    //   prevState => ({
    //     isSpeaker: !prevState.isSpeaker
    //   }),
    //   () => {
    //     if (this.state.isSpeaker) {
    //       InCallManager.setForceSpeakerphoneOn(true);
    //     } else {
    //       InCallManager.setForceSpeakerphoneOn(null);
    //     }
    //   }
    // );
  };

  toggleMute = () => {
    const { remoteStreams, localStream } = this.state;
    if (!remoteStreams) return;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    this.setState(prevState => ({
      isMuted: !prevState.isMuted
    }));
  };

  onAcceptCall = async () => {
    this.callAccepted = true;
    const { user, channelId } = this.props;
    const userId = user.id || user.userID;
    this.setState(
      {
        isComInitiated: true,
        peerConnectionStarted: true,
        initialCallState: "Connecting"
      },
      async () => {
        InCallManager.stopRingtone();

        //    this.createAnswer1()
        InCallManager.start({ media: "audio" });

        this.mediaChatTracker.addChatRoomParticipants({
          channelId,
          userId
        });

        this.subscribeChatRoomParticipants();
      }
    );
  };

  subscribeChatRoomParticipants = async () => {
    const { user, channelId } = this.props;
    const userId = user.id || user.userID;

    await this.mediaChatTracker.subscribeChatRoomParticipants(
      { channelId, userId },
      participants => {
        this.handleNewParticipants(participants);
      }
    );
  };

  uploadAudio = async () => {
    let storageRef = firebase.storage().ref("audio/call");
    const filename =
      this.props.audioVideoChatReceivers[0].role +
      " : " +
      this.props.audioVideoChatReceivers[0].name +
      " - " +
      this.props.user.role +
      " : " +
      this.props.user.name +
      " - " +
      moment().format("MMMM Do YYYY, h:mm:ss a") +
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
        if (this.props.audioVideoChatReceivers[0]?.role == "THERAPIST") {
          if (
            this.state.hoursCounter === "00" &&
            this.state.minutesCounter === "00" &&
            this.state.secondsCounter === "00"
          ) {
          } else {
            const url = await snapshot.ref.getDownloadURL();

            const patientData = {
              name: this.props.user?.name,
              id: this.props.user?.id || this.props.user?._id,
              email: this.props.user?.email,
              role: this.props.user?.role
              //  photo: this.props.user.photo
            };

            const therapistData = {
              name: this.props.audioVideoChatReceivers[0]?.name,
              id:
                this.props.audioVideoChatReceivers[0]?.id ||
                this.props.audioVideoChatReceivers[0]?._id,
              email: this.props.audioVideoChatReceivers[0]?.email,
              role: this.props.audioVideoChatReceivers[0]?.role
              //   photo: this.props.audioVideoChatReceivers[0].photo
            };

            let timer = `${this.state.minutesCounter} : ${
              this.state.secondsCounter
            }`;
            if (Number(this.state.hoursCounter) > 0) {
              timer = `${this.state.hoursCounter} : ${
                this.state.minutesCounter
              } : ${this.state.secondsCounter}`;
            }

            const data = {
              participant: patientData,
              user: therapistData,
              url: url,
              sessionStarted: firebase.firestore.FieldValue.serverTimestamp(),
              duration: timer
            };

            firebase
              .firestore()
              .collection("call-records")
              .doc(
                this.props.audioVideoChatReceivers[0]?.id ||
                  this.props.audioVideoChatReceivers[0]?._id
              )
              .collection("call-records")
              .add({ ...data })
              .then(() => {
                this.setState({
                  hoursCounter: "00",
                  minutesCounter: "00",
                  secondsCounter: "00"
                });
              });
          }
        }
      })
      .catch(e => {
        alert("Oops! An error has occured. Please try again.");
        console.log(e, "eroor");
      });
  };

  onEndCall = async () => {
    this.mediaChatTracker.unsubscribeChatRoomParticipants(this.props.channelId);

    await this._engine?.stopAudioRecording().then(item => {
      if (this.props.audioVideoChatReceivers[0]?.role == "THERAPIST") {
        this.uploadAudio();
      }
    });
    await this._engine?.leaveChannel();
    this.setState({ peerIds: [], joinSucceed: false });
    this.modalVisible = false;
    InCallManager.stopRingtone();
    InCallManager.stopRingback();

    if (
      this.props.mediaChatData &&
      this.props.mediaChatData.status === "cancel" &&
      !this.state.remoteStreams
    ) {
      InCallManager.stop({ busytone: "_DEFAULT_" });
    } else {
      InCallManager.stop();
    }

    if (this.state.localStream && this.state.localStream.getTracks) {
      this.state.localStream.getTracks().forEach(track => track.stop());
      this.state.localStream.release();
    }

    Object.keys(this.peerConnections).forEach(id => {
      if (this.peerConnections[id]) {
        this.peerConnections[id].close();
      }
    });
    this.peerConnections = {};

    this.resetModalState();
  };

  setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  };

  resetModalState = () => {
    if (this.props.user.role === "THERAPIST") {
      if (
        this.state.hoursCounter === "00" &&
        this.state.minutesCounter === "00" &&
        this.state.secondsCounter === "00"
      ) {
        console.log("NOTHING");
      } else {
        // this.setState({ feedbackModalVisible: true });
      }
    }

    this.setState({
      peerConnectionStarted: false,
      //  remoteStreams: null,
      localStream: null,
      modalVisible: false,
      isComInitiated: true,
      isMuted: false,
      isSpeaker: false,
      hoursCounter: "00",
      minutesCounter: "00",
      secondsCounter: "00",
      initialCallState: "Calling",
      remoteON: null,
      answerCall: false,
      remoteStream: null,

      connect: false,
      peerConnections: {},
      remoteStreams: [],

      selectedVideo: null
    });
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.hasChatRoomSubscribe = false;
    this.callAccepted = false;
    this.callRequested = false;
    this.sentOffersId = [];
    this.readConnectionIds = [];
    this.mediaChatTracker.onMediaChatDismiss();
  };

  endCall = () => {
    if (this.modalVisible) {
      if (this.activeChatRoomParticipants.length < 3) {
        this.signalReceivers("cancel", this.props.chatType);
        this.mediaChatTracker.cleanChatRoomParticipants(this.props.channelId);
      }

      this.onEndCall();
    }
  };

  renderTimer = () => {
    let timer = `${this.state.minutesCounter} : ${this.state.secondsCounter}`;
    if (Number(this.state.hoursCounter) > 0) {
      timer = `${this.state.hoursCounter} : ${this.state.minutesCounter} : ${
        this.state.secondsCounter
      }`;
    }
    return <Text style={styles.timer}>{timer}</Text>;
  };

  render() {
    const { audioVideoChatReceivers, chatType, channelTitle } = this.props;
    const {
      isComInitiated,
      minutesCounter,
      hoursCounter,
      secondsCounter,
      initialCallState
    } = this.state;

    return (
      <Modal
        onDismiss={this.endCall}
        onShow={this.onModalShow}
        visible={this.state.modalVisible}
        onRequestClose={this.endCall}
        animationType={"fade"}
        presentationStyle={"pageSheet"}
      >
        {(!this.state.remoteStream || chatType === "audio") && (
          <>
            <AudioChatView
              initialCallState={initialCallState}
              audioVideoChatReceivers={audioVideoChatReceivers}
              channelTitle={channelTitle}
              remoteStreams={this.state.remoteStream}
              hoursCounter={hoursCounter}
              minutesCounter={minutesCounter}
              secondsCounter={secondsCounter}
              isComInitiated={isComInitiated}
              remoteON={this.state.remoteON}
              localStream={this.state.localStream}
              //    recordCall={() => this._record()}
              isSpeaker={this.state.enableSpeakerphone}
              toggleSpeaker={this.toggleSpeaker}
              endCall={this.endCall}
              onAcceptCall={this.createAnswer1}
            />
          </>
        )}
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row"
  },
  timer: {
    marginTop: 10,
    color: "white",
    fontSize: 20,
    zIndex: 1,
    textAlign: "center"
  },
  button: {
    margin: 5,
    paddingVertical: 10,
    backgroundColor: "#ccc",
    borderRadius: 20
    // paddingLeft: 20,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Avenir"
  },
  videoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  },
  rctView: {
    width: 100,
    height: 200,
    backgroundColor: "black"
  },
  scrollView: {
    flex: 1,
    // backgroundColor: 'teal',
    padding: 15
  },
  rtcRemote: {
    width: dimensions.width - 30,
    height: 200,
    backgroundColor: "black"
  }
});

export default withNavigation(AudioChat);
