import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
    Platform, Pressable, SafeAreaView, Text, TouchableOpacity, Vibration, View, FlatList, ImageBackground, Image
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native';
import Share from 'react-native-share';
import { SvgXml } from 'react-native-svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { useDispatch, useSelector } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import closeSvg from '../../assets/common/close.svg';
import circlePlusSvg from '../../assets/Feed/circle_plus.svg';
import notificationSvg from '../../assets/discover/notification.svg';
import notificationWhiteSvg from '../../assets/Feed/notification_white.svg';
import chatWhiteSvg from '../../assets/Feed/chat_white.svg';
import searchSvg from '../../assets/login/search.svg';
import black_settingsSvg from '../../assets/notification/black_settings.svg';
import { Avatars, FIRST_ROOM, windowWidth } from '../../config/config';
import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import { setMessageCount, setRedirect, setRefreshState, setRequestCount, setUser } from '../../store/actions';
import { AllCategory } from '../component/AllCategory';
import { BirdRoom } from '../component/BirdRoom';
import { BirdRoomItem } from '../component/BirdRoomItem';
import { BottomButtons } from '../component/BottomButtons';
import { CreateRoom } from '../component/CreateRoom';
import { DailyPopUp } from '../component/DailyPopUp';
import { DescriptionText } from '../component/DescriptionText';
import { Discover } from '../component/Discover';
import { RecordIcon } from '../component/RecordIcon';
import { SemiBoldText } from '../component/SemiBoldText';
import { ShareHint } from '../component/ShareHint';
import { WelcomeBirdRoom } from '../component/WelcomeBirdRoom';
import { styles } from '../style/Common';
import KeyboardAvoidingView from 'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView';
import { TitleText } from '../component/TitleText';
import { Live } from '../component/Live';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import { ChatLive } from '../component/ChatLive';

