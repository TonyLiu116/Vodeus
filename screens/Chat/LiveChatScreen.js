import React, { useState, useEffect, useRef, useReducer } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Vibration,
    Image,
    Text,
    ImageBackground,
    Platform,
    Pressable,
    KeyboardAvoidingView,
    RefreshControl
} from 'react-native';

import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

import * as Progress from "react-native-progress";
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { Menu } from 'react-native-material-menu';
import RNFetchBlob from 'rn-fetch-blob';
import { recorderPlayer } from '../Home/AudioRecorderPlayer';
import { NavigationActions, StackActions } from 'react-navigation';
import { DescriptionText } from '../component/DescriptionText';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import trashSvg from '../../assets/chat/trash.svg';
import replySvg from '../../assets/chat/reply.svg';
import selectSvg from '../../assets/chat/select.svg';
import closeSvg from '../../assets/chat/close.svg';
import emojiSymbolSvg from '../../assets/common/emoji_symbol.svg'
import gifSymbolSvg from '../../assets/common/gif_symbol.svg'
import { SvgXml } from 'react-native-svg';
import arrowSvg from '../../assets/chat/arrow.svg';
import photoSvg from '../../assets/chat/photo.svg';
import disableNotificationSvg from '../../assets/chat/disable_notification.svg';
import recordSvg from '../../assets/common/bottomIcons/record_green.svg';
import {
    GifSearch,
} from 'react-native-gif-search'

