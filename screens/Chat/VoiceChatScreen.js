import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';


import { SvgXml } from 'react-native-svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import closeSvg from '../../assets/call/white_close.svg';
import recordSvg from '../../assets/common/bottomIcons/new_record.svg';
import { DescriptionText } from '../component/DescriptionText';
import { SendbirdCalls } from '@sendbird/calls-react-native';
import { useTranslation } from 'react-i18next';
import branch from 'react-native-branch';
import LinearGradient from 'react-native-linear-gradient';
import LoudSpeaker from 'react-native-loud-speaker';
import * as Progress from "react-native-progress";
import Share from 'react-native-share';
import SoundPlayer from 'react-native-sound-player';
import { useDispatch, useSelector } from 'react-redux';
import redCallSvg from '../../assets/call/redCall.svg';
import whiteCallSvg from '../../assets/call/white_call.svg';
import whitePlusSvg from '../../assets/call/white_plus.svg';
import { Avatars, windowWidth } from '../../config/config';
import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import { MediumText } from '../component/MediumText';
import { SemiBoldText } from '../component/SemiBoldText';
import { Warning } from '../component/Warning';
import { styles } from '../style/Common';
import { useEffectAsync } from '../component/useEffectAsync';
import { NavigationActions, StackActions } from 'react-navigation';
import { ShareVoice } from '../component/ShareVoice';

