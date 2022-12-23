import React, { useState, useEffect, useRef, useReducer } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    SafeAreaView,
    Vibration,
    Platform,
    Pressable,
    Text,
    Image,
} from 'react-native';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Share from 'react-native-share';
import { DescriptionText } from '../component/DescriptionText';
import { SvgXml } from 'react-native-svg';
import closeSvg from '../../assets/common/close.svg';
import { BottomButtons } from '../component/BottomButtons';
import black_settingsSvg from '../../assets/notification/black_settings.svg';
import notificationSvg from '../../assets/discover/notification.svg';
import { Categories, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import VoiceService from '../../services/VoiceService';
import { useSelector, useDispatch } from 'react-redux';
import { setMessageCount, setRefreshState, setUser } from '../../store/actions';
import { RecordIcon } from '../component/RecordIcon';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { Feed } from '../component/Feed';
import { Discover } from '../component/Discover';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { ShareHint } from '../component/ShareHint';
import RNFetchBlob from 'rn-fetch-blob';
import { DailyPopUp } from '../component/DailyPopUp';
import searchSvg from '../../assets/login/search.svg';
import { Modal } from 'react-native';
import { AllCategory } from '../component/AllCategory';

const HomeScreen = (props) => {

    const param = props.navigation.state.params;
    const postInfo = param?.shareInfo;
    const popUp = param?.popUp;

    const { t, i18n } = useTranslation();

    const reducer = (noticeCount, action) => {
        if (action == 'news')
            return noticeCount + 1;
        if (action == 'reset')
            return 0;
    }

    const [isActiveState, setIsActiveState] = useState(true);
    const [showHint, setShowHint] = useState(postInfo ? true : false);
    const [notify, setNotify] = useState(false);
    const [newStory, setNewStory] = useState(false);
    const [dailyPop, setDailyPop] = useState(popUp ? true : false);
    const [categoryId, setCategoryId] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const [noticeCount, noticeDispatch] = useReducer(reducer, 0);

    const mounted = useRef(false);

    let { user, refreshState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const dispatch = useDispatch();

    const scrollIndicator = useRef(new Animated.Value(0)).current;

    const scrollIndicatorPosition = Animated.multiply(
        scrollIndicator,
        113 / windowWidth
    )

    const getNewNotifyCount = () => {
        VoiceService.unreadActivityCount().then(async res => {
            if (res.respInfo.status == 201 && mounted.current) {
                const jsonRes = await res.json();
                let activeCount = jsonRes.count;
                VoiceService.unreadRequestCount().then(async res => {
                    if (res.respInfo.status == 201) {
                        const jsonRes = await res.json();
                        let requestCount = jsonRes.count;
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

    const getLastStory = () => {
        VoiceService.getStories(0, '', '', '', '', 'friend', 1)
            .then(async res => {
                if (res.respInfo.status === 200 && mounted.current) {
                    const jsonRes = await res.json();
                    if (jsonRes.length > 0 && (!user.lastSee || new Date(jsonRes[0].createdAt) > new Date(user.lastSee))) {
                        setNewStory(true);
                    }
                }
            })
    }

    const onClickFriend = () => {
        setIsActiveState(true);
        setNewStory(false);
        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    }

    const shareAudio = () => {
        const dirs = RNFetchBlob.fs.dirs.DocumentDir;
        const fileName = 'Vocco app - ' + postInfo.title;
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

    useEffect(() => {
        mounted.current = true;
        getNewNotifyCount();
        getUnreadChatCount();
        getLastStory();
        socketInstance.on("notice_Voice", (data) => {
            noticeDispatch("news");
        });
        return () => {
            mounted.current = false;
            socketInstance.off("notice_Voice")
        };
    }, []);

    useEffect(() => {
        setDailyPop(popUp ? true : false);
    }, [popUp])

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
                        style={[styles.contentCenter, { width: 97, height: 44, marginRight: 16 }]}>
                        <SemiBoldText

                            text={t("Discover")}
                            fontFamily={!isActiveState ? 'SFProDisplay-Semibold' : 'SFProDisplay-Regular'}
                            color={!isActiveState ? '#281E30' : 'rgba(59, 31, 82, 0.6)'}
                            fontSize={17}
                            lineHeight={28}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickFriend()} style={[styles.contentCenter, { width: 97, height: 44 }]}>
                        <SemiBoldText
                            text={t("Friends")}
                            fontFamily={isActiveState ? 'SFProDisplay-Semibold' : 'SFProDisplay-Regular'}
                            color={isActiveState ? '#281E30' : 'rgba(59, 31, 82, 0.6)'}
                            fontSize={17}
                            lineHeight={28}
                        />
                        {newStory && <View
                            style={{
                                position: 'absolute', width: 12, height: 12, right: 8, top: 8, borderRadius: 6,
                                borderWidth: 2, borderColor: '#FFF', backgroundColor: '#D82783'
                            }}>
                        </View>}
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
            <View style={{ width: windowWidth, flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                <View style={{ width: 210 }}>
                    <View style={{
                        width: 97,
                        height: 1,
                        backgroundColor: '#281E30',
                        marginLeft: isActiveState ? 113 : 0
                    }}>
                    </View>
                </View>
            </View>
            {!isActiveState && <View style={[styles.paddingH16, {
                flexDirection: 'row',
                alignItems: "flex-start",
                marginBottom: 6,
            }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
                <View style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: windowWidth / 375 * 14 }}>
                    <View
                        style={{
                            height: windowWidth / 375 * 43,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: windowWidth / 375 * 43,
                            borderRadius: 12,
                            backgroundColor: '#B35CF8',
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                width: windowWidth / 375 * 43,
                                alignItems: 'center',
                                padding: 1,
                                borderRadius: 12,
                            }}
                            onPress={() => setShowModal()}
                        >
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#4C64FF',
                                backgroundColor: '#FFF',
                                padding: 15,
                                width: windowWidth / 375 * 43 - 4,
                                height: windowWidth / 375 * 43 - 4,
                                borderRadius: 10,
                            }}>
                                <Image source={Categories[categoryId].uri}
                                    style={{
                                        width: 25,
                                        height: 25
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={{
                            fontSize: 11,
                            fontFamily: "SFProDisplay-Regular",
                            letterSpacing: 0.066,
                            color: '#A24EE4',
                            textAlign: "center",
                            marginTop: 4,
                        }}
                    >
                        {Categories[categoryId].label == '' ? t('All') : t(Categories[categoryId].label)}
                    </Text>
                </View>
            </View>}
            {isActiveState ?
                <Feed
                    props={props}
                    category={categoryId}
                />
                :
                <Discover
                    props={props}
                    category={categoryId}
                />
            }
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
                left={windowWidth / 2 - 27}
            />
            {dailyPop && <DailyPopUp
                props={props}
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
        </SafeAreaView>
    );
};

export default HomeScreen;