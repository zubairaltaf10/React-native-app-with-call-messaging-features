import { StyleSheet } from 'react-native';
import color from '../../styles/variables'
const dynamicStyles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: color.colorTextDark,
        marginBottom: 15,
    },
    description: {
        alignSelf: 'center',
        color: color.colorTextDark,
        textAlign: 'center',
        width: '85%',
        lineHeight: 20,
    },
    buttonContainer: {
        backgroundColor: color.colorGradientStart,
        width: '75%',
        height: 45,
        alignSelf: 'center',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    buttonName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});


export default dynamicStyles;