import { Avatars, windowHeight, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import VoiceService from '../../services/VoiceService';
import { useSelector, useDispatch } from 'react-redux';
import { setMessageCount, setRefreshState, setVoiceState } from '../../store/actions';
import moreSvg from '../../assets/common/more.svg';
import triangleSvg from '../../assets/common/green_triangle.svg';
import simplePauseSvg from '../../assets/common/simple_pause_green.svg';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import Draggable from 'react-native-draggable';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { use } from 'i18next';
import VoicePlayer from '../Home/VoicePlayer';
import { MessageItem } from '../component/MessageItem';
import { TitleText } from '../component/TitleText';
import { PhotoSelector } from '../component/PhotoSelector';
import SwipeDownModal from 'react-native-swipe-down';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { ChatComposer } from '../component/ChatComposer';
import { ChatMessageItem } from '../component/ChatMessageItem';
import LinearGradient from 'react-native-linear-gradient';

const LiveChatScreen = (props) => {

    let { user, refreshState, voiceState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const dispatch = useDispatch();

    const { t, i18n } = useTranslation();

    const params = props.navigation.state.params;
    const hostUser = params?.hostUser ? params.hostUser : user;

    const [menuVisible, setMenuVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState(0);
    const [key, setKey] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [replyIdx, setReplyIdx] = useState(-1);
    const [fill, setFill] = useState(0);
    const [isPublish, setIsPublish] = useState(false);
    const [isOnline, setIsOnline] = useState(null);
    const [isSelectingPhoto, setIsSelectingPhoto] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [otherState, setOtherState] = useState('');
    const [showComment, setShowComment] = useState(false);
    const [label, setLabel] = useState('');
    const [userNumber, setUserNumber] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const mounted = useRef(false);
    const dragPos = useRef(0);
    const wasteTime = useRef(0);
    const scrollRef = useRef();

    recorderPlayer.setSubscriptionDuration(0.2);

    const dirs = RNFetchBlob.fs.dirs;

    const path = Platform.select({
        ios: `${dirs.CacheDir}/hello.m4a`,
        android: `${dirs.CacheDir}/hello.mp3`,
    });

    const onDateCompare = (a, b) => {
        return new Date(a).getDate() == new Date(b).getDate() && new Date(a).getMonth() == new Date(b).getMonth()
            && new Date(a).getFullYear == new Date(b).getFullYear
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const renderState = (lastSeen) => {
        if (lastSeen == "onSession") {
            if (otherState == 'start')
                return t("Recording...");
            return t("Online")
        }
        else if (lastSeen == null) {
            return ''
        }
        else {
            let num = Math.ceil((new Date().getTime() - new Date(lastSeen).getTime()) / 60000);
            let minute = num % 60;
            num = (num - minute) / 60;
            let hour = num % 24;
            let day = (num - hour) / 24
            let time = (day > 0 ? (day.toString() + ' ' + t("day") + (day > 1 ? 's' : '')) : (hour > 0 ? (hour.toString() + ' ' + t("hour") + (hour > 1 ? 's' : '')) : (minute > 0 ? (minute.toString() + ' ' + t("minute") + (minute > 1 ? 's' : '')) : '')));
            return t("Online ") + time + t(" ago");
        }
    }

    const renderTime = (v) => {
        const updatedTime = new Date(v);
        const nowTime = new Date();
        if (updatedTime.getFullYear() != nowTime.getFullYear()) {
            return updatedTime.toDateString().substring(4);
        }
        else if (nowTime.getMonth() != updatedTime.getMonth() || (nowTime.getDate() - updatedTime.getDate() > nowTime.getDay())) {
            return t(months[updatedTime.getMonth()]) + ' ' + updatedTime.getDate().toString();
        }
        else if (nowTime.getDate() - 1 > updatedTime.getDate()) {
            return t(days[updatedTime.getDay()]);
        }
        else if (nowTime.getDate() - 1 == updatedTime.getDate()) {
            return t("Yesterday")
        }
        else {
            return t("Today")
        }
    }

    const onAnswerBio = () => {
        handleSubmit('bio', label, replyIdx)
        setLabel('');
    }

    const onAnswerGif = (gif) => {
        setShowComment(false);
        handleSubmit('gif', gif, replyIdx)
    }

    const sendEmoji = (icon, index) => {
        handleSubmit("emoji", icon, index);
    }

    const handleSubmit = async (fileType, v, replyIndex) => {
        if (fileType == 'bio' || fileType == 'gif' || fileType == 'emoji') {
            socketInstance.emit('newChatMessage', {
                info: {
                    hostUserId: hostUser.id,
                    type: fileType,
                    value: v,
                    user: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        avatarNumber: user.avatarNumber
                    }
                }
            })
        }
        else {
            let fileName = '', filePath = '';
            if (fileType == 'voice') {
                fileName = Platform.OS === 'android' ? 'message.mp3' : 'message.m4a';
                filePath = RNFetchBlob.wrap(String(path));
            }
            else if (fileType == 'photo') {
                fileName = v.fileName;
                let fileUri = Platform.OS == 'android' ? v.uri : decodeURIComponent(v.uri.replace('file://', ''));
                filePath = RNFetchBlob.wrap(fileUri);
            }
            let sendFile = [
                { name: 'type', data: fileType },
                { name: 'file', filename: fileName, data: filePath },
            ];
            setIsLoading(true);
            VoiceService.postChatMessage(sendFile).then(async res => {
                const jsonRes = await res.json();
                if (res.respInfo.status !== 201) {
                } else if (mounted.current) {
                    Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                    socketInstance.emit('newChatMessage', {
                        info: {
                            hostUserId: hostUser.id,
                            type: fileType,
                            value: jsonRes.url,
                            user: {
                                id: user.id,
                                name: user.name,
                                avatar: user.avatar,
                                avatarNumber: user.avatarNumber
                            }
                        }
                    })
                    setIsPublish(false);
                    setIsLoading(false);
                }
            })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    const clearRecorder = async () => {
        wasteTime.current = 0;
        await recorderPlayer.stopRecorder()
            .then(res => {
            })
            .catch(err => {
                console.log(err);
            });
        recorderPlayer.removeRecordBackListener();
    }

    const onChangeRecord = async (e, v = false) => {
        if (v == true && isRecording == false) {
            Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
            onStartRecord();
        }
        if (v == false && isRecording == true) {
            onStopRecord(dragPos.current > -100 && wasteTime.current > 0)
        }
    }

    const onStopRecord = async (publish) => {
        setIsRecording(false);
        if (publish == true) {
            setDuration(wasteTime.current);
            setIsPublish(true);
        }
        else
            setReplyIdx(-1);
        //   socketInstance.emit("chatState", { fromUserId: user.id, toUserId: senderId, state: 'stop' });
        clearRecorder();
    };

    const onStartRecord = async () => {
        if (isRecording == false) {
            setIsRecording(true);
            dragPos.current = 0;
            const dirs = RNFetchBlob.fs.dirs;
            const path = Platform.select({
                ios: `hello.m4a`,
                android: `${dirs.CacheDir}/hello.mp3`,
            });
            const audioSet = {
                AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
                AudioSourceAndroid: AudioSourceAndroidType.MIC,
                AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
                AVNumberOfChannelsKeyIOS: 2,
                AVFormatIDKeyIOS: AVEncodingOption.aac,
            };
            dispatch(setVoiceState(voiceState + 1));
            //   socketInstance.emit("chatState", { fromUserId: user.id, toUserId: senderId, state: 'start' });
            await recorderPlayer.startRecorder(path, audioSet).then(res => {
            })
                .catch(err => {
                    console.log(err);
                });
            recorderPlayer.addRecordBackListener((e) => {
                wasteTime.current = e.currentPosition;
                if (e.currentPosition >= fill * 1000) {
                    onStopRecord(true);
                }
            });
        }
    };

    useEffect(() => {
        mounted.current = true;
        setFill(user.premium == 'none' ? 30 : 60);
        socketInstance.emit(
            "getChatMessages",
            {
                hostUser: {
                    id: hostUser.id,
                    avatar: hostUser.avatar,
                    avatarNumber: hostUser.avatarNumber,
                    name: hostUser.name,
                },
                title: params.title,
                content: params.content,
                messages: [],
                users: [],
                userId: user.id
            },
            (chatRoom) => {
                if (mounted.current) {
                    setMessages(chatRoom.messages);
                    setUserNumber(chatRoom.users.length);
                    setIsLoading(false);
                }
            }
        )
        socketInstance.on("addChatMessage", ({ message }) => {
            setMessages((prev) => {
                prev.push(message);
                return [...prev];
            });
        });
        socketInstance.on("exitChatRoom", ({ info }) => {
            setUserNumber(userNumber - 1);
        });
        socketInstance.on("enterChatRoom", ({ userId }) => {
            setUserNumber(userNumber + 1);
        });
        socketInstance.on("deleteChatRoom", ({ roomId }) => {
            if (roomId == hostUser.id)
                props.navigation.goBack();
        });
        return () => {
            mounted.current = false;
            socketInstance.emit("exitChatRoom", { info: { roomId: hostUser.id, userId: user.id } })
            socketInstance.off('addChatMessage');
            socketInstance.off('exitChatRoom');
            socketInstance.off('deleteChatRoom');
        };
    }, [])

    return (
        <KeyboardAvoidingView
            style={{
                backgroundColor: '#FFF',
                flex: 1
            }}
        >
            <ImageBackground
                source={require('../../assets/Feed/head_back_green.png')}
                style={{
                    width: windowWidth,
                    height: windowWidth * 83 / 371,
                    justifyContent: 'flex-end'
                }}
                imageStyle={{
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 12
                }}>
                    <TouchableOpacity
                        style={styles.rowAlignItems}
                    //      onPress={() => props.navigation.navigate('UserProfile', { userId: senderId })}
                    >
                        <View
                        //        onPress={() => props.navigation.navigate('UserProfile', { userId: senderId })}
                        >
                            <Image
                                source={hostUser.avatar ? { uri: hostUser.avatar.url } : Avatars[hostUser.avatarNumber].uri}
                                style={{ width: 46, height: 46, marginLeft: 25, borderRadius: 24 }}
                                resizeMode='cover'
                            />
                        </View>
                        <View style={{
                            marginLeft: 16
                        }}>
                            <View>
                                <SemiBoldText
                                    text={hostUser.name}
                                    fontSize={20}
                                    lineHeight={24}
                                    color='#FFF'
                                />
                            </View>
                            {userNumber > 0 && <DescriptionText
                                text={userNumber.toString() + ' members online'}
                                fontSize={13}
                                lineHeight={21}
                                color='#FFF'
                            />}
                        </View>
                    </TouchableOpacity>
                    <Menu
                        visible={menuVisible}
                        anchor={
                            <TouchableOpacity
                                onPress={() => setMenuVisible(true)}
                            >
                                <Image
                                    source={require('../../assets/Feed/menu_ring_green.png')}
                                    style={{
                                        width: 57,
                                        height: 55.5,
                                        marginTop: 15,
                                        marginRight: 10
                                    }}
                                />
                            </TouchableOpacity>
                        }
                        style={{
                            width: 250,
                            height: 129,
                            borderRadius: 16,
                            backgroundColor: '#FFF',
                        }}
                        onRequestClose={() => setMenuVisible(false)}
                    >
                        <TouchableOpacity
                            style={styles.contextMenu}
                            onPress={() => { }}
                        >
                            <TitleText
                                text={t("Select")}
                                fontSize={17}
                                fontFamily="SFProDisplay-Regular"
                            />
                            <SvgXml
                                width={20}
                                height={20}
                                xml={selectSvg}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contextMenu}
                            onPress={() => { }}
                        >
                            <TitleText
                                text={t("Disable Notification")}
                                fontSize={17}
                                fontFamily="SFProDisplay-Regular"
                            />
                            <SvgXml
                                width={20}
                                height={20}
                                xml={disableNotificationSvg}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.contextMenu, { borderBottomWidth: 0 }]}
                            onPress={() => { }}
                        >
                            <TitleText
                                text={t("Clear chat")}
                                fontSize={17}
                                color='#E41717'
                                fontFamily="SFProDisplay-Regular"
                            />
                            <SvgXml
                                width={20}
                                height={20}
                                xml={trashSvg}
                            />
                        </TouchableOpacity>
                    </Menu>
                </View>
            </ImageBackground>
            <ScrollView
                style={{ paddingHorizontal: 8 }}
            >
                {messages.map((item, index) => {
                    let ancestorIdx = null;
                    return <View key={"messageItem" + index.toString()}>
                        {(index == 0 || !onDateCompare(item.createdAt, messages[index - 1].createdAt)) &&
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, marginBottom: 8 }}>
                                <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(59, 31, 82, 0.6)' }}>
                                    <Text
                                        style={{
                                            fontFamily: "SFProDisplay-Regular",
                                            fontSize: 11,
                                            lineHeight: 12,
                                            color: '#F6EFFF',
                                            //textAlign: 'center',
                                        }}
                                    >
                                        {
                                            renderTime(item.createdAt)
                                        }
                                    </Text>
                                </View>
                            </View>
                        }
                        <ChatMessageItem
                            props={props}
                            info={item}
                        />
                    </View>
                })}
                <View style={{ height: 110 }}></View>
            </ScrollView>
            {!isPublish ?
                <>
                    {isRecording && <View style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 40,
                        width: 328,
                        height: 56,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <ImageBackground
                            style={{
                                position: 'absolute',
                                height: 56,
                                width: 328,
                                justifyContent: 'center'
                            }}
                            resizeMode="stretch"
                            source={require('../../assets/chat/chatRecord.png')}
                        >
                            <DescriptionText
                                text={t("Swipe to Cancel")}
                                fontSize={13}
                                lineHeight={13}
                                color='#E41717'
                                marginLeft={188}
                            />
                        </ImageBackground>
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                marginLeft: 24,
                                borderRadius: 4,
                                backgroundColor: "#E41717"
                            }}
                        ></View>
                        <CountdownCircleTimer
                            key={key}
                            isPlaying={isRecording}
                            duration={fill}
                            size={57}
                            strokeWidth={0}
                            trailColor="#D4C9DE"
                            trailStrokeWidth={0}
                            // onComplete={() => onStopRecord(true)}
                            colors={[
                                ['#B35CF8', 0.4],
                                ['#8229F4', 0.4],
                                ['#8229F4', 0.2],
                            ]}
                        >
                            {({ remainingTime, animatedColor }) => {
                                return (
                                    <DescriptionText
                                        text={new Date(wasteTime.current).toISOString().substr(14, 5)}
                                        lineHeight={24}
                                        color="rgba(54, 36, 68, 0.8)"
                                        fontSize={15}
                                    />
                                )
                            }}
                        </CountdownCircleTimer>
                    </View>}
                </>
                :
                <View style={{
                    position: 'absolute',
                    width: windowWidth,
                    bottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: 12,
                            paddingVertical: 8,
                            backgroundColor: '#FFF',
                            borderRadius: 30,
                        }}
                    >
                        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                            <LinearGradient
                                colors={['#3C9289', '#3C9289']}
                                locations={[0, 1]}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                style={{
                                    width: 37,
                                    height: 37,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 4
                                }}
                            >
                                <SvgXml
                                    xml={isPlaying ? simplePauseSvg : triangleSvg}
                                    width={13.33}
                                    height={16.67}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                        <VoicePlayer
                            waveColor={['#0B776C', '#0B776C', '#0B776C']}
                            timeColor='#000'
                            playing={isPlaying}
                            stopPlay={() => setIsPlaying(false)}
                            startPlay={() => setIsPlaying(true)}
                            tinWidth={windowWidth / 300}
                            mrg={windowWidth / 600}
                            duration={duration}
                        />
                        <TouchableOpacity onPress={() => setIsPublish(false)}>
                            <SvgXml
                                width={24}
                                height={24}
                                xml={redTrashSvg}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity disabled={isLoading} onPress={() => handleSubmit('voice', null, replyIdx)}>
                        <Image
                            style={{
                                height: 56,
                                width: 56,
                                marginLeft: 4
                            }}
                            resizeMode="stretch"
                            source={require('../../assets/post/answerPublish.png')}
                        />
                    </TouchableOpacity>
                </View>
            }
            <SwipeDownModal
                modalVisible={showComment}
                ContentModal={
                    <View style={{
                        position: 'absolute',
                        top: 100,
                        width: windowWidth,
                        alignItems: 'center'
                    }}>
                        <View style={{
                            height: 470,
                            backgroundColor: '#FFF',
                            shadowColor: 'rgba(88, 74, 117, 1)',
                            elevation: 10,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            borderRadius: 16,
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <GifSearch
                                giphyApiKey={'lOPWZ8ORMutlKj0R1uqZV47rKbhuwrHt'}
                                onGifSelected={(gif_url) => onAnswerGif(gif_url)}
                                style={{ backgroundColor: '#FFF', height: 300, width: 400 }}
                                textInputStyle={{ fontWeight: 'bold', color: 'black' }}
                                loadingSpinnerColor={'black'}
                                placeholderTextColor='rgba(59, 31, 82, 0.6)'
                                numColumns={3}
                                provider={"giphy"}
                                //providerLogo={poweredByGiphyLogoGrey}
                                showScrollBar={false}
                                noGifsFoundText={"No Gifs found :("}
                            />
                        </View>
                    </View>
                }
                ContentModalStyle={styles.swipeModal}
                onClose={() => {
                    setShowComment(false);
                }}
            />
            {isSelectingPhoto &&
                <PhotoSelector
                    onSendPhoto={(v) => { setIsSelectingPhoto(false); handleSubmit('photo', v, replyIdx); }}
                    onCloseModal={() => setIsSelectingPhoto(false)}
                />
            }
            {isLoading &&
                <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(1,1,1,0.3)' }}>
                    <View style={{ marginTop: windowHeight / 2.5, alignItems: 'center', width: windowWidth }}>
                        <Progress.Circle
                            indeterminate
                            size={30}
                            color="rgba(0, 0, 255, 0.7)"
                            style={{ alignSelf: "center" }}
                        />
                    </View>
                </View>
            }
            {(!isRecording && !isPublish) &&
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    width: windowWidth,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    backgroundColor: '#FFF',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    marginTop: 8,
                    paddingTop: 6,
                    paddingBottom: 16,
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                    }}>
                        <ChatComposer
                            text={label}
                            onChangeText={setLabel}
                            onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
                            onSend={onAnswerBio}
                            showGif={() => setShowComment(!showComment)}
                        //showGif={() => setIsSelectingPhoto(true)}
                        />
                    </View>
                </View>
            }
            {!isPublish && <View style={{ position: 'absolute', bottom: isRecording ? 81 : 68, width: '100%', alignItems: 'center' }}>
                <Draggable
                    key={key}
                    x={isRecording ? windowWidth - 72 : windowWidth - 60}
                    y={0}
                    shouldReverse={true}
                    minX={windowWidth / 5 * 3}
                    maxX={windowWidth - 16}
                    minY={0}
                    maxY={0}
                    touchableOpacityProps={{
                        activeOpactiy: 1,
                    }}
                    onDrag={(event, gestureState) => {
                    }}
                    onDragRelease={(event, gestureState, bounds) => {
                        dragPos.current = gestureState.dx;
                        if (gestureState.dx <= -100) {
                            Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                            setTimeout(() => {
                                Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                            }, 300);
                        }
                    }}
                    onReverse={() => {

                    }}

                >
                    <View
                        onTouchStart={(e) => onChangeRecord(e, true)}
                        onTouchEnd={(e) => onChangeRecord(e, false)}
                        style={{
                            opacity: isRecording ? 5 : 1
                        }}
                    >
                        <SvgXml
                            width={isRecording ? 68 : 53.6}
                            height={isRecording ? 68 : 53.6}
                            xml={recordSvg}
                        />
                    </View>
                </Draggable>
            </View>}
        </KeyboardAvoidingView>
    )
}

export default LiveChatScreen;
