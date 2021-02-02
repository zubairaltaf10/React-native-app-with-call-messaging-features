import * as React from "react";
import * as RN from "react-native";
import { Icon } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";
import { styles, theme } from "../styles";

export default class CustomCalendar extends React.Component {
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
    matrix[0] = this.weekDays.map(weekDay => ({ day: weekDay }));

    var counter = 1;
    for (var row = 1; row < 7; row++) {
      matrix[row] = [];
      for (var col = 0; col < 7; col++) {
        matrix[row][col] = -1;
        if (row == 1 && col < firstDay) {
          matrix[row][col] = {
            day: prevMonthMaxDays - firstDay + col + 1,
            month: prevMonth,
            disabled: true
          };
        } else if (row == 1 && col >= firstDay) {
          // Fill in rows only after the first day of the month
          matrix[row][col] = { day: counter++, month };
        } else if (row > 1 && counter <= maxDays) {
          // Fill in rows only if the counter's not greater than
          // the number of days in the month
          matrix[row][col] = { day: counter++, month };
          if (counter === maxDays + 1) {
            var temp_counter = 1;
            for (col = col + 1; col < 7; col++) {
              matrix[row][col] = {
                day: temp_counter++,
                month: month === 11 ? 1 : month + 1,
                disabled: true
              };
            }
          }
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
    var matrix = this.generateMatrix();
    var rows = [];
    rows = matrix.map((row, rowIndex) => {
      //   row.every(e => e === -1) ? null : null;
      var rowItems = row.map((item, colIndex) => {
        return (
          <RN.TouchableOpacity
            onPress={() => this._onPress(item)}
            disabled={item.disabled}
            // underlayColor='transparent'
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={
                rowIndex == 0
                  ? [theme.colorLightGrey, theme.colorLightGrey]
                  : !item.disabled &&
                    item.day == this.state.activeDate.getDate()
                  ? [theme.colorGradientStart, theme.colorGradientEnd]
                  : [theme.colorAccent, theme.colorAccent]
              }
              style={{
                // backgroundColor: "blue",
                // width: "15%",
                width: 50,
                height: 50,
                alignItems: "center",
                alignSelf: "center"
              }}
            >
              <RN.Text
                style={[
                  {
                    flex: 1,
                    height: 50,
                    width: 50,
                    textAlign: "center",
                    textAlignVertical: "center",
                    // Highlight header

                    // Highlight Sundays
                    //   color: colIndex == 0 ? '#a00' : '#000',
                    // Highlight current date
                    //   backgroundColor:'#ddd',
                    ...styles.title,
                    // fontFamily:
                    //   !item.disabled &&
                    //   item.day == this.state.activeDate.getDate()
                    //     ? theme.font.bold
                    //     : theme.font.regular,
                    color:
                      !item.disabled &&
                      item.day == this.state.activeDate.getDate()
                        ? theme.colorAccent
                        : item.disabled
                        ? theme.colorGrey
                        : theme.colorDarkGrey,
                    borderColor: theme.colorGrey

                    // fontFamily:theme.font.regular
                  },
                  colIndex === 0
                    ? { borderLeftWidth: 0.5, borderRightWidth: 0.5 }
                    : { borderRightWidth: 0.5 },
                  matrix.length - 1 === rowIndex
                    ? { borderBottomWidth: 0.5 }
                    : null
                ]}
              >
                {item.day != -1 ? item.day : ""}
              </RN.Text>
            </LinearGradient>
          </RN.TouchableOpacity>
        );
      });

      return row.every(e => e === -1) ? null : (
        <RN.View
          style={[
            {
              flex: 1,
              flexDirection: "row",
              // padding: 15,
              justifyContent: "center",
              alignItems: "center"
            }
          ]}
        >
          {rowItems}
        </RN.View>
      );
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
            />
          </RN.View>
        </LinearGradient>
        {rows}
      </RN.View>
    );
  }
}
