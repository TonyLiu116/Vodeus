import React, { useState } from "react";
import { View, Pressable, Modal, Image } from "react-native";
import AutoHeightImage from 'react-native-auto-height-image';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import replySvg from '../../assets/chat/reply-icon.svg';
import selectedSvg from '../../assets/chat/selected.svg';
import unSelectedSvg from '../../assets/chat/unselected.svg';
import { styles } from '../style/Common';
import { Avatars, windowWidth } from "../../config/config";

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { MessageContext } from "./MessageContext";
import { MessageContent } from "./MessageContent";
import { DescriptionText } from "./DescriptionText";
import { TouchableOpacity } from "react-native-gesture-handler";
import VoicePlayer from "../Home/VoicePlayer";
import { SemiBoldText } from "./SemiBoldText";

export const ChatMessageItem = ({
  props,
  info,
}) => {
  const { user } = useSelector((state) => state.user);

  const [showContext, setShowContext] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const { t, i18n } = useTranslation();

  const isUser = (user.id == info.user.id);
  const localTime = info.createdAt;

  const onPressContent = (url) => {
    setPhotoUrl(url);
  }

  const onLongPressContent = () => {
    setShowContext(true)
  }

  return (
    <>
      <View style={[styles.rowAlignItems, { width: windowWidth }]}>
        <Pressable onLongPress={() => setShowContext(true)} style={{
          //flexDirection: 'row',
          width: windowWidth - 16,
          alignItems: isUser ? 'flex-end' : 'flex-start', marginTop: 20
        }}>
          {isUser ? <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 16
          }}>
            <DescriptionText
              text={new Date(localTime).toString().substr(16, 5)}
              lineHeight={24}
              fontSize={13}
              color='#8F8F8F'
            />
            <SemiBoldText
              text={t('You')}
              marginLeft={7}
              fontSize={16}
              lineHeight={24}
            />
          </View> :
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 4,
            }}>
              <Image
                source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
                style={{ width: 32, height: 32, borderRadius: 30 }}
                resizeMode='cover'
              />
              <SemiBoldText
                text={info.user.name}
                fontSize={16}
                lineHeight={24}
                marginLeft={11}
              />
              <DescriptionText
                text={new Date(localTime).toString().substr(16, 5)}
                lineHeight={24}
                marginLeft={7}
                fontSize={13}
                color='#8F8F8F'
              />
            </View>
          }
          {info.type == 'voice' ?
            <View style={{
              alignItems: isUser ? "flex-end" : 'flex-start'
            }}>
              <DescriptionText
                text={new Date(localTime).toString().substr(16, 5)}
                lineHeight={24}
                fontSize={13}
                marginRight={8}
                marginLeft={8}
                color='#8F8F8F'
              />
              <View
                style={
                  {
                    backgroundColor: isUser ? '#786BC2' : 'rgba(71, 58, 136, 0.08)',
                    paddingHorizontal: 10,
                    paddingVertical: 16,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    borderTopLeftRadius: isUser ? 16 : 8,
                    borderTopRightRadius: isUser ? 8 : 16,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }
                }
              >
                <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                  <LinearGradient
                    colors={isPlaying ? ['#9A90D1', '#9A90D1'] : ['#8274CF', '#2C235C']}
                    locations={[0, 1]}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    style={{
                      width: 29.1,
                      height: 29.1,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 4
                    }}
                  >
                    <SvgXml
                      xml={isPlaying ? simplePauseSvg : triangleSvg}
                      width={10.5}
                      height={13}
                    />
                  </LinearGradient>
                </TouchableOpacity>
                <VoicePlayer
                  voiceUrl={info.value}
                  waveColor={isUser ? ['#E4CAFC', '#E4CAFC', '#E4CAFC'] : ['#8274CF', '#8274CF', '#8274CF']}
                  playing={isPlaying}
                  height={25}
                  playBtnSize={12}
                  startPlay={() => setIsPlaying(true)}
                  stopPlay={() => setIsPlaying(false)}
                  tinWidth={windowWidth / 300}
                  mrg={windowWidth / 730}
                />
              </View>
            </View>
            :
            info.type == 'bio' ?
              <View
                style={
                  {
                    backgroundColor: isUser ? '#786BC2' : 'rgba(71, 58, 136, 0.08)',
                    padding: 10,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    borderTopLeftRadius: isUser ? 16 : 8,
                    borderTopRightRadius: isUser ? 8 : 16,
                  }
                }
              >
                <DescriptionText
                  text={info.value}
                  fontSize={17}
                  color={isUser ? '#FFF' : '#000'}
                />
              </View>
              :
              info.type == 'emoji' ?
                <View style={{
                  marginRight: 58
                }}>
                  <Text
                    style={{
                      fontSize: 50,
                      color: 'white',
                    }}
                  >
                    {info.value}
                  </Text>
                  <View style={{
                    position: 'absolute',
                    bottom: 8,
                    right: -50,
                    padding: 8,
                    borderRadius: 14,
                    backgroundColor: 'rgba(54, 36, 68, 0.8)'
                  }}>
                    <DescriptionText
                      text={new Date(localTime).toString().substr(16, 5)}
                      lineHeight={12}
                      fontSize={11}
                      color='#F6EFFF'
                    />
                  </View>
                </View>
                :
                info.type == 'gif' ?
                  <View>
                    <Pressable
                      onPress={() => onPressContent(info.value)}
                      onLongPress={onLongPressContent}
                    >
                      <AutoHeightImage
                        source={{ uri: info.value }}
                        width={199}
                        style={{
                          borderRadius: 20,
                          borderWidth: 4,
                          borderColor: '#FFF'
                        }}
                      />
                    </Pressable>
                    <View style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      padding: 8,
                      borderRadius: 14,
                      backgroundColor: 'rgba(54, 36, 68, 0.8)'
                    }}>
                      <DescriptionText
                        text={new Date(localTime).toString().substr(16, 5)}
                        lineHeight={12}
                        fontSize={11}
                        color='#F6EFFF'
                      />
                    </View>
                  </View>
                  :
                  <View>
                    <Pressable
                      onPress={() => onPressContent(info.value)}
                      onLongPress={onLongPressContent}
                    >
                      <AutoHeightImage
                        source={{ uri: info.value }}
                        width={199}
                        style={{
                          borderRadius: 20,
                          borderWidth: 4,
                          borderColor: '#FFF'
                        }}
                      />
                    </Pressable>
                  </View>
          }
        </Pressable>
      </View>
      {photoUrl != '' && <Modal
        animationType="slide"
        transparent={true}
        visible={photoUrl != ''}
        onRequestClose={() => {
          setPhotoUrl('');
        }}
      >
        <Pressable onPressOut={() => setPhotoUrl('')} style={[styles.swipeModal, { alignItems: 'center', justifyContent: 'center' }]}>
          <View style={{
            width: windowWidth,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginRight: 50,
            marginBottom: 14
          }}>
            <DescriptionText
              text={'X'}
              fontSize={20}
              lineHeight={20}
              color="#FFF"
            />
          </View>
          <View>
            <AutoHeightImage
              source={{ uri: photoUrl }}
              width={windowWidth - 48}
              style={{
                borderRadius: 20,
                borderWidth: 4,
                borderColor: '#FFF'
              }}
            />
            <View style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              padding: 8,
              borderRadius: 14,
              backgroundColor: 'rgba(54, 36, 68, 0.8)'
            }}>
              <DescriptionText
                text={new Date(info.createdAt).toString().substr(16, 5)}
                lineHeight={12}
                fontSize={11}
                color='#F6EFFF'
              />
            </View>
          </View>
        </Pressable>
      </Modal>}
    </>
  );
};
