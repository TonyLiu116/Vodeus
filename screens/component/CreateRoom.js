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

export const CreateRoom = ({
  props,
  onCreateRoom = () => { },
  onCloseModal = () => { },
}) => {

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();

  let { user, refreshState, voiceState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const [showModal, setShowModal] = useState(true);
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);

  const onClose = () => {
    setShowModal(false);
    onCloseModal()
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [])
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
        <View style={[styles.swipeContainerContent, { bottom: 0, maxHeight: windowHeight, minHeight: 0 }]}>
          <View
            style={{
              flex: 1,
            }}
          >
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
                    text={t("0 people are listening yet")}
                    color='#5E4175'
                    fontSize={10.12}
                    lineHeight={16.67}
                  />
                </View>
                <TouchableOpacity onPress={() => onCreateRoom(label, categoryId)}>
                  <SemiBoldText
                    text={t("Create")}
                    fontSize={17.89}
                    lineHeight={23.4}
                    color='#0B5CD7'
                  />
                </TouchableOpacity>
              </View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 20,
                marginBottom: 26
              }}>
                <Image
                  source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
                  style={{ width: 46, height: 46, borderRadius: 25 }}
                  resizeMode='cover'
                />
                <View>
                  <TextInput
                    style={{ fontSize: 19.35, lineHeight: 32, fontFamily: "SFProDisplay-Semibold", paddingLeft: 20, width: windowWidth - 110 }}
                    value={label}
                    color='#281E30'
                    placeholder={t("Write title" + "...")}
                    autoFocus
                    onChangeText={(e) => setLabel(e)}
                    placeholderTextColor="#E4CAFC"
                  />
                  <DescriptionText
                    text={t("You are the host")}
                    fontSize={14.8}
                    lineHeight={15}
                    color='rgba(54, 18, 82, 0.8)'
                    marginLeft={20}
                    marginTop={10}
                  />
                </View>
              </View>
              <ScrollView
                style={{
                  maxHeight: 50,
                  marginBottom: 18
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12
                }}>
                  {Categories.map((item, index) => {
                    return <TouchableOpacity style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: categoryId == index ? '#8229F4' : '#D4C9DE',
                      flexDirection: 'row',
                      marginHorizontal: 4
                    }}
                      onPress={() => setCategoryId(index)}
                      key={index.toString() + 'category'}
                    >
                      <Image source={item.uri}
                        style={{
                          width: 20,
                          height: 20
                        }}
                      />
                      <DescriptionText
                        text={item.label == '' ? t('All') : item.label == 'Support' ? t('Support/Help') : t(item.label)}
                        fontSize={14}
                        lineHeight={20}
                        marginLeft={10}
                      />
                    </TouchableOpacity>
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
          {Platform.OS == 'ios' && <KeyboardSpacer />}
        </View>
      </Pressable>
    </Modal>
  );
};