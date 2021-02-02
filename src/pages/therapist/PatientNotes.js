import React, { Component } from 'react';
import { View, Text, BackHandler, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { styles, theme } from "../../styles";
import { ListItem, Icon, Button } from 'react-native-elements';
import Header from '../../components/Header';
//import { http } from "../../util/http";
import Snack from '../../components/Snackbar';
import BottomBar from '../../components/BottomBar.js'
import session from '../../data/session';
import Input from "../../components/Input";
import Slider from '../../components/Slider';
import LinearGradient from 'react-native-linear-gradient';

class PatientNotes extends Component {

    constructor(props) {
        super(props);
        let { width } = Dimensions.get('window');
        this.state = {
            loading: false,
            description: '',
            anxiety: 0,
            energy: 0,
            confidence: 0,
            width: width - 32,
            userId: props.navigation.getParam('userId')
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        this.props.navigation.goBack();
        return true
    }

    goBack = () => {
        this.props.navigation.goBack();
    }

    logout = () => {
        session.loggingOut();
        this.props.navigation.navigate('Login', { update: true })
    }

    onChange = (value, property) => {
        this.setState({ [property]: value })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.userId !== this.props.navigation.getParam('userId')) {
            this.setState({ userId: this.props.navigation.getParam('userId') })
        }
    }

    handlePress = (x, property) => {
        let value = Math.round((x - 16) / 17)
        if (value >= 20) { value = 20; }
        if (value <= 0) { value = 0; }
        value = value - 10
        this.setState({ [property]: value })
    }

    handleTap = (evt, property) => {
        let x = evt.nativeEvent.locationX;
        let value = Math.round((x - 16) / 17)
        if (value >= 20) { value = 20; }
        if (value <= 0) { value = 0; }
        value = value - 10
        this.setState({ [property]: value })
    }

    onSubmit = async () => {
        if (!this.state.loading) {
            let { anxiety, confidence, energy, description } = this.state;
            if (description.length === 0) {
                Snack("error", "Must describe what patient is feeling");
            }
            else {
                this.setState({ loading: true })
                const user = await session.getUser()
               
                        // Snack("success", "Patient note added successfully")
                        // this.setState({
                        //     loading: false,
                        //     description: '',
                        //     anxiety: 0,
                        //     energy: 0,
                        //     confidence: 0,
                        // })
                   
            }
        }

    }

    render() {
        return (
            <View style={styles.fillSpace}>
                <Header title={'Assigned users'} changeDrawer={this.goBack} icon={'arrow-back'} customStyles={{height: (76 * Dimensions.get('window').height)/896}} iconRight={'exit-to-app'} logout={this.logout} />
                    <View style={{ flex: 1, width: '100%', justifyContent: "space-between" }}>
                    <ScrollView style={[styles.bodyPadding]}>
                        <Text style={[styles.h1, { textAlign: 'center', color: theme.colorPrimary, marginTop: theme.size(10) }]}>Notes</Text>
                        <Text style={[styles.h2, { textAlign: 'center', color: "black" }]}>Type what patient is feeling</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <Input placeholder={"He's feeling..."} onChange={this.onChange} propertyName={'description'} multiline={true} numberOfLines={3} value={this.state.description} />
                        </View>
                        <Slider width={this.state.width} handleGesture={this.handleGesture} value={this.state.anxiety} property={'anxiety'} title={'Anxiety'} handlePress={this.handlePress} handleTap={this.handleTap} />
                        <Slider width={this.state.width} handlePress={this.handlePress} value={this.state.energy} property={'energy'} title={'Energy level'} handlePress={this.handlePress} handleTap={this.handleTap} />
                        <Slider width={this.state.width} handlePress={this.handlePress} value={this.state.confidence} property={'confidence'} title={'Self-Confidence'} handlePress={this.handlePress} handleTap={this.handleTap} />
                        <Button title="Save" onPress={() => this.onSubmit()} buttonStyle={{ borderRadius: 5 }} containerStyle={{ marginVertical: theme.size(20) }} loading={this.state.loading} ViewComponent={LinearGradient} />
                    </ScrollView>
                    <BottomBar
              options={[
                {
                  title: 'More',
                  icon: {
                    name: 'more-horiz',
                    color: 'white',
                    type: 'material-icons',
                  },
                  onPress: () => this.props.navigation.navigate('Dashboard'),
                },
                {
                  title: 'Home',
                  icon: {
                    name: 'home-outline',
                    color: 'white',
                    type: 'material-community',
                  },
                  onPress: () => this.props.navigation.navigate('Dashboard'),
                },
              ]}
            />
                </View>
            </View >
        )
        // }

    }
}


export default PatientNotes;