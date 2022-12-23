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
    LgoinContainer: {
        alignItems: 'center',
        width: windowWidth,
        height: windowHeight
    },
    background: {
        flex: 1,
        width: windowWidth,
        height: windowHeight,
        position: 'absolute',
        top: 0
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
        color: '#B35CF8',
        marginLeft: 5,
        borderBottomWidth: 1,
        borderColor: '#B35CF8',
    },

    wrapper: {
        flexDirection: "row",
        justifyContent: "flex-start",
        flex: 0.2,
        alignItems: "center",
        paddingLeft: 29,
        paddingTop: 0,
        marginTop: 0

    },
    rectangle: {
        width: 50,
        backgroundColor: "yellow",
        margin: 0,
        justifyContent: "center",
        alignItems: "center",
        height: 52,
        borderColor: "black"

    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 27,
        borderRightWidth: 27,
        borderBottomWidth: 43,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: "yellow",
        transform: [
            { rotate: '90deg' }
        ],
        margin: 0,
        marginLeft: -6,
        borderWidth: 0,
        borderColor: "black"
    }
});