const VoiceChatScreen = (props) => {

    let { user, refreshState, voiceState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    let roomInfo = props.navigation.state.params.info;

    const mounted = useRef(false);

    const dispatch = useDispatch();

    const { t, i18n } = useTranslation();

    const timeRef = useRef();
    const roomRef = useRef();

    const [showModal, setShowModal] = useState(true);
    const [birdInfo, setBirdInfo] = useState(roomInfo);
    const [isCalling, setIsCalling] = useState(false);
    const [unMutedParticipants, setUnMutedParticipants] = useState([]);
    const [room, setRoom] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [remainTime, setRemainTime] = useState(-1);
    const [pickInfo, setPickInfo] = useState(null);
    const [pickModal, setPickModal] = useState(false);
    const [friends, setFriends] = useState([]);

    const playSound = () => {
        try {
            SoundPlayer.playSoundFile('calling', 'mp3')
        } catch (e) {
            console.log(`cannot play the sound file`)
        }
    }

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    const unsubscribe = async () => {
        if (roomRef.current) {
            socketInstance.emit("exitRoom", { info: { roomId: roomRef.current.roomId, participantId: roomRef.current?.localParticipant.participantId, user } })
            roomRef.current.exit();
        }
    }

    const getFollowUsers = () => {
        VoiceService.getFollows(user.id, "Following")
            .then(async res => {
                if (res.respInfo.status === 200 && mounted.current) {
                    const jsonRes = await res.json();
                    setFriends([...jsonRes]);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    const onSendRequest = () => {
        VoiceService.followFriend(pickInfo.user.id).then(async res => {
            if (res.respInfo.status == 200 || res.respInfo.status == 201) {
                setFriends(prev => {
                    prev.push({
                        user: {
                            id: pickInfo.user.id
                        }
                    })
                    return [...prev];
                })
            }
        });
        setPickModal(false);
    }

    const onKickUser = () => {
        setPickModal(false);
        socketInstance.emit("kickUser", { userId: pickInfo.user.id });
    }

    const onShareLink = async () => {
        if (!roomRef.current)
            return;
        let buo = await branch.createBranchUniversalObject('content/12345', {
            title: 'My Content Title',
            contentDescription: 'My Content Description',
            contentMetadata: {
                customMetadata: {
                    key1: 'room'
                }
            }
        })
        let linkProperties = {
            feature: 'sharing',
            channel: 'chrome',
            campaign: 'content 123 launch'
        }

        let controlParams = {
            roomId: roomRef.current.roomId,
            userId: user.id
        }

        const { url } = await buo.generateShortUrl(linkProperties, controlParams);
        console.log(url);
        Share.open({
            url,
            message: t("Connect with God and other Christians from Brazil on Vodeus app. It's free! www.vodeus.co")
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
        getFollowUsers();
        socketInstance.on("kicked", () => {
            props.navigation.goBack();
        })
        socketInstance.on("deleteBirdRoom", ({ info }) => {
            if (room && room.roomId == info.roomId) {
                onNavigate('Home', { isFeed: true })
            }
        });
        socketInstance.on("enterBirdRoom", ({ info }) => {
            if (roomRef.current && roomRef.current.roomId == info.roomId) {
                let p_index = birdInfo.participants.findIndex(el => el.participantId == info.participantId);
                let tp = birdInfo;
                if(p_index != -1){
                    setBirdInfo({ ...tp });
                }
                else if (p_index == -1) {
                    tp.participants.push(info);
                    setBirdInfo({ ...tp });
                }
            }
        });
        socketInstance.on("exitBirdRoom", ({ info }) => {
            if (roomRef.current && roomRef.current.roomId == info.roomId) {
                let p_index = birdInfo.participants.findIndex(el => el.participantId == info.participantId);
                let tp = birdInfo;
                if (p_index != -1) {
                    let tp = birdInfo;
                    tp.participants.splice(p_index, 1);
                    setBirdInfo({ ...tp });
                }
                else{
                    setBirdInfo({ ...tp });
                }
            }
        });
        return () => {
            mounted.current = false;
            socketInstance.off('exitBirdRoom');
            socketInstance.off('enterBirdRoom');
            socketInstance.off('deleteBirdRoom');
            socketInstance.off('kicked');
            unsubscribe();
        }
    }, [])

    useEffectAsync(async () => {
        try {
            SoundPlayer.setVolume(1);
            const room = roomInfo.roomId ? await SendbirdCalls.fetchRoomById(roomInfo.roomId) : await SendbirdCalls.createRoom({
                roomType: SendbirdCalls.RoomType.LARGE_ROOM_FOR_AUDIO_ONLY
            });

            const enterParams = {
                audioEnabled: true,
                videoEnabled: false,
            }
            return await room.enter(enterParams).then(async res => {
                if (!roomInfo.roomId) {
                    roomInfo.roomId = room.roomId;
                    setBirdInfo(roomInfo);
                    socketInstance.emit("createRoom", {
                        info: roomInfo
                    });
                    VoiceService.createBirdRoom(roomInfo.roomId);
                }
                else {
                    VoiceService.enterBirdRoom(roomInfo.roomId);
                }
                const enteredRoom = await SendbirdCalls.getCachedRoomById(room.roomId);
                if (!mounted.current) {
                    enteredRoom.exit();
                    return;
                }
                setRoom(enteredRoom);
                roomRef.current = enteredRoom;
                socketInstance.emit("enterRoom", {
                    info: {
                        roomId: enteredRoom.roomId,
                        participantId: enteredRoom.localParticipant.participantId,
                        user: {
                            id: user.id,
                            name: user.name,
                            avatarNumber: user.avatarNumber,
                            avatar: user.avatar,
                            score: user.score
                        }
                    }
                });

                //RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);
                LoudSpeaker.open(true);
                enteredRoom.localParticipant.muteMicrophone();
                let tp = [];
                enteredRoom.participants.forEach(el => {
                    if (el.isAudioEnabled)
                        tp.push(el.participantId);
                })
                setUnMutedParticipants(tp);
                return enteredRoom.addListener({
                    onRemoteAudioSettingsChanged: (participant) => {
                        if (participant.isAudioEnabled) {
                            if (!unMutedParticipants.includes(participant.participantId))
                                setUnMutedParticipants(prev => {
                                    prev.push(participant.participantId);
                                    return [...prev];
                                })
                        } else {
                            setUnMutedParticipants(prev => {
                                let index = prev.indexOf(participant.participantId);
                                if (index != -1)
                                    prev.splice(index, 1);
                                return [...prev];
                            })
                        }
                    },
                    onDeleted: () => {
                        console.log("Delete")
                    }
                })
            });
        }
        catch (error) {
            console.log(error);
        }
        return () => 0;
    }, []);

    useEffect(() => {
        if (birdInfo) {
            if (birdInfo.hostUser.id != user.id && birdInfo.hostUser.id != '68263edd-fe69-4d13-b441-f0d6ae5f0c40') {
                let index = birdInfo.participants.findIndex(el => el.user.id == birdInfo.hostUser.id);
                if (index == -1 && !timeRef.current) {
                    timeRef.current = setInterval(() => {
                        setRemainTime(prev => {
                            if (prev == -1) return 30;
                            if (prev > 0) return prev - 1;
                            return 0;
                        })
                    }, 1000);
                }
                if (index != -1 && timeRef.current) {
                    clearInterval(timeRef.current);
                    timeRef.current = null;
                    setRemainTime(-1);
                }
            }
        }
    }, [birdInfo?.participants.length])

    return (
        <LinearGradient
            style={{
                flex: 1
            }}
            colors={['#6051AD', '#423582']}
            locations={[0, 1]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        >
            <ImageBackground
                source={require('../../assets/Feed/head_back.png')}
                style={{
                    width: windowWidth,
                    height: windowWidth * 138 / 371,
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
                    marginBottom: 28,
                    paddingRight: 17,
                    paddingLeft: 20
                }}>
                    <TouchableOpacity
                        style={styles.rowAlignItems}
                    //      onPress={() => props.navigation.navigate('UserProfile', { userId: senderId })}
                    >
                        <SemiBoldText
                            text={t('Love for God')}
                            fontSize={20.5}
                            lineHeight={24}
                            color='#FFF'
                        />
                        <LinearGradient
                            colors={['#FF9768', '#E73918']}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            style={{ width: 58, height: 22, borderRadius: 20, marginLeft: 13, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <MediumText
                                text={'Novo'}
                                fontSize={11.03}
                                lineHeight={14}
                                color='#FFF'
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onNavigate('Home', { isFeed: true })}
                    >
                        <SvgXml
                            xml={closeSvg}
                        />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            {birdInfo.participants.length > 0 && <ScrollView style={{ maxHeight: 200 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', alignContent: 'center', paddingHorizontal: 20 }}>
                    {birdInfo.participants.map((item, index) => {
                        let active = ((item.user.id == user.id && isCalling) || (item.user.id != user.id && unMutedParticipants.indexOf(item.participantId) != -1));
                        //if (item.user.id == roomInfo.hostUser.id && item.user.id == user.id) return null;
                        return <TouchableOpacity
                            key={index.toString() + 'BirdRoom'}
                            style={{
                                alignItems: 'center',
                                marginHorizontal: 8,
                                marginVertical: 12,
                            }}
                            onLongPress={() => {
                                setPickInfo(item);
                                setPickModal(true);
                            }}
                            disabled={item.user.id == user.id}
                        >
                            <Image
                                source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
                                style={{ width: 54.31, height: 54.31, borderRadius: 25, borderWidth: 1, borderColor: active ? '#FA8155' : 'rgba(236, 236, 236, 0.22)' }}
                                resizeMode='cover'
                            />
                            <DescriptionText
                                text={item.user.name}
                                fontSize={11}
                                lineHeight={24}
                                color='#8327D8'
                            />
                            {active && <LinearGradient
                                style={{
                                    position: 'absolute',
                                    right: -6,
                                    top: -6,
                                    width: 23,
                                    height: 23,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                colors={['#FF9768', '#E73918']}
                                locations={[0, 1]}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            >
                                <SvgXml
                                    xml={whiteCallSvg}
                                />
                            </LinearGradient>

                            }
                        </TouchableOpacity>
                    })}
                    <TouchableOpacity
                        onPress={()=> onShareLink()}
                    >
                        <LinearGradient
                            style={{
                                width: 54.31,
                                height: 54.31,
                                borderRadius: 25,
                                marginHorizontal: 8,
                                marginVertical: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            colors={['#FF9768', '#E73918']}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        >
                            <SvgXml
                                xml={whitePlusSvg}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            }
            <View style={{
                position: 'absolute',
                bottom: 0,
                backgroundColor: '#FFF',
                width: windowWidth,
                height: 82,
                borderTopLeftRadius: 11,
                borderTopRightRadius: 11,
                alignItems: 'center',
                width: windowWidth
            }}>

                <View
                    onTouchStart={(e) => {
                        room.localParticipant.unmuteMicrophone();
                        setIsCalling(true);
                        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(50);
                        playSound();
                        LoudSpeaker.open(true);
                    }}
                    onTouchEnd={(e) => {
                        room.localParticipant.muteMicrophone();
                        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(50);
                        setIsCalling(false);
                        LoudSpeaker.open(true);
                    }}
                    style={{
                        opacity: isCalling ? 0.3 : 1,
                        width: 64,
                        height: 64
                    }}
                >
                    {room && <SvgXml
                        width={64}
                        height={64}
                        xml={recordSvg}
                    />}
                </View>
            </View>
            {!room &&
                <View style={{
                    position: 'absolute',
                    width: '100%',
                    alignItems: 'center',
                    top: 140,
                }}>
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="rgba(0, 0, 0, 0.7)"
                        style={{ alignSelf: "center" }}
                    />
                </View>
            }
            {remainTime != -1 && <View style={{
                alignItems: 'center',
                width: windowWidth,
                position: 'absolute',
                top: -50
            }}>
                <Warning
                    text={t("Host has left the room. Room will in end in ") + remainTime.toString() + 's'}
                />
            </View>
            }
        </LinearGradient>
    )
}

export default VoiceChatScreen;
