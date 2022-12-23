import { underline } from 'chalk';
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
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rowSpaceEvenly: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    container: {
        width: windowWidth,
        height: windowHeight,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: 'rgba(255, 255, 255, 0.6)'
    },
    LoginContainer: {
        alignItems: 'center',
        width: windowWidth,
        height: windowHeight,
        flex:1
    },
    background: {
        flex: 1,
        width: windowWidth,
        height: windowHeight,
      //  position: 'absolute',
       // top: 0
    },
    externalButton: {
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F4EEF5',
        flexDirection: 'row',
    },
    externalButtonText: {
        fontSize: 17,
        fontFamily: 'SFProDisplay-Semibold',
        color: 'rgba(40, 30, 48, 0.8)'
    },
    signupButton: {
        fontSize: 15,
        fontFamily: 'SFProDisplay-Regular',
        textDecorationLine: 'underline',
        textDecorationStyle:'solid',
        textDecorationColor: '#B35CF8',
        color: '#B35CF8',
        marginLeft: 5,
       // marginBottom: -20.5,
    },

    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 2,
        borderColor: '#D4C9DE',
        fontFamily: "SFProDisplay-Bold",
        fontSize: 22,
        color: 'rgba(54, 36, 68, 0.8)'
    },
    rowAlignItems: {
        // display: 'flex',
         flexDirection: 'row',
         alignItems: 'center'
     },

    underlineStyleHighLighted: {
        borderColor: "#8327D8",
    },
    modalView: {
        width: '60%',
        margin: 20,
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 15,
        alignItems: "center",
        shadowColor: "#FFF",
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 1
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(31, 43, 69, 0.35)'
    },
    cameraIcon: {
        width: 50,
        height: 50
    },
    blurViewStyle: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    },
});