const HomeScreen = (props) => {

    const param = props.navigation.state.params;
    const postInfo = param?.shareInfo;
    const popUp = param?.popUp;
    const isFeed = param?.isFeed;
    const isChat = param?.isChat;

    const { t, i18n } = useTranslation();

    const reducer = (noticeCount, action) => {
        if (action == 'news')
            return noticeCount + 1;
        if (action == 'reset')
            return 0;
    }

    const initRoomId = useRef(param?.roomId);
    const initChatRoomId = useRef(param?.chatRoomId);

    const [activeState, setActiveState] = useState((initRoomId.current || isFeed) ? 1 : (initChatRoomId.current || isChat) ? 2 : 0);
    const [showHint, setShowHint] = useState(postInfo?.file ? true : false);
    const [notify, setNotify] = useState(false);
    const [dailyPop, setDailyPop] = useState(popUp ? true : false);
    const [categoryId, setCategoryId] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [noticeCount, noticeDispatch] = useReducer(reducer, 0);

    const mounted = useRef(false);

    let { user, refreshState, socketInstance, messageCount, requestCount } = useSelector((state) => {
        return (
            state.user
        )
    });

    const dispatch = useDispatch();

    const getNewNotifyCount = () => {
        VoiceService.unreadActivityCount().then(async res => {
            if (res.respInfo.status == 201 && mounted.current) {
                const jsonRes = await res.json();
                let activeCount = jsonRes.count;
                VoiceService.unreadRequestCount().then(async res => {
                    if (res.respInfo.status == 201) {
                        const jsonRes = await res.json();
                        let requestCount = jsonRes.count;
                        dispatch(setRequestCount(requestCount));
                        let totalCount = parseInt(activeCount) + parseInt(requestCount);
                        if (mounted) {
                            setNotify(totalCount > 0);
                            if (Platform.OS == 'ios')
                                PushNotificationIOS.setApplicationIconBadgeNumber(totalCount);
                        }
                    }
                })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const getUnreadChatCount = () => {
        VoiceService.getConversations()
            .then(async res => {
                if (res.respInfo.status === 200 && mounted.current) {
                    const jsonRes = await res.json();
                    let totalCount = 0;
                    jsonRes.forEach(item => {
                        if (item.sender.id != user.id) {
                            totalCount += item.newsCount;
                        }
                    });
                    dispatch(setMessageCount(totalCount));
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    const shareAudio = () => {
        const dirs = RNFetchBlob.fs.dirs.DocumentDir;
        const fileName = 'Vodeus app - ' + postInfo.title;
        const path = Platform.select({
            ios: `${dirs}/${fileName}.m4a`,
            android: `${dirs}/${fileName}.mp3`,
        });
        RNFetchBlob.config({
            fileCache: true,
            path,
        }).fetch('GET', postInfo.file.url).then(res => {
            if (mounted.current && res.respInfo.status == 200) {
                let filePath = res.path();
                Share.open({
                    url: (Platform.OS == 'android' ? 'file://' : '') + filePath,
                    type: 'audio/' + (Platform.OS === 'android' ? 'mp3' : 'm4a'),
                }).then(res => {
                    setShowHint(false);
                })
                    .catch(err => {
                        console.log(err);
                        setShowHint(false);
                    });
            }
        })
            .catch(async err => {
                console.log(err);
            })
    }

    const onChangeCategory = (id) => {
        setCategoryId(id);
        setShowModal(false);
    }

    const onShareLink = async () => {
        Share.open({
            url: `https://www.vodeus.co`,
            message: t("Connect with God and other Christians from Brazil on Vodeus app. It's free! www.vodeus.co https://vodeus.app.link/INbjY8tBlyb")
        }).then(res => {
            let userData = { ...user };
            userData.score += 10;
            dispatch(setUser(userData));
            VoiceService.inviteFriend('', false);
        })
            .catch(err => {
                console.log("err");
            });
    }

    useEffect(() => {
        mounted.current = true;
        getNewNotifyCount();
        getUnreadChatCount();
        socketInstance.on("notice_Voice", (data) => {
            noticeDispatch("news");
        });
        return () => {
            mounted.current = false;
            socketInstance.off("notice_Voice");
        };
    }, []);

    useEffect(() => {
        setDailyPop(popUp ? true : false);
    }, [popUp])


    return (
        <KeyboardAvoidingView
            style={{
                backgroundColor: '#FFF',
                flex: 1
            }}
        >
            <ImageBackground
                source={require('../../assets/Feed/head_back.png')}
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
                    alignItems: 'center'
                }}>
                    <View>
                        <View style={{
                            flexDirection: 'row',
                            marginLeft: 27
                        }}>
                            <TitleText
                                text={t("Welcome, ")}
                                fontSize={12}
                                lineHeight={14}
                                color='rgba(255,255,255,0.4)'
                            />
                            <TitleText
                                text={user.name}
                                fontSize={12}
                                lineHeight={14}
                                color='#FFF'
                            />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            marginLeft: 25
                        }}>
                            <TouchableOpacity style={{
                                paddingTop: 14,
                                paddingBottom: 20,
                                borderBottomWidth: activeState ? 0 : 2,
                                borderBottomColor: '#F1613A'
                            }}
                                onPress={() => setActiveState(0)}
                            >
                                <TitleText
                                    text={t("Discovery")}
                                    fontSize={20.5}
                                    lineHeight={24}
                                    color={activeState ? 'rgba(255, 255, 255, 0.36)' : '#FFF'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                paddingTop: 14,
                                paddingBottom: 20,
                                borderBottomWidth: activeState == 1 ? 2 : 0,
                                borderBottomColor: '#F1613A',
                                paddingHorizontal: 15.5
                            }}
                                onPress={() => {
                                    initRoomId.current = null;
                                    setActiveState(1);
                                }}
                            >
                                <TitleText
                                    text={t("Live")}
                                    fontSize={20.5}
                                    lineHeight={24}
                                    color={activeState != 1 ? 'rgba(255, 255, 255, 0.36)' : '#FFF'}
                                />
                                <View style={{
                                    position: 'absolute',
                                    top: 17,
                                    right: 8,
                                    width: 6,
                                    height: 6,
                                    backgroundColor: '#F57047',
                                    borderRadius: 4
                                }}></View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                paddingTop: 14,
                                paddingBottom: 20,
                                borderBottomWidth: activeState == 2 ? 2 : 0,
                                borderBottomColor: '#F1613A',
                                paddingHorizontal: 15.5
                            }}
                                onPress={() => {
                                    initChatRoomId.current = null;
                                    setActiveState(2);
                                }}
                            >
                                <TitleText
                                    text={t("Chat")}
                                    fontSize={20.5}
                                    lineHeight={24}
                                    color={activeState != 2 ? 'rgba(255, 255, 255, 0.36)' : '#FFF'}
                                />
                                <View style={{
                                    position: 'absolute',
                                    top: 17,
                                    right: 8,
                                    width: 6,
                                    height: 6,
                                    backgroundColor: '#F57047',
                                    borderRadius: 4
                                }}></View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        marginRight: 20
                    }}>
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate('Notification')}
                        >
                            <LinearGradient
                                style={{
                                    height: 34.42,
                                    width: 34.42,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                locations={[0, 1]}
                                colors={['#8274CF', '#2C235C']}
                            >
                                <SvgXml
                                    xml={notificationWhiteSvg}
                                />
                                <View style={{
                                    position: 'absolute',
                                    left: 18,
                                    bottom: 25,
                                    width: 18,
                                    height: 18,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#8274CF',
                                    backgroundColor: '#FFF',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <DescriptionText
                                        text={requestCount}
                                        color='#F00'
                                        fontSize={12}
                                        lineHeight={14}
                                    />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate('Chat')}
                            style={{
                                marginLeft: 9.58
                            }}
                        >
                            <LinearGradient
                                style={{
                                    height: 34.42,
                                    width: 34.42,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                locations={[0, 1]}
                                colors={['#8274CF', '#2C235C']}
                            >
                                <SvgXml
                                    xml={chatWhiteSvg}
                                />
                                <View style={{
                                    position: 'absolute',
                                    left: 18,
                                    bottom: 25,
                                    width: 18,
                                    height: 18,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#8274CF',
                                    backgroundColor: '#FFF',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <DescriptionText
                                        text={messageCount}
                                        color='#F00'
                                        fontSize={12}
                                        lineHeight={14}
                                    />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
            {activeState == 0 ?
                <Discover
                    props={props}
                    category={categoryId}
                /> :
                activeState == 1 ?
                    <Live
                        props={props}
                        initRoomId={initRoomId.current}
                    />
                    :
                    <ChatLive
                        props={props}
                        initChatRoomId={initChatRoomId.current}
                    />}
            {
                noticeCount != 0 &&
                <TouchableOpacity style={{
                    position: 'absolute',
                    top: 160,
                    left: windowWidth / 2 - 78,
                    //width: noticeCount < 0 ? 183 : 156,
                    height: 40,
                    backgroundColor: noticeCount < 0 ? '#45BF58' : '#8327D8',
                    borderRadius: 34,
                    flexDirection: 'row',
                    //justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                    onPress={() => {
                        if (noticeCount > 0) {
                            Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                        }
                        noticeDispatch("reset");
                        dispatch(setRefreshState(!refreshState));
                    }}
                >
                    <DescriptionText
                        text={noticeCount < 0 ? t("Successful upload!") : (noticeCount + ' ' + t("new stories !"))}
                        color='#F6EFFF'
                        marginLeft={16}
                        fontSize={15}
                        lineHeight={15}
                    />
                    <SvgXml
                        width={20}
                        height={20}
                        style={{ marginRight: 14 }}
                        xml={closeSvg}
                    />
                </TouchableOpacity>
            }
            {/* {!isActiveState && <TouchableOpacity
                //onPress={() => setDailyPop(true)}
                onPress={() => props.navigation.navigate('PostingMulti')}
            >
                <LinearGradient
                    style={
                        {
                            position: 'absolute',
                            right: 15,
                            bottom: 95,
                            width: 54,
                            height: 54,
                            borderRadius: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }
                    }
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    locations={[0, 1]}
                    colors={['#8274CF', '#2C235C']}
                >
                    <SvgXml
                        xml={circlePlusSvg}
                    />
                </LinearGradient>
            </TouchableOpacity>} */}
            <BottomButtons
                active='home'
                props={props}
            />
            {/* {dailyPop && <DailyPopUp
                props={props}
                isFirst={isFirst}
                onSetIsFirst={() => setIsFirst(false)}
                onCloseModal={() => setDailyPop(false)}
            />} */}
            {showHint &&
                <ShareHint
                    onShareAudio={() => shareAudio()}
                    onCloseModal={() => { setShowHint(false); }}
                />}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    setShowModal(!showModal);
                }}
            >
                <Pressable style={styles.swipeModal}>
                    <AllCategory
                        closeModal={() => setShowModal(false)}
                        selectedCategory={categoryId}
                        setCategory={(id) => onChangeCategory(id)}
                    />
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default HomeScreen;