import { DeviceEventEmitter } from "react-native";
import {
  subscribeVideoChat,
  subscribeAudioChat,
  subscribeChatRoomParticipants,
  subscribeCallConnectionData,
  exitAudioVideoChatRoom,
  addChatRoomParticipants,
  addCallConnectionData,
  updateChatRoomStatus,
  cleanChatRoomParticipants
} from "./firebase";
import {
  setMediaChatReceivers,
  setIsMediaChatVisible,
  setMediaChatData,
  setCanRecieveMediaChatData
} from "../../../store/actions/audioActions";

export default class MediaChatTracker {
  constructor(reduxStore, userID, chatTimeout) {
    this.reduxStore = reduxStore;
    this.userID = userID;
    this.chatTimeout = chatTimeout;
    this.state = reduxStore.getState();
    this.reduxStore.subscribe(this.syncTrackerToStore);
    this.isAudioChatVisible = false;
    this.isVideoChatVisible = false;
  }

  syncTrackerToStore = () => {
    this.state = this.reduxStore.getState();
  };

  subscribe() {
    this.videoModalSubscription = DeviceEventEmitter.addListener(
      "showVideoChatModal",
      this.displayVideoChat
    );
    this.audioModalSubscription = DeviceEventEmitter.addListener(
      "showAudioChatModal",
      this.displayAudioChat
    );
    this.videoChatUnsubscribe = subscribeVideoChat(
      this.userID,
      this.chatTimeout,
      this.onVideoChatDataUpdate
    );
    this.audioChatUnsubscribe = subscribeAudioChat(
      this.userID,
      this.chatTimeout,
      this.onAudioChatDataUpdate
    );
  }

  unsubscribe = () => {
    if (this.videoChatUnsubscribe) {
      this.videoChatUnsubscribe();
    }
    if (this.audioChatUnsubscribe) {
      this.audioChatUnsubscribe();
    }
    if (this.videoModalSubscription) {
      this.videoModalSubscription.remove();
    }
    if (this.audioModalSubscription) {
      this.audioModalSubscription.remove();
    }
  };

  subscribeChatRoomParticipants = (data, callback) => {
    // console.log(data, 'subscribechatroom');
    this.chatRoomParticipantsUnsubscribe = subscribeChatRoomParticipants(
      data,
      participants => {
        //   console.log(participants, 'subb');
        callback(participants);
      }
    );
  };

  subscribeCallConnectionData = (data, callback) => {
    // console.log(data, 'subsribe', callback);
    this.callConnectionDataUnsubscribe = subscribeCallConnectionData(
      data,
      data => {
        // console.log(data, 'zxc');
        callback(data);
      }
    );
  };

  cleanChatRoomParticipants = data => {
    return cleanChatRoomParticipants(data);
  };

  addChatRoomParticipants = data => {
    // console.log(data, 'addchat');
    addChatRoomParticipants(data);
  };

  addCallConnectionData = data => {
    //  console.log(data.message, "ADD CONNECTION DATA")
    addCallConnectionData(data);
  };

  updateChatRoomStatus = (channelId, status) => {
    // console.log(status, 'updatechatstat');
    updateChatRoomStatus(channelId, status);
  };

  unsubscribeChatRoomParticipants = async channelId => {
    await exitAudioVideoChatRoom({ channelId, userId: this.userID });
    if (this.chatRoomParticipantsUnsubscribe) {
      await this.chatRoomParticipantsUnsubscribe();
    }
    if (this.callConnectionDataUnsubscribe) {
      await this.callConnectionDataUnsubscribe();
    }
  };

  onVideoChatDataUpdate = async data => {
    if (this.isAudioChatVisible) {
      return;
    }

    this.onMediaChatDataUpdate(data);
  };

  onAudioChatDataUpdate = async data => {
    if (this.isVideoChatVisible) {
      return;
    }

    this.onMediaChatDataUpdate(data);
  };

  onMediaChatDataUpdate = async data => {
    if (data.length > 0) {
      const videoData = data[0];

      if (videoData.receiverId === this.userID) {
        await this.reduxStore.dispatch(
          setMediaChatReceivers({
            receivers:
              videoData.receiver.length > 1
                ? videoData.receiver
                : [videoData.sender],
            type: videoData.type,
            channelId: videoData.channelId,
            channelTitle: videoData.channelTitle,
            Qasim: "QASIMM YOOO"
          })
        );
        if (videoData.status === "cancel") {
          this.reduxStore.dispatch(setIsMediaChatVisible(false));
          return;
        }
        if (
          this.state.audioChat.canReceiveMediaData &&
          videoData.status !== "cancel"
        ) {
          await this.reduxStore.dispatch(setMediaChatData(videoData));
        }

        if (videoData.status === "request") {
          await this.reduxStore.dispatch(setIsMediaChatVisible(true));
        }
      }
    }
  };

  displayVideoChat = () => {
    this.isVideoChatVisible = true;
    this.displayMediaChat();
  };

  displayAudioChat = () => {
    this.isAudioChatVisible = true;
    this.displayMediaChat();
  };

  displayMediaChat = async () => {
    await this.reduxStore.dispatch(setMediaChatData(null));
    await this.reduxStore.dispatch(setIsMediaChatVisible(true));
  };

  onMediaChatDismiss = async () => {
    this.isVideoChatVisible = false;
    this.isAudioChatVisible = false;
    await this.reduxStore.dispatch(setMediaChatData(null));
    await this.reduxStore.dispatch(setIsMediaChatVisible(false));
    await this.reduxStore.dispatch(setCanRecieveMediaChatData(false));
    setTimeout(
      () => this.reduxStore.dispatch(setCanRecieveMediaChatData(true)),
      1000
    );
  };
}
