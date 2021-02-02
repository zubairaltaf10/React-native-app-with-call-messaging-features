import { StyleSheet } from 'react-native';
import color from '../../../styles/variables'
const dynamicStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    userImageContainer: {
        borderWidth: 0,
    },
    chatsChannelContainer: {
        // flex: 1,
        padding: 10,
    },
    chatItemContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    chatItemContent: {
        flex: 1,
        alignSelf: 'center',
        marginLeft: 10,
    },
    chatFriendName: {
        color: color.colorTextDark,
        fontSize: 17,
        fontWeight: '500',
    },
    content: {
        flexDirection: 'row',
        marginTop: 5,
    },
    message: {
        flex: 2,
        color: color.mainSubtextColor,
    },
});


export default dynamicStyles;
