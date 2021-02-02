import React, { useState, useRef } from "react";
import { Alert, SafeAreaView, View, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";
import ActionSheet from "react-native-actionsheet";

import TNMediaViewerModal from "../../TNMediaViewerModal/index";
import DialogInput from "react-native-dialog-input";
import BottomInput from "./BottomInput";
import MessageThread from "./MessageThread";
import styles from "./styles";
import theme from "../../../styles/variables";
function Chat(props) {
  const {
    onSendInput,
    thread,
    loading,
    inputValue,
    onChangeTextInput,
    user,
    onLaunchCamera,
    onOpenPhotos,
    onAddMediaPress,
    uploadProgress,
    sortMediafromThread,
    isMediaViewerOpen,
    selectedMediaIndex,
    onChatMediaPress,
    onMediaClose,
    onSenderProfilePicturePress,
    audioRecord,
    onAudioRecord,
    onAudioRecordingState,
    onAudioStop,
    onAudioPause,
    onAudioPlay,
    onAudioCancel,
    currentAudioTimeSeconds,
    currentAudioTimeMinutes,
    admin,
    channel,
    longPress,
    renderFooter,
    retrieveMore,
    onEndReached,
    onMomentumScrollBegin
  } = props;

  const photoUploadDialogRef = useRef();

  const onChangeText = text => {
    onChangeTextInput(text);
  };

  const onSend = () => {
    onSendInput();
  };

  const onPhotoUploadDialogDone = index => {
    if (index == 0) {
      onLaunchCamera();
    }

    if (index == 1) {
      onOpenPhotos();
    }
  };

  if (loading == true) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        color={theme.colorGrey}
        size="large"
      />
    );
  } else {
    return (
      <View style={styles.personalChatContainer}>
        <MessageThread
          thread={thread}
          user={user}
          onChatMediaPress={onChatMediaPress}
          onSenderProfilePicturePress={onSenderProfilePicturePress}
          footer={renderFooter}
          endReach={retrieveMore}
          onEndReached={onEndReached}
          onMomentumScrollBegin={onMomentumScrollBegin}
        />
        <BottomInput
          uploadProgress={uploadProgress}
          value={inputValue}
          onChangeText={onChangeText}
          onSend={onSend}
          onAddMediaPress={() => onAddMediaPress(photoUploadDialogRef)}
          audioRecord={audioRecord}
          onAudioRecord={onAudioRecord}
          onAudioRecordingState={onAudioRecordingState}
          onAudioStop={onAudioStop}
          onAudioPause={onAudioPause}
          onAudioPlay={onAudioPlay}
          onAudioCancel={onAudioCancel}
          currentAudioTimeSeconds={currentAudioTimeSeconds}
          currentAudioTimeMinutes={currentAudioTimeMinutes}
          admin={admin}
          user={user}
          channel={channel}
          longPress={longPress}
        />

        <ActionSheet
          title={"Are you sure?"}
          options={["Confirm", "Cancel"]}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
        />

        <ActionSheet
          ref={photoUploadDialogRef}
          title={"Photo Upload"}
          options={["Launch Camera", "Open Photo Gallery", "Cancel"]}
          cancelButtonIndex={2}
          onPress={onPhotoUploadDialogDone}
        />
        <TNMediaViewerModal
          mediaItems={sortMediafromThread}
          isModalOpen={isMediaViewerOpen}
          onClosed={onMediaClose}
          selectedMediaIndex={selectedMediaIndex}
        />
      </View>
    );
  }
}

Chat.propTypes = {
  onSendInput: PropTypes.func,
  onChangeName: PropTypes.func,
  onChangeTextInput: PropTypes.func,
  onLaunchCamera: PropTypes.func,
  onOpenPhotos: PropTypes.func,
  onAddMediaPress: PropTypes.func,
  user: PropTypes.object,
  uploadProgress: PropTypes.number,
  isMediaViewerOpen: PropTypes.bool,
  isRenameDialogVisible: PropTypes.bool,
  selectedMediaIndex: PropTypes.number,
  onChatMediaPress: PropTypes.func,
  onMediaClose: PropTypes.func,
  showRenameDialog: PropTypes.func,
  onLeave: PropTypes.func
};

export default Chat;
