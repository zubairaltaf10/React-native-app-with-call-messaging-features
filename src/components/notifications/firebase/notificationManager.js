import firebase from "firebase";
const notificationsRef = firebase.firestore().collection("notifications");
import Axios from "axios";
const fcmURL = "https://fcm.googleapis.com/fcm/send";
const firebaseServerKey =
  "AAAAHJ-XrxA:APA91bG3O3xGWdVTxpQ5usRoVxsmwlAgdPcTKdi8w6M2T0GYoUYSo8_XS26L1Soh-drMLLBp-5oVmgWG4-LQnMx0kBHDJncPtwRvDWUUqddBckeaezTMdFMwChapMa3xvwa99kQOqXgC";

const sendPushNotification = async (
  toUser,
  title,
  body,
  type,
  metadata = {},
  ChatCall
) => {
  if (metadata && metadata.fromUser && toUser.id == metadata.fromUser.id) {
    return;
  }

  const recieverData = {
    name: toUser.name,
    id: toUser.id || toUser._id,
    email: toUser.email,
    // phone: toUser.phone,
    role: toUser.role,
  //  pushToken: toUser.pushToken,
    photo: toUser.photo,
    jwt: toUser.id || toUser._id,
    _id: toUser.id || toUser._id
    // image: 'heyy',
  };

  const senderData = {
    name: metadata.fromUser.name,
    id: metadata.fromUser.id || metadata.fromUser.userID,
    email: metadata.fromUser.email,
    // phone: metadata.fromUser.phone,
    role: metadata.fromUser.role,
  //  pushToken: metadata.fromUser.pushToken,
    photo: metadata.fromUser.photo,
    jwt: metadata.fromUser.id || metadata.fromUser.userID,
    _id: metadata.fromUser.id || metadata.fromUser.userID
  };

  const meta = {
    fromUser: senderData
  };

  const notification = {
    toUserID: toUser.id || toUser._id,
    title,
    body,
    metadata: meta,
    toUser: recieverData,
    type,
    seen: false
  };

  let user1 = null;
  await firebase
    .database()
    .ref(`users/${toUser.id || toUser._id}`)
    .on("value", snapshot => {
      if (snapshot.exists()) {
        user1 = snapshot.val();
      }
    });

  // const user1 = await firebase
  //   .firestore()
  //   .collection('users')
  //   .doc(toUser.id)
  //   .get();

  const ref = await notificationsRef
    .doc(toUser.id || toUser._id)
    .collection("notifications")
    .add({
      ...notification,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

  // notificationsRef.add({
  //   ...notification,
  //   createdAt: firebase.firestore.FieldValue.serverTimestamp()
  // });

  // notificationsRef
  //   .doc(toUser.id || toUser._id)
  //   .collection(toUser.name)
  //   .update({ id: toUser.id || toUser._id });

  const pushNotification = {
    to: user1?.pushToken,
    notification: {
      title: title,
      body: body
    },

    data: { senderData: senderData, type, toUserID: recieverData }
  };

  if (user1.allowNotification == true) {
    fetch(fcmURL, {
      method: "post",
      headers: new Headers({
        Authorization: "key=" + firebaseServerKey,
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(pushNotification)
    }).then(res => {
      console.log(res, "message resp");
    });
  } else {
    console.log("No need");
  }

  if (ChatCall === true) {
    console.log("no email");
  } else {
    Axios.get(`http://us-central1-pukaar-4988e.cloudfunctions.net/sendMail`, {
      params: {
        dest: recieverData?.email,
        subject: `Notification`,
        body: `${senderData?.name + " : " + body}`
      }
    });
  }
};

export const notificationManager = {
  sendPushNotification
};
