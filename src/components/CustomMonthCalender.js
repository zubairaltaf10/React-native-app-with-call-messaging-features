import * as React from "react";
import * as RN from "react-native";
import { Icon } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";
import { styles, theme } from "../styles";
import moment from "moment";
import { withNavigation } from "react-navigation";
class CustomCalendar extends React.Component {
  constructor(props) {
    super(props);
  }
  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  state = {
    activeDate: new Date()
  };
  componentDidMount() {
    this.props.onPress(this.state.activeDate);
  }
  generateMatrix() {
    var matrix = [];
    var year = this.state.activeDate.getFullYear();
    var month = this.state.activeDate.getMonth();

    var firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay == 0 ? 6 : firstDay - 1;
    var maxDays = this.nDays[month];
    var prevMonth = 0;
    var prevMonthMaxDays = 0;
    if (month === 0) {
      prevMonth = 11;
      prevMonthMaxDays = this.nDays[11];
    } else {
      prevMonth = month - 1;
      prevMonthMaxDays = this.nDays[month - 1];
    }
    // alert(firstDay)
    if (month == 1) {
      // February
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        maxDays += 1;
      }
    }

    var counter = 1;

    for (var row = 1; row < 7; row++) {
      matrix[row] = [];
      for (var k = 0; k < 7; k++) {
        matrix[row][k] = -1;
        if (row > 1 && counter <= maxDays) {
          // Fill in rows only if the counter's not greater than
          // the number of days in the month
          matrix[row][k] = { day: "12" };
        }
        // else if(counter==maxDays){
        //     return;
        // }
      }
    }

    return matrix;
  }
  changeMonth = n => {
    this.setState(() => {
      this.state.activeDate.setMonth(this.state.activeDate.getMonth() + n);
      return this.state;
    });
  };
  _onPress = item => {
    this.setState(() => {
      if (!item.disabled && item.day != -1) {
        this.state.activeDate.setDate(item.day);
        this.props.onPress(this.state.activeDate);
        return this.state;
      }
    });
  };
  render() {
    let hold = this.props.mood.filter(i => {
      if (
        this.months[moment(i.date).month()] ==
        this.months[this.state.activeDate.getMonth()]
      ) {
        return i;
      }
    });
    return (
      <RN.View>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[theme.colorGradientStart, theme.colorGradientEnd]}
          style={{
            // backgroundColor: "blue",
            // width: "15%",
            marginTop: 20,
            width: 350,
            height: 50,
            alignItems: "center",
            alignSelf: "center"
          }}
        >
          <RN.View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: 350,
              height: 50,
              alignItems: "center",
              alignSelf: "center",
              paddingHorizontal: 10
            }}
          >
            <Icon
              type={"simple-line-icon"}
              name="arrow-left"
              size={15}
              color={theme.colorAccent}
              onPress={() => this.changeMonth(-1)}
              underlayColor="transparent"
              hitSlop={{
                top: 10,
                left: 10,
                bottom: 10,
                right: 10
              }}
            />
            <RN.Text
              style={{
                //   fontWeight: "bold",
                // fontSize: 18,
                textAlign: "center",
                textAlignVertical: "center",
                ...styles.title,
                fontFamily: theme.font.regular,
                color: theme.colorAccent
              }}
            >
              {this.months[this.state.activeDate.getMonth()]} &nbsp;
              {this.state.activeDate.getFullYear()}
            </RN.Text>
            <Icon
              type={"simple-line-icon"}
              name="arrow-right"
              size={15}
              color={theme.colorAccent}
              onPress={() => this.changeMonth(+1)}
              underlayColor="transparent"
              //   useForeground={true}
              hitSlop={{
                top: 10,
                left: 10,
                bottom: 10,
                right: 10
              }}
            />
          </RN.View>
        </LinearGradient>
        <RN.View
          style={{
            flexWrap: "wrap",
            flexDirection: "row",
            marginHorizontal: 30,
            marginTop: 10
          }}
        >
          {hold.map(i => (
            <RN.TouchableOpacity
              style={[
                {
                  width: 30,
                  height: 30,
                  borderRadius: 3,
                  margin: 0.9
                },
                ["Sad", "Crying", "Depressed"].includes(i.mood)
                  ? { backgroundColor: "#ddd" }
                  : { backgroundColor: "#0f0" }
              ]}
              onPress={() => {
                this.props.navigation.navigate("ViewMood", {
                  mood: i,
                  enable: false
                });
              }}
            />
          ))}
        </RN.View>
      </RN.View>
    );
  }
}

export default withNavigation(CustomCalendar);
