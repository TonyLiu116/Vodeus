import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  View,
  Image,
  Text,
  Platform,
  ImageBackground,
  Modal,
  Vibration,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';

import {
  GifSearch,
  poweredByGiphyLogoGrey,
} from 'react-native-gif-search'

import { TextInput } from 'react-native-gesture-handler';
import * as Progress from "react-native-progress";
import { Picker } from 'emoji-mart-native'
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { setRefreshState, setUser, setVoiceState } from '../../store/actions';
import { DescriptionText } from './DescriptionText';
import VoiceService from '../../services/VoiceService';
import { ShareVoice } from './ShareVoice';
import Share from 'react-native-share';
import VoicePlayer from '../Home/VoicePlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import closeSvg from '../../assets/record/x.svg';
import whitePostSvg from '../../assets/record/white_post.svg';
import colorPostSvg from '../../assets/record/color_post.svg';
import emojiSymbolSvg from '../../assets/common/emoji_symbol.svg'
import gifSymbolSvg from '../../assets/common/gif_symbol.svg'
import moreSvg from '../../assets/common/more.svg';
import editSvg from '../../assets/common/edit.svg';
import blueShareSvg from '../../assets/common/blue_share.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import recordSvg from '../../assets/common/bottomIcons/rrecord.svg';
import redCallSvg from '../../assets/call/redCall.svg';

import { windowHeight, windowWidth, SHARE_CHECK, Avatars, Categories } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { AnswerVoiceItem } from './AnswerVoiceItem';
import '../../language/i18n';
import { StoryLikes } from './StoryLikes';
import { TagFriends } from './TagFriends';
import { TagItem } from './TagItem';
import { NewChat } from './NewChat';
import { AnswerRecordIcon } from './AnswerRecordIcon';
import SwipeDownModal from 'react-native-swipe-down';
import EmojiPicker from 'rn-emoji-keyboard';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Warning } from './Warning';
import { SendbirdCalls } from '@sendbird/calls-react-native';

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
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [info, setInfo] = useState(roomInfo);
  const [isCalling, setIsCalling] = useState(false);
  const [unMutedParticipants, setUnMutedParticipants] = useState([]);
  const [room, setRoom] = useState(null);
  const [roomListener, setRoomListener] = useState(null);

  const onClose = () => {
    unsubscribe();
    setShowModal(false);
    onCloseModal();
  }

  const onSetRoom = async () => {
    const room = await SendbirdCalls.getCachedRoomById(roomInfo.roomId);
    if (room) {
      room.localParticipant.muteMicrophone();
      setRoom(room);
      let tp = [];
      room.participants.forEach(el=>{
        if(el.isAudioEnabled)
          tp.push(el.participantId);
      })
      setUnMutedParticipants(tp);
      const unsubscribe = room.addListener({
        onRemoteAudioSettingsChanged: (participant) => {
          if (participant.isAudioEnabled) {
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
      })
      setRoomListener(unsubscribe);
      socketInstance.emit("enterRoom", { info: { roomId: room.roomId, participantId: room.localParticipant.participantId, user } })
    }
  }

  const unsubscribe = () => {
    if (room) {
      room.exit();
      socketInstance.emit("exitRoom", { info: { roomId: room.roomId, participantId: room.localParticipant.participantId, user } })
    }
    if (roomListener)
      roomListener();
  }

  useEffect(() => {
    mounted.current = true;
    onSetRoom();
    return () => {
      mounted.current = false;
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
      <Pressable onPressOut={onClose} style={[styles.swipeModal, { height: windowHeight, marginTop: 0 }]}>
        <View style={[styles.swipeContainerContent, { bottom: 0 }]}>
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
              <TouchableOpacity onPress={onClose}>
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
                <Image
                  source={info.hostUser.avatar ? { uri: info.hostUser.avatar.url } : Avatars[info.hostUser.avatarNumber].uri}
                  style={{ width: 46, height: 46, borderRadius: 25 }}
                  resizeMode='cover'
                />
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
                      marginVertical: 12
                    }}
                  >
                    <Image
                      source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
                      style={{ width: 27, height: 27, borderRadius: 25, marginRight: -12 }}
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
                      right: -2,
                      top: -6,
                      width: 23,
                      height: 23,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: '#8327D8',
                      alignItems: 'center',
                      justifyContent: 'center'
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
              <TouchableOpacity
                onTouchStart={(e) => {
                  room?.localParticipant.unmuteMicrophone();
                  setIsCalling(true);
                }}
                onTouchEnd={(e) => {
                  room?.localParticipant.muteMicrophone();
                  setIsCalling(false);
                }}
                style={{
                  opacity: isCalling ? 0.1 : 1,
                  marginTop: 17,
                  marginBottom: 21
                }}
              >
                <SvgXml
                  width={48}
                  height={48}
                  xml={recordSvg}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};