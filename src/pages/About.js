import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  Linking,
  Dimensions,
  Image,
  ScrollView
} from "react-native";
import { styles, theme } from "../styles";
import { ListItem, Icon } from "react-native-elements";
import Header from "../components/Header";
import LinearGradient from "react-native-linear-gradient";
import { pukaarContact, pukaarEmail } from "../util/constants";
import diseaseTypes from "../util/enums/diseaseTypes";
import session from "../data/session";
const { width, height } = Dimensions.get("window");
export default class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worries: [
        { name: "Anxiety", icon: require("../../assets/aboutus/1.png") },
        { name: "Depression", icon: require("../../assets/aboutus/2.png") },
        { name: "Self Harm", icon: require("../../assets/aboutus/3.png") },
        { name: "PTSD", icon: require("../../assets/aboutus/1.png") },
        {
          name: "Relationship Issues",
          icon: require("../../assets/aboutus/4.png")
        },
        {
          name: "Suicidal Thoughts",
          icon: require("../../assets/aboutus/5.png")
        },
        { name: "Drug Addiction", icon: require("../../assets/aboutus/6.png") },
        {
          name: "Work-Life Issues",
          icon: require("../../assets/aboutus/7.png")
        },
        {
          name: "Anger Management",
          icon: require("../../assets/aboutus/8.png")
        },
        { name: "Mood Disorders", icon: require("../../assets/aboutus/9.png") },
        {
          name: "Emotional Regulation",
          icon: require("../../assets/aboutus/10.png")
        },
        { name: "Phobia", icon: require("../../assets/aboutus/11.png") },
        {
          name: "Self-Esteem Issues",
          icon: require("../../assets/aboutus/12.png")
        },
        {
          name: "Trauma and Abuse",
          icon: require("../../assets/aboutus/1.png")
        },
        {
          name: "Personality Disorders",
          icon: require("../../assets/aboutus/13.png")
        }
      ]
    };
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

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  displayDiseaseList = () => {
    let arr = [];
    for (let k in diseaseTypes) {
      // diseaseTypes[k]
      arr.push(diseaseTypes[k]);
    }
    return arr.map((disease, i) => {
      return (
        <Text key={i}>
          {"\n"} - {disease}
        </Text>
      );
    });
  };

  render() {
    return (
      <View style={{ ...styles.fillSpace, backgroundColor: "#f7f7f7" }}>
        <Header
          title={"About Us"}
          changeDrawer={this.goBack}
          icon={"arrow-back"}
          logout={this.logout}
          // customStyles={{
          //   height: (76 * Dimensions.get("window").height) / 896
          // }}
        />

        <View
          style={{
            flex: 1,
            width: "90%",
            justifyContent: "space-between",
            backgroundColor: "#f7f7f7"
          }}
        >
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View
              style={{
                height: "100%",
                marginTop: theme.size(20),
                marginLeft: 5,
                flex: 1
              }}
            >
              <Text
                style={[
                  styles.title,
                  {
                    // fontSize: 12,
                    textAlign: "center",
                    marginVertical: 20,
                    color: theme.colorGrey
                  }
                ]}
              >
                We at Pukaar, make it easy to talk about worries Anytime,
                Anywhere. Our mission is to provide people with easy access to
                well-trained psychologists, who are willing to help free of cost
                with the sole purpose of enabling people to live a happier and
                healthier life. We have psychologists who excel in various areas
                of expertise, having helped people with the following and more:
                {/* {this.displayDiseaseList()} */}
              </Text>
              <FlatList
                // scrollEnabled={false}
                // sc
                showsVerticalScrollIndicator={false}
                data={this.state.worries}
                numColumns={3}
                columnWrapperStyle={{
                  // marginHorizontal: 10,
                  // paddingHorizontal: 20,
                  alignSelf: "center"
                  // flex: 1,
                }}
                contentContainerStyle={{
                  // marginHorizontal: 10,
                  padding: 20,
                  alignSelf: "center"
                  // justifyContent: 'space-between',
                }}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: theme.colorAccent,
                      margin: 10,
                      width: width * 0.25,
                      height: width * 0.25,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 5,
                      elevation: 0.15
                    }}
                  >
                    {console.log(item.icon)}
                    {
                      <Image
                        source={item.icon}
                        style={{
                          alignSelf: "center",
                          width: 40,
                          height: 40,
                          margin: 5
                        }}
                        resizeMode="contain"
                      />
                    }
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          // fontSize: 8,
                          color: theme.colorGrey,
                          alignSelf: "center",
                          textAlign: "center",
                          margin: 5
                        }
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}
