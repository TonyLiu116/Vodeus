import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
    Platform, Pressable, SafeAreaView, Text, TouchableOpacity, Vibration, View, FlatList
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
import notificationSvg from '../../assets/discover/notification.svg';
import searchSvg from '../../assets/login/search.svg';
import black_settingsSvg from '../../assets/notification/black_settings.svg';
import { FIRST_ROOM, windowWidth } from '../../config/config';
import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import { setMessageCount, setRefreshState, setRequestCount } from '../../store/actions';
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

const HomeScreen = (props) => {

    const param = props.navigation.state.params;
    const postInfo = param?.shareInfo;
    const popUp = param?.popUp;
    const isFeed = param?.isFeed;
    const initRoomId = param?.roomId;

    const { t, i18n } = useTranslation();

    const reducer = (noticeCount, action) => {
        if (action == 'news')
            return noticeCount + 1;
        if (action == 'reset')
            return 0;
    }

    const [isActiveState, setIsActiveState] = useState(isFeed ? true : false);
    const [showHint, setShowHint] = useState(postInfo ? true : false);
    const [notify, setNotify] = useState(false);
    const [dailyPop, setDailyPop] = useState(popUp ? true : false);
    const [categoryId, setCategoryId] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isFirst, setIsFirst] = useState(param?.isFirst);
    const [viewIndex, setViewIndex] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [currentRoomInfo, setCurrentRoomInfo] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

    const [noticeCount, noticeDispatch] = useReducer(reducer, 0);

    const mounted = useRef(false);

    let { user, refreshState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const dispatch = useDispatch();

    const onViewableItemsChanged = ({
        viewableItems,
    }) => {
        // Do stuff
        if (viewableItems.length > 0)
            setViewIndex(viewableItems[0].index);
    };
    const viewabilityConfigCallbackPairs = useRef([{
        viewabilityConfig: {
            minimumViewTime: 100,
            itemVisiblePercentThreshold: 100
        },
        onViewableItemsChanged
    }
    ]);

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

    const checkFirstRoom = async () => {
        let isFirstRoom = await AsyncStorage.getItem(FIRST_ROOM);
        if (isFirstRoom == null) {
            setShowAlert(true);
        }
    }

    const onCreateRoom = async (title, id) => {
        setShowCreateRoomModal(false);
        const createRoomInfo = {
            hostUser: {
                id: user.id,
                name: user.name,
                avatarNumber: user.avatarNumber,
                avatar: user.avatar,
                score: user.score
            },
            roomId: null,
            title,
            categoryId: id,
            participants: []
        };
        setRooms(prev => {
            prev.unshift(createRoomInfo);
            return [...prev];
        })
        setCurrentRoomInfo(createRoomInfo);
    }

    const onShareLink = () => {
        Share.open({
            url: `https://www.vodeus.co`,
            message: t("Connect with God and other Christians from Brazil on Vodeus app. It's free! www.vodeus.co")
        }).then(res => {

        })
            .catch(err => {
                console.log("err");
            });;
    }

    const roomItems = useMemo(() => {
        return <FlatList
            style={{ width: windowWidth, maxHeight: 152.5, marginTop: 21 }}
            showsHorizontalScrollIndicator={false}
            horizontal
            pagingEnabled
            data={rooms}
            keyExtractor={(_, index) => `list_item${index}`}
            viewabilityConfigCallbackPairs={
                viewabilityConfigCallbackPairs.current
            }
            renderItem={({ item, index }) => {
                return <BirdRoomItem
                    key={index + 'BirdRoomItem'}
                    props={props}
                    info={item}
                    onEnterRoom={() => {
                        if (item.participants.length < 10)
                            setCurrentRoomInfo(item);
                    }}
                />
            }}
        />
    }, [rooms])

    useEffect(() => {
        mounted.current = true;
        getNewNotifyCount();
        getUnreadChatCount();
        socketInstance.on("notice_Voice", (data) => {
            noticeDispatch("news");
        });
        socketInstance.emit("getBirdRooms", (rooms) => {
            if (mounted.current) {
                setRooms(rooms);
                if (initRoomId) {
                    let index = rooms.findIndex(el => el.roomId == initRoomId);
                    if (index != -1)
                        setCurrentRoomInfo(rooms[index]);
                }
            }
        })
        socketInstance.on("createBirdRoom", ({ info }) => {
            setRooms((prev) => {
                let index = prev.findIndex(el => (el.hostUser.id == info.hostUser.id && el.roomId == info.roomId));
                if (index != -1)
                    prev.splice(index, 1);
                prev.unshift(info);
                return [...prev];
            });
            if (info.hostUser.id == user.id) {
                setCurrentRoomInfo(info);
            }
            else if (initRoomId && !currentRoomInfo) {
                if (info.roomId == initRoomId) {
                    setCurrentRoomInfo(info);
                }
            }
        });
        socketInstance.on("deleteBirdRoom", ({ info }) => {
            let index;
            setRooms((prev) => {
                index = prev.findIndex(el => (el.roomId == info.roomId));
                if (index != -1) {
                    prev.splice(index, 1);
                }
                return [...prev];
            });
            if (currentRoomInfo && info.roomId == currentRoomInfo.roomId) {
                setCurrentRoomInfo(null)
            }
        });
        socketInstance.on("enterBirdRoom", ({ info }) => {
            let index = -1;
            setRooms((prev) => {
                index = prev.findIndex(el => (el.roomId == info.roomId));
                if (index != -1) {
                    let p_index = prev[index].participants.findIndex(el => el.participantId == info.participantId);
                    if (p_index == -1) {
                        prev[index].participants.push(info);
                    }
                }
                return [...prev];
            });
        });
        socketInstance.on("exitBirdRoom", ({ info }) => {
            setRooms((prev) => {
                let index = prev.findIndex(el => (el.roomId == info.roomId));
                if (index != -1) {
                    let p_index = prev[index].participants.findIndex(el => (el.participantId == info.participantId))
                    if (p_index != -1) {
                        prev[index].participants.splice(p_index, 1);
                    }
                }
                return [...prev];
            });
        });
        checkFirstRoom();
        return () => {
            mounted.current = false;
            socketInstance.off("notice_Voice");
            socketInstance.off('createBirdRoom');
            socketInstance.off('enterBirdRoom');
            socketInstance.off('exitBirdRoom');
            socketInstance.off('deleteBirdRoom');
        };
    }, []);

    useEffect(() => {
        setDailyPop(popUp ? true : false);
    }, [popUp])

    useEffect(() => {
        if (initRoomId && !currentRoomInfo) {
            let index = rooms.findIndex(el => el.roomId == initRoomId);
            if (index != -1) {
                setCurrentRoomInfo(rooms[index]);
            }
        }
    }, [initRoomId])

    return (
        <SafeAreaView
            style={{
                backgroundColor: '#FFF',
                flex: 1
            }}
        >
            <View style={[styles.rowSpaceBetween, { marginTop: 16, paddingHorizontal: 20 }]}>
                <TouchableOpacity onPress={() => props.navigation.navigate('Setting')}>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={black_settingsSvg}
                    />
                </TouchableOpacity>
                <View style={styles.rowSpaceBetween}>
                    <TouchableOpacity onPress={() => {
                        setIsActiveState(false);
                        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                    }}
                        style={[styles.contentCenter, { width: 97, height: 44 }]}>
                        <SemiBoldText

                            text={t("Discover")}
                            fontFamily={!isActiveState ? 'SFProDisplay-Semibold' : 'SFProDisplay-Regular'}
                            color={!isActiveState ? '#281E30' : 'rgba(59, 31, 82, 0.6)'}
                            fontSize={17}
                            lineHeight={28}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => props.navigation.navigate('Notification')}>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={notificationSvg}
                    />
                    {notify == true && <View
                        style={{
                            position: 'absolute',
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            borderWidth: 2,
                            bottom: -12,
                            left: 6,
                            borderColor: '#FFF',
                            backgroundColor: '#D82783'
                        }}
                    >
                    </View>}
                </TouchableOpacity>
            </View>
            <View style={[styles.paddingH16, {
                flexDirection: 'row',
                marginTop: 5
            }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <SvgXml
                        width="20"
                        height="20"
                        xml={searchSvg}
                        style={styles.searchIcon}
                    />
                    <Pressable
                        style={styles.searchBox}
                        onPress={() => {
                            props.navigation.navigate("Search");
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 17,
                                color: 'grey'
                            }}
                        >{t("Search") + '...'}</Text>
                    </Pressable>
                </View>
            </View>
            {roomItems}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 17,
                marginBottom: 5
            }}>
                {rooms.map((item, index) => {
                    return <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 6,
                        backgroundColor: index == viewIndex ? '#CB98FB' : '#E4CAFD',
                        marginLeft: 4,
                        marginRight: 4
                    }}
                        key={index.toString() + 'circle'}
                    >

                    </View>
                })}
            </View>
            <Discover
                props={props}
                category={categoryId}
            />
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
            <BottomButtons
                active='home'
                props={props}
            />
            <RecordIcon
                props={props}
                bottom={27}
                onCreateRoomModal={() => setShowCreateRoomModal(true)}
                left={windowWidth / 2 - 27}
            />
            {dailyPop && <DailyPopUp
                props={props}
                isFirst={isFirst}
                onSetIsFirst={() => setIsFirst(false)}
                onCreateRoomModal={() => {
                    setDailyPop(false);
                    setShowCreateRoomModal(true);
                }}
                onCloseModal={() => setDailyPop(false)}
            />}
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
            {showCreateRoomModal && <CreateRoom
                props={props}
                onCreateRoom={onCreateRoom}
                onCloseModal={() => setShowCreateRoomModal(false)}
            />}
            {currentRoomInfo && rooms.length > 0 && <BirdRoom
                props={props}
                roomInfo={currentRoomInfo}
                onCloseModal={() => {
                    if (!currentRoomInfo.roomId) {
                        setRooms(prev => {
                            let index = prev.findIndex(el => el.roomId == null)
                            if (index != -1)
                                prev.splice(index, 1);
                            return [...prev];
                        })
                    }
                    setCurrentRoomInfo(null);
                }}
            />}
            {showAlert && <WelcomeBirdRoom
                onCloseModal={async () => {
                    setShowAlert(false);
                    await AsyncStorage.setItem(
                        FIRST_ROOM,
                        "1"
                    );
                }}
            />}
            <View style={{
                position: 'absolute',
                width: windowWidth,
                bottom: 105,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
            }}>
                <TouchableOpacity style={{
                    width: 202,
                    height: 38,
                    borderRadius: 16,
                    backgroundColor: '#ECF8EE',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    elevation: 10,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                }}
                    onPress={onShareLink}
                >
                    <SemiBoldText
                        text={t("Invite friends")}
                        fontSize={17}
                        lineHeight={28}
                        color='#126930'
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;