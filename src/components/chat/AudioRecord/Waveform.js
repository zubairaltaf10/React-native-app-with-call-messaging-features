// // @flow
// import * as React from "react";
// import { StyleSheet, Dimensions, Animated } from "react-native";
// import { Svg } from "expo";
// import Svg from "react-native-svg";
// const { Rect, Defs, ClipPath } = Svg;

// const barWidth = 4;
// const barMargin = 1;
// const { width: wWidth } = Dimensions.get("window");
// const offset = wWidth / 2;
// const AnimatedRect = Animated.createAnimatedComponent(Rect);

// export default class Waveform extends React.PureComponent {
//   render() {
//     const { waveform, color, progress } = this.props;
//     const width = waveform.width * (barWidth + barMargin) + offset;
//     const height = waveform.height + barMargin + waveform.height * 0.61;
//     const x = progress
//       ? progress.interpolate({
//           inputRange: [0, width - wWidth - offset, width - wWidth],
//           outputRange: [`${-width + offset}`, `${-wWidth}`, "0"]
//         })
//       : 0;
//     return (
//       <Svg {...{ width, height }}>
//         <Defs>
//           <ClipPath id="progress">
//             <AnimatedRect {...{ width, height, x }} />
//           </ClipPath>
//         </Defs>
//         {waveform.samples.map((sample, key) => (
//           <React.Fragment {...{ key }}>
//             <Rect
//               clipPath="url(#progress)"
//               y={waveform.height - sample}
//               x={key * (barWidth + barMargin) + offset}
//               fill={color}
//               height={sample}
//               width={barWidth}
//             />
//             <Rect
//               clipPath="url(#progress)"
//               y={waveform.height + barMargin}
//               x={key * (barWidth + barMargin) + offset}
//               fill={color}
//               opacity={0.5}
//               height={sample * 0.61}
//               width={barWidth}
//             />
//           </React.Fragment>
//         ))}
//       </Svg>
//     );
//   }
// }

// const styles = StyleSheet.create({});
