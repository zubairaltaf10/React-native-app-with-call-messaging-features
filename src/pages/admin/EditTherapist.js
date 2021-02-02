import React, { Component } from "react";
import { ScrollView, View, BackHandler, Dimensions } from "react-native";
import { styles, theme } from "../../styles/index";
import Input from "../../components/Input";
import Picker from "../../components/Picker";
import MultiSelect from "../../components/MultiSelect";
import { Button, Avatar, Input as Inputt } from "react-native-elements";
import Snack from "../../components/Snackbar";
import LinearGradient from "react-native-linear-gradient";
import Header from "../../components/Header";
import session from "../../data/session";
import ImagePicker from "react-native-image-picker";
import serviceTypes from "../../util/enums/serviceTypes";
import focusTypes from "../../util/enums/focus";
import doctorTypes from "../../util/enums/doctorTypes";
//import { http } from "../../util/http";
import firebase from "../../services/firebase";
import NetworkUtils from "../../components/NetworkUtil";
const booleanData = { true: true, false: false };

export default class EditTherapistProfileAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarSource: props.navigation.getParam("user").photo,
      image: null,
      overlayVisible: false,
      overlayVisible2: false,
      selectedServices: props.navigation.getParam("user").services || [],
      selectedFocus: props.navigation.getParam("user").focus || [],
      userId:
        props.navigation.getParam("user")._id ||
        props.navigation.getParam("user").id,
      name: props.navigation.getParam("user").name,
      about: props.navigation.getParam("user").about,
      phone: props.navigation.getParam("user").phone,
      email: props.navigation.getParam("user").email,
      address: props.navigation.getParam("user").address,
      available:
        props.navigation.getParam("user").available === true
          ? "available"
          : "unavailable",
      doctorType: props.navigation.getParam("user").doctorType,
      photo: props.navigation.getParam("user").photo
    };
    // console.log("oop", props.navigation.getParam("user").services);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userId !== this.props.navigation.getParam("user")._id) {
      this.setState({
        avatarSource: this.props.navigation.getParam("user").photo,
        image: null,
        overlayVisible: false,
        overlayVisible2: false,
        selectedServices: this.props.navigation.getParam("user").services,
        selectedFocus: this.props.navigation.getParam("user").focus,
        userId: this.props.navigation.getParam("user")._id,
        name: this.props.navigation.getParam("user").name,
        about: this.props.navigation.getParam("user").about,
        phone: this.props.navigation.getParam("user").phone,
        email: this.props.navigation.getParam("user").email,
        address: this.props.navigation.getParam("user").address,
        available:
          this.props.navigation.getParam("user").available === true
            ? "available"
            : "unavailable",
        doctorType: this.props.navigation.getParam("user").doctorType
      });
    }
  }

  valid() {
    const {
      selectedServices,
      selectedFocus,
      name,
      about,
      email,
      address,
      phone,
      available,
      doctorType
    } = this.state;
    if (selectedServices?.length === 0 || selectedFocus?.length === 0) {
      Snack("error", "All fields must be filled");
      return false;
    }
    if (!this.state.avatarSource) {
      Snack("error", "Please select a profile photo.");
      return false;
    }
    if (
      phone.length === 0 ||
      !phone.match(
        "^((\\+92)|(0092))-{0,1}\\d{3}-{0,1}\\d{7}$|^\\d{11}$|^\\d{4}-\\d{7}$"
      )
    ) {
      Snack("error", "Please enter valid phone number");
      return false;
    }
    if (
      available &&
      doctorType &&
      doctorType.length > 0 &&
      name.length > 0 &&
      address.length > 0 &&
      about.length > 0
    ) {
      return true;
    } else {
      console.log("valig", {
        selectedServices,
        selectedFocus,
        name,
        email,
        about,
        address,
        phone,
        available,
        doctorType
      });
      Snack("error", "All fields must be filled");
      return false;
    }
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  onSubmit = async () => {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      return;
    }
    if (!this.state.loading) {
      // console.log(this.state.image);
      console.log("submit");
      if (this.valid()) {
        this.setState({ loading: true });
        const {
          selectedServices,
          selectedFocus,
          name,
          email,
          about,
          address,
          phone,
          available,
          doctorType
        } = this.state;

        const body = {
          name,
          about,
          phone,
          email,
          address,

          services: selectedServices,
          focus: selectedFocus,
          available: available === "available" ? true : false,
          status: available,
          doctorType,
          role: "THERAPIST",
          photo: this.state.avatarSource || this.state.photo
        };

        const user = await session.getUser();
        console.log("submit", this.props.navigation.getParam("user").id);
        // alert(this.props.navigation.getParam("user")._id)
        try {
          await firebase
            .database()
            .ref(`users/${this.props.navigation.getParam("user").id}`)
            .set(body);
          // .then(response => {
          // alert(this.props.navigation.getParam("user").id);
          this.setState({ loading: false });
          Snack("success", "Profile updated successfully");
          this.props.navigation.goBack(null);
          this.props.navigation.getParam("updateProfile")(
            selectedServices,
            selectedFocus,
            name,
            about,
            address,
            phone,
            available === "available" ? true : false,
            doctorType,
            this.state.avatarSource
          );
        } catch (err) {
          // })
          this.setState({ loading: false });
          if (err) {
            Snack("error", err);
            return false;
          } else {
            Snack("error", "Unknown error occured, please contact an Admin");
            return false;
          }
        }
      } else {
        this.setState({ loading: false });
      }
    }
  };

  updateValue = (value, property) => {
    this.setState({
      [property]: value
    });
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  uriToBlob = uri => {
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

  uploadToFirebase = async (blob, callback) => {
    var storageRef = firebase.storage().ref();
    var id = await firebase
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

          callback(downloadURL);
        });
      }
    );
  };
  handleImage = () => {
    ImagePicker.showImagePicker({}, async response => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        Snack("error", "Unknown error occured, please contact an Admin");
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        const blob = await this.uriToBlob(response.uri);
        await this.uploadToFirebase(blob, downloadURL =>
          this.setState({ avatarSource: downloadURL, loading: false })
        );
      }
    });
  };

  onChange = (value, property) => {
    this.setState({ [property]: value });
  };

  updateVisible = () => {
    this.setState({ overlayVisible: !this.state.overlayVisible });
  };

  updateVisible2 = () => {
    this.setState({ overlayVisible2: !this.state.overlayVisible2 });
  };

  updateServices = value => {
    if (this.state.selectedServices?.includes(value)) {
      let array = [...this.state.selectedServices]; // make a separate copy of the array
      let index = array.indexOf(value);
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({ selectedServices: array });
      }
    } else {
      this.setState({
        selectedServices: [...this.state.selectedServices, value]
      });
    }
  };

  updateFocus = value => {
    if (this.state.selectedFocus?.includes(value)) {
      let array = [...this.state.selectedFocus]; // make a separate copy of the array
      let index = array.indexOf(value);
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({ selectedFocus: array });
      }
    } else {
      this.setState({ selectedFocus: [...this.state.selectedFocus, value] });
    }
  };

  render() {
    return (
      <View style={styles.fillSpace}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Header
            title={"Edit profile"}
            changeDrawer={this.goBack}
            icon={"arrow-back"}
            customStyles={{
              height: (76 * Dimensions.get("window").height) / 896
            }}
            // iconRight={"exit-to-app"}
            // logout={this.logout}
          />
          <ScrollView style={[styles.bodyPadding]}>
            <View style={{ alignItems: "center", marginTop: theme.size(10) }}>
              <Avatar
                rounded
                size="large"
                source={{ uri: this.state.avatarSource }}
                showEditButton
                // onPress={() => this.handleImage()}
                editButton={{
                  onPress: () => this.handleImage(),
                  containerStyle: { padding: 0 }
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: theme.paddingBodyVertical
              }}
            >
              <Input
                placeholder={"Name"}
                leftIcon={{ name: "person-outline", color: theme.colorGrey }}
                onChange={this.onChange}
                propertyName={"name"}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,
                  textAlignVertical: "center"
                }}
                value={this.state.name}
              />
              <Input
                placeholder={"About"}
                leftIcon={{
                  name: "information-outline",
                  type: "material-community",
                  color: theme.colorGrey
                }}
                onChange={this.onChange}
                propertyName={"about"}
                multiline={true}
                numberOfLines={1}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,
                  textAlignVertical: "center"
                }}
                value={this.state.about}
                textAlignVertical={"center"}
                maxLength={1000}
              />
              <Input
                placeholder={"Contact number"}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,
                  textAlignVertical: "center"
                }}
                leftIcon={{ name: "local-phone", color: theme.colorGrey }}
                keyboardType={"numeric"}
                onChange={this.onChange}
                propertyName={"phone"}
                value={this.state.phone}
              />
              <Input
                placeholder={"E-mail"}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,
                  textAlignVertical: "center"
                }}
                leftIcon={{ name: "mail-outline", color: theme.colorGrey }}
                keyboardType={"email-address"}
                onChange={this.onChange}
                propertyName={"email"}
                value={this.state.email}
              />
              <Input
                placeholder={"City, Province"}
                inputStyle={{
                  ...styles.title,
                  fontFamily: theme.font.regular,
                  textAlignVertical: "center"
                }}
                leftIcon={{
                  name: "city-variant-outline",
                  type: "material-community",
                  color: theme.colorGrey
                }}
                onChange={this.onChange}
                propertyName={"address"}
                value={this.state.address}
              />
              {this.state.overlayVisible2 ? (
                <MultiSelect
                  placeholder={
                    this.state.selectedServices.length === 0
                      ? "Services this therapist provides"
                      : this.state.selectedServices.toString()
                  }
                  visible={true}
                  updateVisible={this.updateVisible2}
                  data={serviceTypes}
                  selectedValues={this.state.selectedServices}
                  updateValues={this.updateServices}
                />
              ) : (
                <Inputt
                  inputContainerStyle={{
                    borderBottomWidth: 0
                  }}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular,
                    textAlignVertical: "center"
                  }}
                  containerStyle={{
                    borderColor: theme.inputBordercolor,
                    borderRadius: 4,
                    borderWidth: 1,
                    paddingHorizontal: 0,
                    marginTop: 10
                  }}
                  leftIcon={{ name: "list", color: theme.colorGrey }}
                  placeholderTextColor={theme.colorGrey}
                  onFocus={() => this.updateVisible2()}
                  disable={true}
                  placeholder={
                    this.state.selectedServices.length === 0
                      ? "Services this therapist provides"
                      : this.state.selectedServices.toString()
                  }
                />
              )}

              {this.state.overlayVisible ? (
                <MultiSelect
                  placeholder={
                    this.state.selectedFocus.length === 0
                      ? "Therapist's focus"
                      : this.state.selectedFocus.toString()
                  }
                  visible={true}
                  updateVisible={this.updateVisible}
                  data={focusTypes}
                  selectedValues={this.state.selectedFocus}
                  updateValues={this.updateFocus}
                />
              ) : (
                <Inputt
                  inputContainerStyle={{
                    borderBottomWidth: 0
                  }}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular,
                    textAlignVertical: "center"
                  }}
                  leftIcon={{ name: "list", color: theme.colorGrey }}
                  containerStyle={{
                    borderColor: theme.inputBordercolor,
                    borderRadius: 4,
                    borderWidth: 1,
                    paddingHorizontal: 0,
                    marginTop: 10
                  }}
                  placeholderTextColor={theme.colorGrey}
                  onFocus={() => this.updateVisible()}
                  disable={true}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular
                  }}
                  placeholder={
                    this.state.selectedFocus.length === 0
                      ? "Therapist's focus"
                      : this.state.selectedFocus.toString()
                  }
                />
              )}
              {!!this.state.isTherapistAvailableModalVisible ? (
                <MultiSelect
                  placeholder={
                    !this.state.available
                      ? "Is the therapist available"
                      : this.state.available
                  }
                  single
                  visible={true}
                  updateVisible={() =>
                    this.setState({ isTherapistAvailableModalVisible: false })
                  }
                  data={["available", "unavailable"]}
                  selectedValues={this.state.available}
                  updateValues={available => this.setState({ available })}
                />
              ) : (
                <Inputt
                  inputContainerStyle={{
                    borderBottomWidth: 0
                  }}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular,
                    textAlignVertical: "center"
                  }}
                  rightIcon={{
                    name: "arrow-drop-down",
                    color: theme.colorGrey
                  }}
                  containerStyle={{
                    borderColor: theme.inputBordercolor,
                    borderRadius: 4,
                    borderWidth: 1,
                    paddingHorizontal: 0,
                    marginTop: 10
                  }}
                  placeholderTextColor={theme.colorGrey}
                  onFocus={() =>
                    this.setState({ isTherapistAvailableModalVisible: true })
                  }
                  disable={true}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular,
                    marginLeft: 15
                  }}
                  placeholder={
                    !this.state.available
                      ? "Is the therapist available"
                      : this.state.available
                  }
                />
              )}
              {!!this.state.doctorTypeModalVisible ? (
                <MultiSelect
                  placeholder={
                    !this.state.doctorType
                      ? "Type of doctor?"
                      : this.state.doctorType
                  }
                  single
                  visible={true}
                  updateVisible={() =>
                    this.setState({ doctorTypeModalVisible: false })
                  }
                  data={Object.values(doctorTypes)}
                  selectedValues={this.state.doctorType}
                  updateValues={doctorType => this.setState({ doctorType })}
                />
              ) : (
                <Inputt
                  inputContainerStyle={{
                    borderBottomWidth: 0
                  }}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular,
                    textAlignVertical: "center"
                  }}
                  rightIcon={{
                    name: "arrow-drop-down",
                    color: theme.colorGrey
                  }}
                  containerStyle={{
                    borderColor: theme.inputBordercolor,
                    borderRadius: 4,
                    borderWidth: 1,
                    paddingHorizontal: 0,
                    marginTop: 10
                  }}
                  placeholderTextColor={theme.colorGrey}
                  onFocus={() =>
                    this.setState({ doctorTypeModalVisible: true })
                  }
                  disable={true}
                  inputStyle={{
                    ...styles.title,
                    fontFamily: theme.font.regular,
                    marginLeft: 15
                  }}
                  placeholder={
                    !this.state.doctorType
                      ? "Type of doctor?"
                      : this.state.doctorType
                  }
                />
              )}
            </View>
            <View
              style={{
                marginTop: theme.size(10),
                marginBottom: theme.size(10)
              }}
            >
              <Button
                title="Update profile"
                onPress={() => this.onSubmit()}
                ViewComponent={LinearGradient}
                loading={this.state.loading}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}
