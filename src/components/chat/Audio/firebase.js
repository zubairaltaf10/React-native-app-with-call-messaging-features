import firebase from "firebase";

const db = firebase.firestore();
const audioVideoChatSignalRef = db.collection("audioVideoChatSignal");
const audioVideoChatRoomRef = db.collection("audioVideoChatRoom");

const onMediaChatDataUpdate = (querySnapshot, chatTimeout, callback) => {
  const data = [];
  const date = new Date();
  const currentMiliSeconds = date.getTime();

  querySnapshot.forEach(doc => {
    const videoData = doc.data();
    const difference = Math.abs(
      currentMiliSeconds - videoData.createdAt.miliSeconds
    );

    if (difference < chatTimeout) {
      data.push(videoData);
    }
  });
  return callback(data);
};

export const subscribeVideoChat = (userId, chatTimeout, callback) => {
  return audioVideoChatSignalRef
    .where("type", "==", "video")
    .where("receiverId", "==", userId)
    .onSnapshot(querySnapshot =>
      onMediaChatDataUpdate(querySnapshot, chatTimeout, callback)
    );
};

export const subscribeAudioChat = (userId, chatTimeout, callback) => {
  //console.log(userId, 'adasdad');
  return audioVideoChatSignalRef
    .where("type", "==", "audio")
    .where("receiverId", "==", userId)
    .onSnapshot(querySnapshot =>
      onMediaChatDataUpdate(querySnapshot, chatTimeout, callback)
    );
};

export const setMediaChatReceivers = async data => {
  await audioVideoChatSignalRef.doc(data.id).set(data);
  await audioVideoChatSignalRef.doc(data.id).delete();
};

export const cleanChatRoomParticipants = async channelId => {
  const batch = db.batch();
  const resRef = await audioVideoChatRoomRef
    .doc(channelId)
    .collection("connectionData")
    .get();

  if (resRef.docs.length > 0) {
    resRef.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    batch.commit();
  }
};

export const subscribeCallConnectionData = (data, callback) => {
  const callConnectionDatasRef = audioVideoChatRoomRef
    .doc(data.channelId)
    .collection("connectionData")
    .where("receiverId", "==", data.userId);
  //  console.log(data, 'qwexzcXz');
  return callConnectionDatasRef.onSnapshot(querySnapshot => {
    const data = [];
    querySnapshot.forEach(doc => {
      const connectionData = doc.data();
      connectionData.id = doc.id;
      data.push(connectionData);
    });
    // console.log(data, '25345');
    return callback(data);
  });
};

export const addCallConnectionData = async data => {
  const { channelId, type, senderId, receiverId } = data;
  const callConnectionDatasRef = audioVideoChatRoomRef
    .doc(channelId)
    .collection("connectionData");

//  let stringMessage = message

 // console.log(stringMessage, "string MESAS");
  callConnectionDatasRef.doc(senderId).set({
    senderId,
    receiverId,
  //  message: stringMessage,
    type
  });
};

export const addChatRoomParticipants = async data => {
  const audioVideoChatRoomParticipantsRef = audioVideoChatRoomRef
    .doc(data.channelId)
    .collection("participants");

  audioVideoChatRoomParticipantsRef.doc(data.userId).set({
    participantId: data.userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateChatRoomStatus = (channelId, status) => {
  audioVideoChatRoomRef.doc(channelId).update({ pendding_connection: status });
};

export const subscribeChatRoomParticipants = (data, callback) => {
  const audioVideoChatRoomParticipantsRef = audioVideoChatRoomRef
    .doc(data.channelId)
    .collection("participants");

  return audioVideoChatRoomParticipantsRef.onSnapshot(querySnapshot => {
    const participants = [];
    querySnapshot.forEach(doc => {
      const participant = doc.data();
      participants.push(participant);
    });
    return callback(participants);
  });
};

export const signalChatRoomParticipants = async data => {
  // console.log(data, 'dsmxzc1213');
  const { participantsId } = data;
  const batch = db.batch();
  //  console.log(participantsId, 'yolopopo');
  participantsId.forEach(participantId => {
    const ref = audioVideoChatSignalRef.doc(participantId);
    batch.set(ref, { ...data, receiverId: participantId });
    // console.log(participantId, 'hiii');
  });

  await batch.commit().then(console.log("done dibe dbe"));

  // participantsId.forEach((participantId) => {
  //   audioVideoChatSignalRef.doc(participantId).delete();
  // });
};

export const exitAudioVideoChatRoom = data => {
  const audioVideoChatRoomParticipantsRef = audioVideoChatRoomRef
    .doc(data.channelId)
    .collection("participants");

  audioVideoChatRoomParticipantsRef.doc(data.userId).delete();
};
