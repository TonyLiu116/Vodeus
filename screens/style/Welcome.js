import { StyleSheet } from 'react-native';


import { windowWidth, windowHeight } from '../../config/config';

export const widthRate = windowWidth / 411;
export const heightRate = windowHeight / 860;

export const styles = StyleSheet.create({
    //Common
    screenSize: {
        width: windowWidth,
        height: windowHeight,
        marginBottom: 40
    },
    row: {
        display: 'flex',
        flexDirection: 'row'
    },
    rowJustifyCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    rowSpaceBetween: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    rowSpaceEvenly: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    container: {
        width:'100%',
        height: '100%',
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: 'rgba(255, 255, 255, 0.6)'
    },
    WelcomeContainer: {
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    background: {
        flex: 1,
        width: '100%',
        height:'100%'
    },
    logo: {
        marginTop:40,
        width: 187,
        height: 85
    },
    rowAlignItems: {
        // display: 'flex',
         flexDirection: 'row',
         alignItems: 'center'
     },
    text: {
        color: "white",
        fontSize: 42,
        lineHeight: 84,
        textAlign: "center",
        backgroundColor: "#000000c0",
        fontFamily: 'SFUIDisplay-Bold'
    },
    registerButton: {
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    registerText: {
        fontSize: 17.39,
        fontFamily: 'SFProDisplay-Medium',
        color: '#361252'
    },
    loginText: {
        fontSize: 17.39,
        fontFamily: 'SFProDisplay-Medium',
        color: '#361252'
    },
    loginButton: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFF',
        width: '45%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
});