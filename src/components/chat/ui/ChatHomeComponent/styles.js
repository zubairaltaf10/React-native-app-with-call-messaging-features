import { StyleSheet } from 'react-native';
import color from '../../../../styles/variables'
const dynamicStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.colorAccent,
    },
    userImageContainer: {
        borderWidth: 0,
    },
    chatsChannelContainer: {
        // flex: 1,
        padding: 10,
    },
    content: {
        flexDirection: 'row',
    },
    message: {
        flex: 2,
        color: color.mainSubtextColor,
    },
});


export default dynamicStyles;
