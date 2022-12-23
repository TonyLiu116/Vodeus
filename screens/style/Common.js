import { underline } from 'chalk';
import { StyleSheet, Platform } from 'react-native';
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
    background: {
        flex: 1,
        width: windowWidth,
        height: windowHeight,
        position: 'absolute',
        top: 0
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
    absoluteCenter:{
        position:'absolute',
        paddingHorizontal:16,
        width:'100%',
        bottom: 0
    },
    boxContainer:{
        alignItems:'center',
        justifyContent:'center',
        width:72,
        height:72,
        borderRadius:24,
        shadowColor:'rgba(42, 10, 111, 1)',
        shadowOffset:{width: 0, height: 2},
        shadowOpacity:0.5,
        shadowRadius:8,
        backgroundColor:'white',
        elevation:5,
    },
    segmentContainer:{
        position:'absolute',
        width:134,
        height:5,
        bottom:8,
        left:(windowWidth-133)/2,
        borderRadius:100,
        backgroundColor:'black'
    },
    swipeModal: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        marginTop:-10,
        flex:1,
    },
    cameraIcon: {
        width: 50,
        height: 50
    },
    swipeContainerContent: {
        position:'absolute',
        bottom:0,
        width:'100%',
        marginTop:30,
        minHeight:300,
        maxHeight:windowHeight-200,
        //  paddingHorizontal: 16,
        backgroundColor: 'white',
        // borderWidth:1,
        // borderColor:'rgba(0,0,0,0.2)',
    //   marginTop:windowHeight - 330,
    //   marginBottom:30,
        borderTopLeftRadius:16,
        borderTopRightRadius:16
    },
    swipeInputContainerContent: {
     //   position:'absolute',
     //   bottom:0,
        width:'100%',
        flex:1,
        marginTop:Platform.OS=='ios'?60:30,
      //  paddingHorizontal: 16,
        backgroundColor: 'white',
        borderWidth:1,
        borderColor:'rgba(0,0,0,0.2)',
     //   marginTop:windowHeight - 330,
     //   marginBottom:30,
        borderTopLeftRadius:16,
        borderTopRightRadius:16
    },
    topProfileContainer:{
        width:windowWidth,
        height:350,
        borderBottomLeftRadius:45,
        marginBottom:15,
        borderColor:'#FEC613'
    },
    rowAlignItems: {
       // display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    rowSpaceBetween: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    titleContainer:{
        display: 'flex',
        width:'100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft:16,
        paddingRight:12,
        paddingVertical:14,
        borderBottomColor:'#F2F0F5',
        borderBottomWidth:1,
        marginTop:Platform.OS=='ios'?40:10
    },
    bottomContainer:{
        position:'absolute',
        bottom:24,
        paddingHorizontal:16,
        width:windowWidth
    },
    rowSpaceEvenly: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems:'center'
    },
    rowSpaceAround: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems:'center'
    },
    numberContainer:{
        justifyContent:'center',
        alignItems:'center',
        width:42,
        height:24,
        borderRadius:12,
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
    contentCenter:{
        justifyContent:'center',
        alignItems:'center'
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
        fontSize: 17,
        fontFamily: 'SFProDisplay-Regular',
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
        borderRadius: 16,
        marginLeft:16
    },
});