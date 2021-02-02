import firebase from "firebase";
import { v4 as uuidv4 } from "uuid";
const channelsRef = firebase.firestore().collection("channels");

const channelPaticipationRef = firebase
  .firestore()
  .collection("channel_participation");
console.log("CYRAX");
const onCollectionUpdate = (querySnapshot, userId, callback) => {
  const data = [];
  querySnapshot.forEach(doc => {
    console.log(doc.data(), "dpc");
    const user = doc.data();
    console.log(doc.id, "dpcid");
    user.id = doc.id;

    if (user.id != userId) {
      data.push(user);
    }
  });
  console.log(data, "data");
  return callback(data, channelsRef);
};

export const subscribeChannelParticipation = (userId, callback) => {
  if (userId != undefined) {
    return channelPaticipationRef
      .where("user", "==", userId)
      .onSnapshot(querySnapshot =>
        onCollectionUpdate(querySnapshot, userId, callback)
      );
  }
};

export const subscribeChannels = callback => {
  return channelsRef.onSnapshot(snapshot =>
    callback(snapshot.docs.map(doc => doc.data()))
  );
};

export const fetchChannelParticipantIDs = async (channel, callback) => {
  channelPaticipationRef
    .where("channel", "==", channel?.id)
    .get()
    .then(snapshot => {
      callback(snapshot.docs.map(doc => doc.data().user));
    })
    .catch(error => {
      console.log(error);
      callback([]);
    });
};

export const subscribeThreadSnapshot = (channel, callback) => {
  return channelsRef
    .doc(channel.id)
    .collection("thread")
    .orderBy("created", "desc")
    .limit(10)
    .onSnapshot(callback);
};

export const sendMessage = (sender, channel, message, downloadURL) => {
  return new Promise(resolve => {
    const { jwt, _id, photo, id } = sender;
    console.log(channel, "channel");
    const timestamp = currentTimestamp();
    const data = {
      content: message,
      created: timestamp,
      recipientFirstName: "",
      recipientID: "",
      recipientLastName: "",
      recipientProfilePictureURL: "",
      senderFirstName: sender.name,
      senderID: jwt || _id || id,
      senderLastName: "",
      senderProfilePictureURL: photo || "",
      url: downloadURL
    };
    const channelID = channel.id;
    channelsRef
      .doc(channelID)
      .collection("thread")
      .add({ ...data })
      .then(() => {
        channelsRef
          .doc(channelID)
          .update({
            lastMessage: message && message.length > 0 ? message : downloadURL,
            lastMessageDate: timestamp,
            seen: false,
            senderID: jwt || _id || id,
            recipientID: channel.participants[0].id
          })
          .then(response => {
            resolve({ success: true });
          })
          .catch(error => {
            resolve({ success: false, error: error });
          });
      })
      .catch(error => {
        resolve({ success: false, error: error });
      });
  });
};

export const createChannel = (creator, otherParticipants, name) => {
  console.log(creator, "space", otherParticipants, name, "create channel");
  return new Promise(resolve => {
    var channelID = uuidv4();
    const id1 = creator.id || creator.jwt || creator._id;
    if (otherParticipants.length == 1) {
      const id2 =
        otherParticipants[0].id ||
        otherParticipants[0].jwt ||
        otherParticipants[0]._id;
      if (id1 == id2) {
        // We should never create a self chat
        resolve({ success: false });
        return;
      }
      channelID = id1 < id2 ? id1 + id2 : id2 + id1;
    }
    const channelData = {
      creator_id: id1,
      creatorID: id1,
      id: channelID,
      channelID,
      name: "",
      lastMessageDate: currentTimestamp()
    };
    console.log(channelData, "channelData");
    channelsRef
      .doc(channelID)
      .set({
        ...channelData
      })
      .then(channelRef => {
        persistChannelParticipations(
          [...otherParticipants, creator],
          channelID
        ).then(response => {
          console.log("SUCCESSS", "persisisitt");
          resolve({ success: response.success, channel: channelData });
        });
      })
      .catch(() => {
        resolve({ success: false });
      });
  });
};

export const persistChannelParticipations = (users, channelID) => {
  return new Promise(resolve => {
    const db = firebase.firestore();
    console.log(users, channelID, "channelIDDD");
    let batch = db.batch();
    users.forEach(user => {
      let ref = channelPaticipationRef.doc();
      batch.set(ref, {
        channel: channelID,
        user: user?.id || user?._id || user?.jwt
      });
    });
    // Commit the batch
    batch.commit().then(function() {
      resolve({ success: true });
    });
  });
};

export const onLeaveGroup = (channelId, userId, callback) => {
  channelPaticipationRef
    .where("channel", "==", channelId)
    .where("user", "==", userId)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.delete();
        callback({ success: true });
      });
    })
    .catch(error => {
      console.log(error);
      callback({ success: false, error: "An error occured, please try gain." });
    });
};

export const onRenameGroup = (text, channel, callback) => {
  channelsRef
    .doc(channel.id)
    .set(channel)
    .then(() => {
      const newChannel = channel;
      newChannel.name = text;
      callback({ success: true, newChannel });
    })
    .catch(error => {
      console.log(error);
      callback({ success: false, error: "An error occured, please try gain." });
    });
};

export const currentTimestamp = () => {
  return firebase.firestore.FieldValue.serverTimestamp();
};
