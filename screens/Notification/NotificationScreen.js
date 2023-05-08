import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    SafeAreaView,
    Vibration,
    Platform,
    KeyboardAvoidingView,
    ImageBackground,
    Image
} from 'react-native';

import * as Progress from "react-native-progress";
import { DescriptionText } from '../component/DescriptionText';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import black_settingsSvg from '../../assets/notification/black_settings.svg';
import tickSquareSvg from '../../assets/notification/tickSquare.svg';
import noNotificationSvg from '../../assets/notification/noNotification.svg';
import chatWhiteSvg from '../../assets/Feed/chat_white.svg';
import noRequestSvg from '../../assets/notification/noRequest.svg';

import { windowHeight, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { FlatList } from 'react-native-gesture-handler';
import { SemiBoldText } from '../component/SemiBoldText';
import { NotificationItem } from '../component/NotificationItem';
import VoiceService from '../../services/VoiceService';
import { useSelector, useDispatch } from 'react-redux';
import { setRefreshState, setRequestCount } from '../../store/actions';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { NavigationActions, StackActions } from 'react-navigation';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import LinearGradient from 'react-native-linear-gradient';

const NotificationScreen = (props) => {

    const param = props.navigation.state.params;

    const { t, i18n } = useTranslation();

    const [activeState, setActiveState] = useState('activities');
    const [activeNum, setActiveNum] = useState(0);
    const [requestNum, setRequestNum] = useState(0);
    const [activities, setActivities] = useState([]);
    const [requests, setRequests] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [allSeen, setAllSeen] = useState(false);
    const [allAccept, setAllAccept] = useState(false);
    const [isActLoading, setIsActLoading] = useState(true);
    const [isReqLoading, setIsReqLoading] = useState(true);
    const [actLoadMore, setActLoadMore] = useState(10);
    const [reqLoadMore, setReqLoadMore] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    let { user, refreshState, redirect } = useSelector((state) => {
        return (
            state.user
        )
    });

    const mounted = useRef(false);

    const dispatch = useDispatch();

    const scrollIndicator = useRef(new Animated.Value(0)).current;

    const scrollIndicatorPosition = Animated.multiply(
        scrollIndicator,
        (windowWidth - 188) / windowWidth
    )

    const scrollRef = useRef();

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    const getNewActivityCount = () => {
        VoiceService.unreadActivityCount().then(async res => {
            if (res.respInfo.status == 201 && mounted.current) {
                const jsonRes = await res.json();
                setActiveNum(jsonRes.count);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const getNewRequestCount = () => {
        VoiceService.unreadRequestCount().then(async res => {
            if (res.respInfo.status == 201 && mounted.current) {
                const jsonRes = await res.json();
                setRequestNum(jsonRes.count);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const getActivities = () => {
        if (actLoadMore < 10) return;
        if (activities.length == 0)
            setIsActLoading(true);
        VoiceService.getActivities(activities.length).then(async res => {
            if (res.respInfo.status == 200 && mounted.current) {
                const jsonRes = await res.json();
                if (jsonRes.length > 0)
                    setActivities(activities.length == 0 ? jsonRes : [...activities, ...jsonRes]);
                setActLoadMore(jsonRes.length);
                setIsActLoading(false);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }
    const getRequests = () => {
        if (reqLoadMore < 10) return;
        if (requests.length == 0)
            setIsReqLoading(true);
        VoiceService.getRequests(requests.length).then(async res => {
            if (res.respInfo.status == 200 && mounted.current) {
                const jsonRes = await res.json();
                let result = jsonRes.reduce((unique, o) => {
                    if (!unique.some(obj => (
                        o.type == 'friendRequest' &&
                        obj.type == o.type &&
                        obj.fromUser.id === o.fromUser.id &&
                        o.friend.status == obj.friend.status
                    ))) {
                        unique.push(o);
                    }
                    return unique;
                }, []);
                if (result.length > 0)
                    setRequests(result.length == 0 ? result : [...requests, ...result]);
                setReqLoadMore(result.length);
                setIsReqLoading(false);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const onReadNotification = (index, isActive) => {
        if (isActive) {
            let tp = activities;
            if (tp[index].seen == false) {
                VoiceService.seenNotification(tp[index].id);
                tp[index].seen = true;
                setActivities(tp);
                setActiveNum(activeNum - 1);
                if (activeNum - 1 + requestNum == 0)
                    dispatch(setRefreshState(!refreshState));
            }
            if (tp[index].type == 'likeRecord' || tp[index].type == 'newAnswer' || tp[index].type == 'likeAnswer' || tp[index].type == 'tagFriend') {
                //props.navigation.navigate("VoiceProfile", { id: tp[index].record.id, answerId: tp[index].answer?.id });
                props.navigation.navigate('UserProfile', { userId: tp[index].fromUser.id });
            }
            else if (tp[index].type == 'newStory' || tp[index].type == 'oldStory') {
                onNavigate('Home', { targetRecordId: tp[index].record.id, createdAt: tp[index].record.createdAt });
            }
            else {
                if (tp[index].fromUser.id == user.id)
                    props.navigation.navigate('Profile');
                else
                    props.navigation.navigate('UserProfile', { userId: tp[index].fromUser.id });
            }
        }
        else {
            let tp = requests;
            if (tp[index].seen == false) {
                VoiceService.seenNotification(tp[index].id)
                tp[index].seen = true;
                setRequests(tp);
                setRequestNum(Math.max(requestNum - 1, 0));
                if (activeNum + requestNum - 1 == 0)
                    dispatch(setRefreshState(!refreshState));
            }
            props.navigation.navigate('UserProfile', { userId: tp[index].fromUser.id });
        }
    }
    const onDeleteNotification = (id, index, isActive) => {

        VoiceService.deleteNotification(id);
        if (isActive) {
            let tp = [...activities];
            if (tp[index].seen == false) {
                setActiveNum(activeNum - 1);
                if (activeNum - 1 + requestNum == 0)
                    dispatch(setRefreshState(!refreshState));
            }
            tp.splice(index, 1);
            setActivities(tp);
        }
        else {
            let tp = [...requests];
            if (tp[index].seen == false) {
                setRequestNum(Math.max(requestNum - 1, 0));
                if (activeNum + requestNum - 1 == 0)
                    dispatch(setRefreshState(!refreshState));
            }
            tp.splice(index, 1);
            setRequests(tp);
        }
    }

    const onMarkAll = () => {
        let repo = activeState ? VoiceService.markAllactivitySeen() : VoiceService.markAllrequestSeen();
        repo.then(async res => {
            if (res.respInfo.status == 200 && mounted.current) {
                if (activeState) {
                    setAllSeen(true);
                    setActiveNum(0);
                    if (requestNum == 0)
                        dispatch(setRefreshState(!refreshState));
                }
                else {
                    setAllAccept(true);
                    setRequestNum(0);
                    if (activeNum == 0)
                        dispatch(setRefreshState(!refreshState));
                }
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const onAcceptRequest = (index) => {
        setIsLoading(true);
        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
        VoiceService.acceptFriend(requests[index].fromUser.id, requests[index].id).then(async res => {
            if (res.respInfo.status == 201 && mounted.current) {
                setRequests(prev=>{
                    prev[index].friend.status = 'accepted';
                    return [...prev]
                })
                dispatch(setRequestCount(tp.length));
            }
            setIsLoading(false);
        })
            .catch(err => {
                console.log(err);
            });
        let tp = requests;
        if (tp[index].seen == false) {
            VoiceService.seenNotification(tp[index].id)
            tp[index].seen = true;
            setRequests(tp);
            setRequestNum(Math.max(requestNum - 1, 0));
            if (activeNum + requestNum - 1 == 0)
                dispatch(setRefreshState(!refreshState));
        }
    }

    const onFollowUser = (id, index) => {
        setIsLoading(true);
        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
        VoiceService.followFriend(id).then(async res => {
            if (mounted.current) {
                let tp = activities;
                tp[index].towardFriend = { status: 'pending' };
                setIsLoading(false);
                setActivities([...tp]);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    useEffect(() => {
        mounted.current = true;
        getNewActivityCount();
        getNewRequestCount();
        getActivities();
        getRequests();
        if (param?.isRequest) {
            scrollRef.current?.scrollTo({ x: windowWidth, animated: true });
        }
        return () => {
            mounted.current = false;
        }
    }, [])
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
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 26,
                    paddingBottom: 20
                }}>
                    <TitleText
                        text={t("Notifications")}
                        fontSize={20.5}
                        lineHeight={24}
                        color='#FFFFFF'
                    />
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
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <View style={[styles.rowSpaceBetween, { paddingHorizontal: 36, marginTop: 9 }]}>
                <TouchableOpacity onPress={() => { setActiveState('activities'); }} style={[styles.rowAlignItems, {
                    paddingTop: 8,
                    paddingBottom: 14,
                    borderColor: '#483A89',
                    borderBottomWidth: activeState == 'activities' ? 2 : 0
                }]}>
                    <DescriptionText
                        text={t("Activities")}
                        fontFamily={'SFProDisplay-Regular'}
                        color={activeState == 'activities' ? '#361252' : 'rgba(68, 55, 132, 0.61)'}
                        fontSize={15}
                        lineHeight={18}
                    />
                    <View style={{ backgroundColor: activeState == 'activities' ? '#483A89' : '#F2F0FF', marginLeft: 8, paddingHorizontal: 8, borderRadius: 12 }}>
                        <SemiBoldText
                            text={activeNum}
                            fontSize={12}
                            lineHeight={16}
                            color={activeState == 'activities' ? '#F6EFFF' : '#483A89'}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setActiveState('requests'); }} style={[styles.rowAlignItems, {
                    paddingTop: 8,
                    paddingBottom: 14,
                    borderColor: '#483A89',
                    borderBottomWidth: activeState == 'requests' ? 2 : 0
                }]}>
                    <DescriptionText
                        text={t("Requests")}
                        fontFamily={'SFProDisplay-Regular'}
                        color={activeState == 'requests' ? '#361252' : 'rgba(68, 55, 132, 0.61)'}
                        fontSize={15}
                        lineHeight={18}
                    />
                    <View style={{ backgroundColor: activeState == 'requests' ? '#483A89' : '#F2F0FF', marginLeft: 8, paddingHorizontal: 8, borderRadius: 12 }}>
                        <SemiBoldText
                            text={requestNum}
                            fontSize={12}
                            lineHeight={16}
                            color={activeState == 'requests' ? '#F6EFFF' : '#483A89'}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setActiveState('tags'); }} style={[styles.rowAlignItems, {
                    paddingTop: 8,
                    paddingBottom: 14,
                    borderColor: '#483A89',
                    borderBottomWidth: activeState == 'tags' ? 2 : 0
                }]}>
                    <DescriptionText
                        text={t("Tags")}
                        fontFamily={'SFProDisplay-Regular'}
                        color={activeState == 'tags' ? '#361252' : 'rgba(68, 55, 132, 0.61)'}
                        fontSize={15}
                        lineHeight={18}
                    />
                    <View style={{ backgroundColor: activeState == 'tags' ? '#483A89' : '#F2F0FF', marginLeft: 8, paddingHorizontal: 8, borderRadius: 12 }}>
                        <SemiBoldText
                            text={0}
                            fontSize={12}
                            lineHeight={16}
                            color={activeState == 'tags' ? '#F6EFFF' : '#483A89'}
                        />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ width: windowWidth, height: 1, backgroundColor: '#F2F0F5' }}>
            </View>
            {activeState == 'activities' && (!isActLoading ? (activities.length == 0 ?
                <View style={{ marginTop: windowHeight / 7, alignItems: 'center', width: windowWidth }}>
                    <SvgXml
                        xml={noNotificationSvg}
                    />
                    <DescriptionText
                        text={t("You have no notifications yet")}
                        fontSize={17}
                        lineHeight={28}
                        marginTop={22}
                    />
                </View>
                : <View style={{ width: windowWidth, marginBottom: 80 }}>
                    <FlatList
                        data={activities}
                        renderItem={({ item, index }) => <NotificationItem
                            key={index + item.id + 'activities'}
                            isNew={!item.seen && !allSeen}
                            userInfo={item.fromUser}
                            recordInfo={item.record}
                            details={item.type}
                            towardFriend={item.towardFriend}
                            notificationTime={item.createdAt}
                            isActivity={true}
                            onPressItem={() => onReadNotification(index, true)}
                            onFollowUser={() => onFollowUser(item.fromUser.id, index)}
                            onDeleteItem={() => onDeleteNotification(item.id, index, true)}
                        />}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReached={() => getActivities()}
                        onEndThreshold={0}
                    />
                </View>) :
                <View style={{ marginTop: windowHeight / 6, alignItems: 'center', width: windowWidth }}>
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="rgba(0, 0, 255, .7)"
                        style={{ alignSelf: "center" }}
                    />
                </View>)
            }
            {activeState == 'requests' && (!isReqLoading ? (requests.length == 0 ?
                <View style={{ marginTop: windowHeight / 7, alignItems: 'center', width: windowWidth }}>
                    <SvgXml
                        xml={noRequestSvg}
                    />
                    <DescriptionText
                        text={t("No requests")}
                        fontSize={17}
                        lineHeight={28}
                        marginTop={22}
                    />
                </View>
                :
                <View style={{ width: windowWidth, marginBottom: 80 }}>
                    <FlatList
                        data={requests}
                        renderItem={({ item, index }) => <NotificationItem
                            key={index + item.id + 'requests'}
                            isNew={!item.seen}
                            userInfo={item.fromUser}
                            details={item.type}
                            notificationTime={item.createdAt}
                            isActivity={false}
                            accepted={item.friend.status == 'accepted' || allAccept}
                            towardFriend={item.towardFriend}
                            onPressItem={() => onReadNotification(index, false)}
                            onAcceptUser={() => onAcceptRequest(index)}
                            onFollowUser={() => onFollowUser(item.fromUser.id, index)}
                            onDeleteItem={() => onDeleteNotification(item.id, index, false)}
                        />}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReached={() => getRequests()}
                        onEndThreshold={0}
                    />
                </View>) :
                <View style={{ marginTop: windowHeight / 6, alignItems: 'center', width: windowWidth }}>
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="rgba(0, 0, 255, .7)"
                        style={{ alignSelf: "center" }}
                    />
                </View>)
            }
            {((activeState && activities.length > 0) || (!activeState && requests.length > 0)) && <View style={{
                paddingTop: 20,
                position: 'absolute',
                bottom: 0,
                height: 80,
                width: '100%',
                alignItems: 'center',
                backgroundColor: 'white',
                borderTopColor: '#F2F0F5',
                borderTopWidth: 1
            }}>
                <TouchableOpacity style={styles.rowAlignItems} onPress={() => onMarkAll()}>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={tickSquareSvg}
                    />
                    <SemiBoldText
                        text={activeState ? t("Mark all as read") : t("Accept all requests")}
                        fontSize={15}
                        lineHeight={24}
                        color='#8327D8'
                        marginLeft={12}
                    />
                </TouchableOpacity>
            </View>}
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
                </View>}
        </KeyboardAvoidingView>
    );
};

export default NotificationScreen;