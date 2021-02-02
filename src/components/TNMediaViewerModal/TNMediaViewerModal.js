import React from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Modal from 'react-native-modalbox';
import Image from 'react-native-image-progress';
import CircleSnail from 'react-native-progress/CircleSnail';
import styles from './styles';
let dimensions = Dimensions.get('window');
let imageHeight = Math.round((dimensions.width * 9) / 16);
let imageWidth = dimensions.width;
const {width, height} = Dimensions.get('window');
const swipeArea = Math.floor(height * 0.2);
const circleSnailProps = {thickness: 1, color: '#ddd', size: 80};

export default class TNMediaViewerModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      calcImgHeight: 0,
      calcImgWidth: 0,
      orientation: 'portrait',
      devicetype: 'phone',
      imgWidth: 0,
      imgHeight: 0,
    };
    this.imageLoading = false;
    this.imageDoneLoading = false;
    this.mediaLayouts = [];
    this.scrollviewRef = React.createRef();
  }

  onScrollView = scrollviewRef => {
    setTimeout(() => {
      if (scrollviewRef) {
        scrollviewRef.scrollTo({
          y: 0,
          x: this.mediaLayouts[this.props.selectedMediaIndex],
          animated: false,
        });
      }
    }, 50);
  };

  renderCloseButton() {
    return (
      <TouchableOpacity
        style={styles.closeButton}
        onPress={this.props.onClosed}>
        <View style={[styles.closeCross, {transform: [{rotate: '45deg'}]}]} />
        <View style={[styles.closeCross, {transform: [{rotate: '-45deg'}]}]} />
      </TouchableOpacity>
    );
  }

  render() {
    Dimensions.addEventListener('change', () => {});
    const {isModalOpen, onClosed} = this.props;
    const {calcImgHeight, calcImgWidth} = this.state;

    return (
      <Modal
        style={styles.container}
        isOpen={isModalOpen}
        onClosed={onClosed}
        position="center"
        swipeToClose
        swipeArea={swipeArea}
        swipeThreshold={4}
        coverScreen={true}
        backButtonClose={true}
        useNativeDriver={Platform.OS === 'android' ? true : false}
        animationDuration={500}>
        {this.renderCloseButton()}
        <ScrollView
          ref={this.onScrollView}
          style={{flex: 1}}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          //  removeClippedSubviews={true}
        >
          {this.props.mediaItems.length > 0 &&
            this.props.mediaItems.map((uri, index) => (
              <View
                key={index}
                style={styles.container}
                onLayout={event => {
                  const layout = event.nativeEvent.layout;
                  this.mediaLayouts[index] = layout.x;
                }}>
                {/* <FitImage
                  indicator={CircleSnail} // disable loading indicator
                  // indicatorColor="white" // react native colors or color codes like #919191
                  // indicatorSize="large" // (small | large) or integer
                  source={{
                    uri,
                  }}
                  loadingIndicatorSource={circleSnailProps}
                  style={{ height: 300, width: width, backgroundColor: 'red', aspectRatio: 1, }}
                  //resizeMode='contain'
                  onLoad={() => {

                    Image.getSize(uri, (width, height) => {
                      this.setState({
                        calcImgHeight:
                          height
                      });
                    }, (error) => {

                      console.log(error);
                    });
                    // this.setState({
                    //   calcImgHeight:
                    //     (evt.nativeEvent.source.height /
                    //       evt.nativeEvent.source.width) *
                    //     width,
                    //   calcImgWidth: (evt.nativeEvent.source.height /
                    //     evt.nativeEvent.source.width) *
                    //     height
                    // });

                  }}
                /> */}

                <Image
                  source={{
                    uri,
                  }}
                  style={[
                    {
                      height: calcImgHeight,
                      // // flex: 1,
                      width: width,
                      //  backgroundColor: 'red',
                      // //aspectRatio: calcImgWidth,
                      // //resizeMode: 'contain'
                      // overflow: 'visible'
                    },
                  ]}
                  indicator={CircleSnail}
                  indicatorProps={circleSnailProps}
                  resizeMode={'contain'}
                  resizeMethod="auto"
                  onLoad={evt => {
                    // console.log(evt.nativeEvent.source.height, evt.nativeEvent.source.width)
                    this.setState({
                      calcImgHeight:
                        (evt.nativeEvent.source.height /
                          evt.nativeEvent.source.width) *
                        width,
                      calcImgWidth:
                        (evt.nativeEvent.source.height /
                          evt.nativeEvent.source.width) *
                        height,
                    });
                  }}
                />
              </View>
            ))}
        </ScrollView>
      </Modal>
    );
  }
}

TNMediaViewerModal.propTypes = {
  mediaItems: PropTypes.array,
  onClosed: PropTypes.func,
  isModalOpen: PropTypes.bool,
};
