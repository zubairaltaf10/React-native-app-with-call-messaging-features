import firebase from 'firebase';
import { Pressable } from 'react-native';

import { Platform } from 'react-native';
//import { ErrorCode } from '../onboarding/utils/ErrorCode';
// import firebaseConfig from './config';

// if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const uploadFileWithProgressTracking = async (
    filename,
    uploadUri,
    callbackSuccess,
    callbackError,
) => {
    // Success handler with SUCCESS is called multiple times on Android. We need work around that to ensure we only call it once
    var finished = false;
    firebase
        .storage()
        .ref(filename)
        .put(uploadUri)
        .then(snapshot => {
            console.log(snapshot, 'tree', 'skip if')
            callbackSuccess(snapshot, "success");
        },
            callbackError,
        );
};

 const  uploadAudio = uri =>   {
    
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        firebase
          .storage()
          .ref()
          .child(`nameOfTheFile.${fileType}`)
          .put(blob, {
            contentType: `audio/${fileType}`,
          })
          .then(() => {
            console.log("Sent!");
          })
          .catch((e) => console.log("error:", e));
    
}

const uploadImage = uri => {
    return new Promise((resolve, _reject) => {
        console.log('uri ==', uri);
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        console.log('filename ==', filename);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        firebase
            .storage()
            .ref(filename)
            .putFile(uploadUri)
            .then(function (snapshot) {
                resolve({ downloadURL: snapshot.downloadURL });
            })
            .catch(_error => {
                resolve({ error: "NIT FIYBD" });
            });
    });
};

const firebaseStorage = {
    uploadImage,
    uploadFileWithProgressTracking,
    uploadAudio
};

export { firebaseStorage };
