import { underline } from 'chalk';
import { StyleSheet } from 'react-native';
import { Directions } from 'react-native-gesture-handler';


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
    paddingH16: {
        paddingHorizontal: 16
    },
    paddingH12: {
        paddingHorizontal: 12
    },
    mt16: {
        marginTop: 16,
    },
    mv16: {
        marginVertical: 16,
    },
    mt25: {
        marginTop: 25,
    },
    buttonText: {
        justifyContent: 'center',
        alignItems: 'center',
        color: '#4C64FF',
        backgroundColor: '#FFF',
        padding: 15,
        width: 52,
        height: 52,
        borderRadius: 14,
    },
    buttonContainer: {
        width: 56,
        alignItems: 'center',
        padding: 1,
        borderRadius: 16,
    },
    searchInput: {
        backgroundColor: '#F2F0F5',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CC9BF9',
        fontSize: 17,
        fontFamily: 'SFProDisplay-Regular',
        paddingRight: 16,
        paddingVertical: 10,
        width: '84%'
    },
    searchIcon: {
        position: 'absolute',
        left: 20,
        top: 15,
        zIndex: 2
    },
    searchBox: {
        backgroundColor: '#F2F0F5',
        borderRadius: 24,
        fontSize: 17,
        fontFamily: 'SFProDisplay-Regular',
        paddingLeft: 55,
        paddingRight: 16,
        paddingVertical: 12,
        width: "100%",
        justifyContent: 'center',
    },
    contextMenu: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#D4C9DE',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    contextWrap: {
        backgroundColor: '#FFF',
        width: "65%",
        marginTop: 20,
        borderRadius: 16
    },
});