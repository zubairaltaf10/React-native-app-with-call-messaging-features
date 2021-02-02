import ActionSheet from "react-native-actionsheet";
import React, { useState, createRef } from "react";
import { Modal } from "react-native";
import {
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Button,
  TouchableOpacity,
  PermissionsAndroid
} from "react-native";

import * as ImagePicker from "react-native-image-picker";
import { check, PERMISSIONS, RESULTS } from "react-native-permissions";
import firebase from "../services/firebase";
import NetworkUtils from "./NetworkUtil";

const { width, height } = Dimensions.get("window");
const actionSheetRef = createRef();
const ImageInput = props => {
  const {
    title,
    value,
    setValue,
    error,

    setError,
    validation,
    type = "",
    logo = false,
    children = null
  } = props;
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageModal, setImageModal] = useState(null);
  const uriToBlob = uri => {
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

  const uploadToFirebase = (blob, callback) => {
    var storageRef = firebase.storage().ref();
    var id = firebase
      .database()
      .ref(`/uploads`)
      .push().key;
    var uploadTask = storageRef.child(`uploads/${id}.png`).put(blob, {
      contentType: "image/png"
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
          // setImageUrl(downloadURL);
          callback(downloadURL);
          // setValue([id, downloadURL]);
          // setError("");
          console.log("Uploaded");
          setLoading(false);
        });
      }
    );
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Cool Photo App Camera Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const uploadImageCamera = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      ).then(async granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          try {
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            ).then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const options = {
                  title: "Select Picture",
                  mediaType: "photo",
                  storageOptions: {
                    skipBackup: true,
                    path: "images"
                  },
                  saveToPhotos: true,
                  maxWidth: 500,
                  maxHeight: 500,
                  quality: 0.5
                };

                ImagePicker.launchCamera(
                  props.options ? props.options : options,
                  async response => {
                    // if (!(await NetworkUtils.isNetworkAvailable())) {
                    //   return;
                    // }
                    if (response.didCancel) {
                      console.log("User cancelled image picker");
                    } else if (response.error) {
                      console.log("ImagePicker Error: ", response.error);
                    } else if (response.customButton) {
                      console.log(
                        "User tapped custom button: ",
                        response.customButton
                      );
                    } else {
                      console.log(response, "cae");
                      setLoading(true);
                      const { height, width, type, uri } = response;
                      // setImageUrl(uri);
                      // props.callback(uri)

                      var blob = await uriToBlob(uri);
                      // props.callback(blob)

                      await uploadToFirebase(blob, url => props.callback(url));
                      // props.callback(imageUrl);
                      // setLoading(false);
                    }
                  }
                );
              }
            });
          } catch (error) {
            console.log(error, "Camera permission denied");
          }
        } else {
          console.log("Camera permission denied");
        }
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const uploadImageLibrary = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      ).then(async granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          try {
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            ).then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const options = {
                  title: "Select Picture",
                  mediaType: "photo",
                  // storageOptions: {
                  //   skipBackup: true,
                  //   path: "images"
                  // },
                  //  saveToPhotos: true,
                  maxWidth: 500,
                  maxHeight: 500,
                  quality: 0.5
                };

                ImagePicker.launchImageLibrary(
                  props.options ? props.options : options,
                  async response => {
                    // if (!(await NetworkUtils.isNetworkAvailable())) {
                    //   return;
                    // }
                    if (response.didCancel) {
                      console.log("User cancelled image picker");
                    } else if (response.error) {
                      console.log("ImagePicker Error: ", response.error);
                    } else if (response.customButton) {
                      console.log(
                        "User tapped custom button: ",
                        response.customButton
                      );
                    } else {
                      console.log(response, "cae");
                      setLoading(true);
                      const { height, width, type, uri } = response;
                      // setImageUrl(uri);
                      // props.callback(uri)

                      var blob = await uriToBlob(uri);
                      // props.callback(blob)

                      await uploadToFirebase(blob, url => props.callback(url));
                      // props.callback(imageUrl);
                      // setLoading(false);
                    }
                  }
                );
              }
            });
          } catch (error) {
            console.log(error, "Camera permission denied");
          }
        } else {
          console.log("Camera permission denied");
        }
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const removePhoto = () => {
    // var storageRef = firebase.storage().ref(`/uploads/${value[0]}.jpg`);
    // storageRef.delete();
    // console.log('val', storageRef);
    setImageUrl("");
    setValue([]);
    validation("", setError);
  };

  const onPhotoUploadDialogDone = index => {
    if (index == 0) {
      uploadImageCamera();
    }

    if (index == 1) {
      uploadImageLibrary();
    }
  };

  const onAddMediaPress = actionSheetRef => {
    actionSheetRef.current.show();
  };

  return (
    <>
      <ActionSheet
        ref={actionSheetRef}
        title={"Photo Upload"}
        options={["Launch Camera", "Open Photo Gallery", "Cancel"]}
        cancelButtonIndex={2}
        onPress={onPhotoUploadDialogDone}
      />
      {loading ? (
        <ActivityIndicator style={{ width: 200, height: 200 }} size="large" />
      ) : (
        <TouchableOpacity onPress={() => onAddMediaPress(actionSheetRef)}>
          {children}
        </TouchableOpacity>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  view: {
    flexDirection: "row",
    height: 50,
    borderRadius: 20,
    borderTopLeftRadius: 20,
    marginVertical: 5,
    borderRadius: 10
  },
  error: {
    fontSize: 13,
    color: "red"
  },
  title: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    color: "white",
    fontFamily: "times",
    fontSize: 24
  },
  image: {
    marginTop: 20,
    minWidth: 240,
    height: 240,
    paddingHorizontal: 10,
    resizeMode: "contain"
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: width / 3,
    height: width / 3
  },
  imageIcon: { height: 50, width: 50, resizeMode: "contain" },
  imageIconLabel: { fontSize: 16, margin: 10 }
});

export default ImageInput;
