import firebase from "firebase";

// import firebaseConfig from './config';
// let usersRef = ""
// // if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
// firebase.database().ref('users/' + "aSpSoWwha0eTDimoWX8TDIhKWVI3").on('value', (snapshot) => {
//     console.log(snapshot.val(), 'heyyyy')
//     usersRef = snapshot.val()

// })

export const usersRef = firebase.database();
export const agentTags = firebase.firestore().collection("searchTags");
export const getSearchTags = async userId => {
  try {
    const tags = await agentTags.doc(userId).get();

    return { data: { ...tags.data(), id: tags.id }, success: true };
  } catch (error) {
    console.log(error);
    return {
      error: "Oops! an error occured. Please try again",
      success: false
    };
  }
};

export const getUserData = async userId => {
  try {
    const user = await usersRef.doc(userId).get();

    return { data: { ...user.data(), id: user.id }, success: true };
  } catch (error) {
    console.log(error);
    return {
      error: "Oops! an error occured. Please try again",
      success: false
    };
  }
};

export const updateUserData = async (userId, userData) => {
  // console.log(userData.tags, '12sad132123312312123132xzc');
  try {
    const userRef = usersRef.doc(userId);

    await userRef.update({
      ...userData
    });

    return { success: true };
  } catch (error) {
    return { error, success: false };
  }
};

export const subscribeUsers = (userId, callback) => {
  // return usersRef.onSnapshot((querySnapshot) => {
  //     const data = [];
  //     const completeData = [];
  //     querySnapshot.forEach((doc) => {
  //         console.log(doc.data(), 'docodocodco')
  //         const user = doc.data();
  //         data.push({ ...user, id: doc.id });
  //         completeData.push({ ...user, id: doc.id });
  //     });
  //     console.log(data, 'heyyy', completeData)
  //     return callback(data, completeData);
  // });

  return usersRef.ref("users").on("value", snap => {
    const data = [];
    const completeData = [];
    if (snap.exists()) {
      const user = snap.val();
      data.push(Object.keys(user).map(key => ({ ...user[key], id: key })));

      completeData.push(
        Object.keys(user).map(key => ({ ...user[key], id: key }))
      );
    }

    return callback(data, completeData);
  });
};

export const subscribeCurrentUser = (userId, callback) => {
  // const ref = usersRef
  //     .where('id', '==', userId)
  //     .onSnapshot({ includeMetadataChanges: true }, (querySnapshot) => {
  //         const docs = querySnapshot.docs;
  //         if (docs.length > 0) {
  //             console.log(docs[0].data(), 'signle data')
  //             callback(docs[0].data());
  //         }
  //     });

  try {
    const ref = usersRef.ref(`users/${userId}`).on("value", snapshot => {
      if (snapshot.val() !== null) {
        callback({ ...snapshot.val(), id: userId });
      }
    });
    return ref;
  } catch (error) {
    console.log("currect user unsubcribbe error");
  }
};
