import React, { useState } from "react";
import { View, Text, Image, Modal, Pressable, TouchableOpacity } from "react-native";
import AutoHeightImage from 'react-native-auto-height-image';
import { DescriptionText } from "./DescriptionText";
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';
import VoicePlayer from '../Home/VoicePlayer';
import { Avatars, windowWidth } from "../../config/config";

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import LinearGradient from "react-native-linear-gradient";
import { SvgXml } from "react-native-svg";
import blackReplySvg from '../../assets/chat/black-reply-icon.svg';
import NavigationService from "../../services/NavigationService";

export const MessageContent = ({
  info,
  isAnswer = false,
  onPressContent = () => { },
  onLongPressContent = () => { }
}) => {

  const { user } = useSelector((state) => state.user);

  const { t, i18n } = useTranslation();

  const isSender = (user.id == info.user.id);

  const localTime = info.createdAt;

  return (
    info.type == 'voice' ?
      <View style={{
        height: 80,
        justifyContent: 'center'
      }}>
        <LinearGradient
          style={
            {
              padding: 8,
              paddingRight: 8,
              paddingLeft: 0,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              borderTopLeftRadius: isSender ? 16 : 8,
              borderTopRightRadius: isSender ? 8 : 16,
            }
          }
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          colors={isSender ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FFF', '#FFF', '#FFF']}
        >
          <VoicePlayer
            voiceUrl={info?.file.url}
            playBtn={true}
            waveColor={['#E4CAFC', '#E4CAFC', '#E4CAFC']}
            playing={false}
            height={isAnswer ? 20 : 25}
            playBtnSize={isAnswer ? 12 : 10}
            startPlay={() => { }}
            stopPlay={() => { }}
            tinWidth={windowWidth / (isAnswer ? 350 : 300)}
            mrg={windowWidth / (isAnswer ? 850 : 730)}
            duration={info.duration * 1000}
          />
          <View style={[styles.rowSpaceBetween, { paddingLeft: 16, paddingRight: 8, marginTop: 6 }]}>
            <DescriptionText
              text={new Date(info.duration * 1000).toISOString().substr(14, 5)}
              lineHeight={12}
              fontSize={11}
              color={isSender ? '#FFF' : 'rgba(59, 31, 82, 0.6)'}
            />
            <DescriptionText
              text={new Date(localTime).toString().substr(16, 5)}
              lineHeight={12}
              fontSize={11}
              color={isSender ? '#FFF' : 'rgba(59, 31, 82, 0.6)'}
            />
          </View>
        </LinearGradient>
      </View>
      :
      info.type == 'bio' ?
        <LinearGradient
          style={
            {
              padding: 8,
              paddingRight: 8,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              borderTopLeftRadius: isSender ? 16 : 8,
              borderTopRightRadius: isSender ? 8 : 16,
            }
          }
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          colors={isSender ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FFF', '#FFF', '#FFF']}
        >
          <DescriptionText
            text={info.bio}
            fontSize={17}
            color={isSender ? '#FFF' : '#4A4A4A'}
          />
        </LinearGradient>
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
              {info.emoji}
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
          info.type == 'record' ?
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <SvgXml
                width={40}
                height={40}
                xml={blackReplySvg}
              />
              <View style={{
                marginLeft: 13,
                height: 182,
                borderRadius: 20,
                borderWidth: 3,
                borderColor: '#FFF',
                backgroundColor: '#FFD2F3'
              }}>
                <TouchableOpacity style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 11,
                  marginTop: 11,
                  marginBottom: 12
                }}
                  onPress={() => {
                    if (info.record.user.id == user.id)
                      NavigationService.navigate('Profile');
                    else
                      NavigationService.navigate('UserProfile', { userId: info.record.user.id });
                  }}
                >
                  <Image
                    source={info.record.user.avatar ? { uri: info.record.user.avatar.url } : Avatars[info.record.user.avatarNumber].uri}
                    style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF' }}
                    resizeMode='cover'
                  />
                  <DescriptionText
                    text={info.record.user.name}
                    fontSize={16.5}
                    lineHeight={18}
                    marginLeft={9}
                    color='#000'
                  />
                  <DescriptionText
                    text={info.record.title.toUpperCase()}
                    fontFamily="SFProDisplay-Light"
                    fontSize={15}
                    lineHeight={18}
                    marginLeft={9}
                    color='#000'
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => NavigationService.navigate("VoiceProfile", { id: info.record.id })}>
                  <LinearGradient
                    style={
                      {
                        padding: 8,
                        paddingRight: 8,
                        paddingLeft: 0,
                        marginHorizontal: 15,
                        marginBottom: 24,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        borderTopLeftRadius: isSender ? 16 : 8,
                        borderTopRightRadius: isSender ? 8 : 16,
                      }
                    }
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    colors={isSender ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FFF', '#FFF', '#FFF']}
                  >
                    <VoicePlayer
                      voiceUrl={info.record.file.url}
                      playBtn={true}
                      waveColor={['#E4CAFC', '#E4CAFC', '#E4CAFC']}
                      playing={false}
                      height={25}
                      playBtnSize={10}
                      startPlay={() => { }}
                      stopPlay={() => { }}
                      tinWidth={windowWidth / 300}
                      mrg={windowWidth / 730}
                      duration={info.record.duration * 1000}
                    />
                    <View style={[styles.rowSpaceBetween, { paddingLeft: 16, paddingRight: 8, marginTop: 6 }]}>
                      <DescriptionText
                        text={new Date(info.record.duration * 1000).toISOString().substr(14, 5)}
                        lineHeight={12}
                        fontSize={11}
                        color={isSender ? '#FFF' : 'rgba(59, 31, 82, 0.6)'}
                      />
                      <DescriptionText
                        text={new Date(info.record.createdAt).toString().substr(16, 5)}
                        lineHeight={12}
                        fontSize={11}
                        color={isSender ? '#FFF' : 'rgba(59, 31, 82, 0.6)'}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                <View
                  style={{
                    position: 'absolute',
                    bottom: -24,
                    right: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 30,
                    backgroundColor: '#FFF'
                  }}
                >
                  <Image
                    source={require('../../assets/chat/redHeart.png')}
                    style={{
                      width: 14,
                      height: 14
                    }}
                  />
                  <DescriptionText
                    text={info.record.likesCount}
                    fontFamily="SFProDisplay-Medium"
                    color="#000"
                    marginLeft={5}
                    marginRight={10}
                  />
                  <Image
                    source={require('../../assets/chat/play-icon.png')}
                    style={{
                      width: 14,
                      height: 14
                    }}
                  />
                  <DescriptionText
                    text={info.record.listenCount}
                    fontFamily="SFProDisplay-Medium"
                    color="#000"
                    marginLeft={5}
                  />
                </View>
              </View>
            </View>
            :
            info.type == 'gif' ?
              <View>
                <Pressable
                  onPress={() => onPressContent(info.gif)}
                  onLongPress={onLongPressContent}
                >
                  <AutoHeightImage
                    source={{ uri: info.gif }}
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
                  onPress={() => onPressContent(info.file.url)}
                  onLongPress={onLongPressContent}
                >
                  <AutoHeightImage
                    source={{ uri: info.file.url }}
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
  );
};
