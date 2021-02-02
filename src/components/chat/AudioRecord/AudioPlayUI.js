import React from "react";
import {
  View,
  Image,
  Text,
  Slider,
  TouchableOpacity,
  Platform,
  Alert
} from "react-native";
import { Icon } from "react-native-elements";
import Sound from "react-native-sound";
import { styles, theme } from "../../../styles";

export default class AudioPlayUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playState: "paused", //playing, paused
      playSeconds: 0,
      duration: 0
    };
    this.sliderEditing = false;
  }

  componentDidMount() {
    // this.play();

    this.setState({
      duration: this.props.duration ? parseInt(this.props.duration) : 0
    });
    this.timeout = setInterval(() => {
      if (
        this.sound &&
        this.sound.isLoaded() &&
        this.state.playState == "playing" &&
        !this.sliderEditing
      ) {
        this.sound.getCurrentTime((seconds, isPlaying) => {
          this.setState({ playSeconds: seconds });
        });
      }
    }, 100);
  }
  componentWillUnmount() {
    if (this.sound) {
      this.sound.release();
      this.sound = null;
    }
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  onSliderEditStart = () => {
    this.sliderEditing = true;
  };
  onSliderEditEnd = () => {
    this.sliderEditing = false;
  };
  onSliderEditing = value => {
    if (this.sound) {
      this.sound.setCurrentTime(value);
      this.setState({ playSeconds: value });
    }
  };

  play = async () => {
    if (this.sound) {
      this.sound.play(this.playComplete);
      this.setState({ playState: "playing" });
    } else {
      const filepath = this.props.url;
      console.log("[Play]", filepath);

      this.sound = new Sound(filepath, "", error => {
        if (error) {
          console.log("failed to load the sound", error);
          Alert.alert("Notice", "audio file error. (Error code : 1)");
          this.setState({ playState: "paused" });
        } else {
          this.setState({
            playState: "playing",
            duration: this.sound.getDuration()
          });
          this.sound.play(this.playComplete);
        }
      });
    }
  };
  playComplete = success => {
    if (this.sound) {
      if (success) {
        console.log("successfully finished playing");
      } else {
        console.log("playback failed due to audio decoding errors");
        Alert.alert("Notice", "audio file error. (Error code : 2)");
      }
      this.setState({ playState: "paused", playSeconds: 0 });
      this.sound.setCurrentTime(0);
    }
  };

  pause = () => {
    if (this.sound) {
      this.sound.pause();
    }

    this.setState({ playState: "paused" });
  };

  jumpPrev15Seconds = () => {
    this.jumpSeconds(-15);
  };
  jumpNext15Seconds = () => {
    this.jumpSeconds(15);
  };
  jumpSeconds = secsDelta => {
    if (this.sound) {
      this.sound.getCurrentTime((secs, isPlaying) => {
        let nextSecs = secs + secsDelta;
        if (nextSecs < 0) nextSecs = 0;
        else if (nextSecs > this.state.duration) nextSecs = this.state.duration;
        this.sound.setCurrentTime(nextSecs);
        this.setState({ playSeconds: nextSecs });
      });
    }
  };

  getAudioTimeString(seconds) {
    let second = this.state.duration - seconds;
    const h = parseInt(second / (60 * 60));
    const m = parseInt((second % (60 * 60)) / 60);
    const s = parseInt(second % 60);

    if (h > 0) {
      return (
        (h < 10 ? "0" + h : h) +
        ":" +
        (m < 10 ? "0" + m : m) +
        ":" +
        (s < 10 ? "0" + s : s)
      );
    } else {
      return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }
  }

  render() {
    const currentTimeString = this.getAudioTimeString(this.state.playSeconds);
    //  const durationString = this.getAudioTimeString(this.state.duration);

    return (
      <View
        style={{
          //   marginVertical: 15,
          marginHorizontal: 15,
          flexDirection: "row"
        }}
      >
        <Text
          style={{
            ...styles.subtitle,
            color: this.props.reciever ? "black" : "white",
            alignSelf: "center"
          }}
        >
          {currentTimeString}
        </Text>
        <Slider
          onTouchStart={this.onSliderEditStart}
          // onTouchMove={() => console.log('onTouchMove')}
          onTouchEnd={this.onSliderEditEnd}
          // onTouchEndCapture={() => console.log('onTouchEndCapture')}
          // onTouchCancel={() => console.log('onTouchCancel')}
          onValueChange={this.onSliderEditing}
          value={this.state.playSeconds}
          maximumValue={this.state.duration}
          maximumTrackTintColor={this.props.reciever ? "gray" : "white"}
          minimumTrackTintColor={this.props.reciever ? "black" : "white"}
          thumbTintColor={this.props.reciever ? "black" : "white"}
          style={{
            flex: 1,
            alignSelf: "center",
            marginHorizontal: Platform.select({ ios: 5 })
          }}
        />
        {this.state.playState == "playing" && (
          <TouchableOpacity
            onPress={this.pause}
            style={{ marginHorizontal: 5 }}
          >
            <Icon
              name={"pause"}
              type="font-awesome"
              size={20}
              color={this.props.reciever ? "black" : "white"}
              underlayColor="transparent"
            />
          </TouchableOpacity>
        )}
        {this.state.playState == "paused" && (
          <TouchableOpacity onPress={this.play} style={{ marginHorizontal: 5 }}>
            <Icon
              name={"play"}
              type="font-awesome"
              size={20}
              color={this.props.reciever ? "black" : "white"}
              underlayColor="transparent"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
