import CameraRoll, {
  saveToCameraRoll
} from "@react-native-community/cameraroll";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import Snackbar from "../components/Snackbar";

const getPermissionAndroid = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Image Download Permission",
        message: "Your permission is required to save images to your device",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    Alert.alert(
      "Save remote Image",
      "Grant Me Permission to save Image",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  } catch (err) {
    Alert.alert(
      "Save remote Image",
      "Failed to save Image: " + err.message,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }
};
const getExtention = filename => {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
};

const handleDownload = async url => {
  // if device is android you have to ensure you have permission
  if (Platform.OS === "android") {
    const granted = await getPermissionAndroid();
    if (!granted) {
      return;
    }
  }
  //   this.setState({ saving: true });
  Snackbar("success", "Reciept is downloading");
  if (Platform.OS === "android") {
    RNFetchBlob.config({
      useDownloadManager: true,
      fileCache: true,
      appendExt: "png",
      notification: true,
      // path:
      //   PictureDir +
      //   "/image_" +
      //   Math.floor(date.getTime() + date.getSeconds() / 2) +
      //   ext,
      description: "Image"
    })
      .fetch("GET", url)
      .then(res => {
        CameraRoll.save(res.path(), { type: "photo" })
          .then(() => {
            // Alert.alert(
            //   "Save remote Image",
            //   "Image Saved Successfully",
            //   [{ text: "OK", onPress: () => console.log("OK Pressed") }],
            //   { cancelable: false }
            // );
            Snackbar("success", "Reciept Saved Successfully");
          })
          .catch(err => {
            Alert.alert(
              "Save remote Image",
              "Failed to save Image: " + err.message,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          })
          .finally(() => {
            // this.setState({ saving: false })
          });
      })
      .catch(error => {
        //   this.setState({ saving: false });
        Alert.alert(
          "Save remote Image",
          "Failed to save Image: " + error.message,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      });
  } else {
    CameraRoll.save(url, { type: "photo" })
      .then(() => {
        // Alert.alert(
        //   "Save remote Image",
        //   "Image Saved Successfully",
        //   [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        //   { cancelable: false }
        // );
        Snackbar("success", "Reciept Saved Successfully");
      })
      .catch(err => {
        Alert.alert(
          "Save remote Image",
          "Failed to save Image: " + err.message,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      })
      .finally(() => {
        // this.setState({ saving: false })
      });
  }
};
export default function saveImageToGallery(url) {
  handleDownload(url);
}
