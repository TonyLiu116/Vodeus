import React, { useEffect, useRef, useState } from 'react';
import {
  Image, Modal, Platform, Pressable, ScrollView, TouchableOpacity, Vibration, View
} from 'react-native';


import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DescriptionText } from './DescriptionText';

import { SvgXml } from 'react-native-svg';
import redCallSvg from '../../assets/call/redCall.svg';
import recordSvg from '../../assets/common/bottomIcons/rrecord.svg';

import { SendbirdCalls } from '@sendbird/calls-react-native';
import RNSwitchAudioOutput from 'react-native-switch-audio-output';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { Avatars, Categories, windowHeight, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { Warning } from './Warning';
import SoundPlayer from 'react-native-sound-player'
import { useEffectAsync } from './useEffectAsync';
import LoudSpeaker from 'react-native-loud-speaker'
import VoiceService from '../../services/VoiceService';
import * as Progress from "react-native-progress";

export const BirdRoom = ({
  props,
  roomInfo,
  onCloseModal = () => { },
}) => {

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();

  let { socketInstance, user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const [showModal, setShowModal] = useState(true);
  const [info, setInfo] = useState(roomInfo);
  const [isCalling, setIsCalling] = useState(false);
  const [unMutedParticipants, setUnMutedParticipants] = useState([]);
  const [room, setRoom] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const playSound = () => {
    try {
      SoundPlayer.playSoundFile('calling', 'mp3')
    } catch (e) {
      console.log(`cannot play the sound file`)
    }
  }

  const onClose = (confirmed = false) => {
    console.log(confirmed, roomInfo.hostUser.id , user.id);
    if (!confirmed && roomInfo.hostUser.id == user.id) {
      setShowConfirm(true);
    }
    else {
      unsubscribe();
      setShowModal(false);
      onCloseModal();
    }
  }

  const unsubscribe = async () => {
    if (room) {
      room.exit();
      if (roomInfo.hostUser.id == user.id)
        socketInstance.emit("deleteRoom", { info: { roomId: room.roomId } });
      else
        socketInstance.emit("exitRoom", { info: { roomId: room.roomId, participantId: room.localParticipant.participantId, user } })
    }
  }

  useEffectAsync(async () => {
    try {

      const room = roomInfo.roomId ? await SendbirdCalls.fetchRoomById(roomInfo.roomId) : await SendbirdCalls.createRoom({
        roomType: SendbirdCalls.RoomType.LARGE_ROOM_FOR_AUDIO_ONLY
      });

      if (!roomInfo.roomId) {
        roomInfo.roomId = room.roomId;
        socketInstance.emit("createRoom", {
          info: roomInfo
        });
        VoiceService.createBirdRoom(roomInfo.roomId);
      }

      const enterParams = {
        audioEnabled: true,
        videoEnabled: false,
      }
      await room.enter(enterParams).then(async res => {
        const enteredRoom = await SendbirdCalls.getCachedRoomById(room.roomId);
        setRoom(enteredRoom);
        enteredRoom.localParticipant.muteMicrophone();
        let tp = [];
        enteredRoom.participants.forEach(el => {
          if (el.isAudioEnabled)
            tp.push(el.participantId);
        })
        setUnMutedParticipants(tp);
        socketInstance.emit("enterRoom", { info: { roomId: enteredRoom.roomId, participantId: enteredRoom.localParticipant.participantId, user } });
      });

      RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);
      LoudSpeaker.open(true)

      return room.addListener({
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
          onClose();
        }
      })
    }
    catch (error) {
      console.log(error);
      onClose(true);
    }
    return () => 0;
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      unsubscribe();
    }
  }, [])

  useEffect(() => {
    setInfo(roomInfo);
  }, [roomInfo])

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        onClose();
      }}
    >
      <Pressable onPressOut={()=>onClose()} style={[styles.swipeModal, { height: windowHeight, marginTop: 0 }]}>
        <Pressable style={[styles.swipeContainerContent, { bottom: 0 }]}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginTop: 27,
              marginBottom: 14
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SemiBoldText
                  text={t("Now in direct")}
                  fontSize={13}
                  lineHeight={21}
                  color='#8327D8'
                />
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: '#8327D8',
                  marginHorizontal: 6
                }}>
                </View>
                <SemiBoldText
                  text={info.participants.length.toString() + ' ' + t("people are listening yet")}
                  color='#5E4175'
                  fontSize={10.12}
                  lineHeight={16.67}
                />
              </View>
              <TouchableOpacity onPress={()=>onClose()}>
                <SemiBoldText
                  text={t("Quit")}
                  fontSize={17.89}
                  lineHeight={23.4}
                  color='#0B5CD7'
                />
              </TouchableOpacity>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 26,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <View>
                  <Image
                    source={info.hostUser.avatar ? { uri: info.hostUser.avatar.url } : Avatars[info.hostUser.avatarNumber].uri}
                    style={{ width: 46, height: 46, borderRadius: 25 }}
                    resizeMode='cover'
                  />
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    left: 29,
                    top: 24
                  }}>
                    <View style={{
                      width: 25,
                      height: 25,
                      borderRadius: 14,
                      backgroundColor: '#FFF',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <View style={{
                        width: 10,
                        height: 10,
                        borderRadius: 6,
                        backgroundColor: '#E41717',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{
                  marginLeft: 20
                }}>
                  <SemiBoldText
                    text={info.title}
                    fontSize={19.35}
                    lineHeight={32}
                    color='#8327D8'
                  />
                  <DescriptionText
                    text={info.hostUser.id == user.id ? t('You are the host') : (t('Host is') + ' ' + info.hostUser.name)}
                    fontSize={14.8}
                    lineHeight={24}
                    color='rgba(54, 18, 82, 0.8)'
                  />
                </View>
              </View>
              <View style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#8229F4',
                flexDirection: 'row',
                marginHorizontal: 4
              }}
              >
                <Image source={Categories[info.categoryId].uri}
                  style={{
                    width: 20,
                    height: 20
                  }}
                />
                <DescriptionText
                  text={Categories[info.categoryId].label == '' ? t('All') : Categories[info.categoryId].label == 'Support' ? t('Support/Help') : t(Categories[info.categoryId].label)}
                  fontSize={14}
                  lineHeight={20}
                  marginLeft={10}
                />
              </View>
            </View>
            {info.participants.length > 1 ? <ScrollView style={{ maxHeight: 200 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', alignContent: 'center', paddingHorizontal: 20 }}>
                {info.participants.map((item, index) => {
                  if (item.user.id == user.id) return null;
                  return <View
                    key={index.toString() + 'BirdRoom'}
                    style={{
                      alignItems: 'center',
                      marginHorizontal: 8,
                      marginVertical: 12,
                    }}
                  >
                    <Image
                      source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
                      style={{ width: 48, height: 48, borderRadius: 25 }}
                      resizeMode='cover'
                    />
                    <DescriptionText
                      text={item.user.name}
                      fontSize={11}
                      lineHeight={24}
                      color='#8327D8'
                    />
                    {unMutedParticipants.indexOf(item.participantId) != -1 && <View style={{
                      position: 'absolute',
                      right: -6,
                      top: -6,
                      width: 23,
                      height: 23,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: '#8327D8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFF'
                    }}>
                      <SvgXml
                        xml={redCallSvg}
                      />
                    </View>
                    }
                  </View>
                })}
              </View>
            </ScrollView>
              :
              <View View style={{ width: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
                <Image
                  style={{
                    width: 164,
                    height: 147
                  }}
                  source={require('../../assets/Feed/InviteFriend1.png')}
                />
                <DescriptionText
                  text={t("Nobody in your room yet")}
                  fontSize={9.5}
                  color='#361252'
                  lineHeight={15}
                  marginTop={20}
                  marginBottom={16}
                />
              </View>
            }
            <View style={{
              alignItems: 'center',
              width: windowWidth
            }}>
              <Warning
                text={t("Hate, racism, sexism or any kind of violence is stricly prohibited")}
              />
             <View
                onTouchStart={(e) => {
                  room.localParticipant.unmuteMicrophone();
                  setIsCalling(true);
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                  playSound();
                }}
                onTouchEnd={(e) => {
                  room.localParticipant.muteMicrophone();
                  setIsCalling(false);
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                  playSound();
                }}
                style={{
                  opacity: isCalling ? 0.3 : 1,
                  marginTop: 17,
                  marginBottom: 21,
                  width:80,
                  height:80
                }}
              >
                {room&&<SvgXml
                  width={80}
                  height={80}
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
                  color="rgba(0, 0, 255, .7)"
                  style={{ alignSelf: "center" }}
                />
              </View>
            }
          </View>
        </Pressable>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showConfirm}
          onRequestClose={() => {
            //  Alert.alert("Modal has been closed.");
            setShowConfirm(false);
          }}
        >
          <Pressable onPressOut={() => setShowConfirm(false)} style={styles.swipeModal}>
            <View style={{
              marginTop: 300,
              width: windowWidth - 48,
              height: 181,
              marginHorizontal: 24,
              borderRadius: 24,
              backgroundColor: 'white',
              shadowColor: 'rgba(1, 1, 19, 0.5)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 1
            }}>
              <SemiBoldText
                text={t("End your room?")}
                fontSize={20}
                lineHeight={24}
                marginTop={35}
                marginLeft={24}
              />
              <DescriptionText
                text={t("It will disappear after 30 seconds")}
                fontSize={15}
                lineHeight={24}
                color='rgba(54, 36, 68, 0.8)'
                marginTop={13}
                marginLeft={24}
              />
              <View style={{ flexDirection: 'row', marginTop: 27, marginLeft: windowWidth / 2 - 38 }}>
                <TouchableOpacity onPress={() => setShowConfirm(false)}>
                  <SemiBoldText
                    text={t("Cancel")}
                    fontSize={15}
                    lineHeight={24}
                    color='#E41717'
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onClose(true)}>
                  <SemiBoldText
                    text={t("Confirm")}
                    fontSize={15}
                    lineHeight={24}
                    color='#8327D8'
                    marginLeft={56}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </Pressable>
    </Modal>
  );
};