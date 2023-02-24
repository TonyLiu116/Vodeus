import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Vibration,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { PostContext } from '../component/PostContext';
import { TitleText } from "./TitleText";
import { HeartIcon } from './HeartIcon';
import { StoryLikes } from './StoryLikes';
import { DescriptionText } from "./DescriptionText";
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import pauseSvg from '../../assets/common/pause.svg';
import playSvg from '../../assets/common/play.svg';
import notifySvg from '../../assets/common/notify.svg';
import yellow_starSvg from '../../assets/common/yellow_star.svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { styles } from '../style/Common';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { Avatars, Categories, windowWidth } from '../../config/config';

import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';

export const BirdRoomItem = ({
  props,
  info,
  onEnterRoom = () => { }
}) => {

  const { t, i18n } = useTranslation();

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const onLimit = (v) => {
    return ((v).length > 20) ?
      (((v).substring(0, 17)) + '...') :
      v;
  }

  return (
    <TouchableOpacity
      style={{
        marginTop: 12,
        marginBottom: 4,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#FFF',
        shadowColor: 'rgba(88, 74, 117, 1)',
        elevation: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#8327D8',
      }}
      onPress={()=>onEnterRoom()}
      disabled={info.participants.length>99}
    >
      <DescriptionText
        text={t("Now in direct")}
        fontSize={13}
        lineHeight={21}
        color='#8327D8'
        marginBottom={10}
      />
      <View
        style={styles.row}
      >
        <Image
          source={info.hostUser.avatar ? { uri: info.hostUser.avatar.url } : Avatars[info.hostUser.avatarNumber].uri}
          style={{ width: 40, height: 40, borderRadius: 25 }}
          resizeMode='cover'
        />
        <View
          style={{
            marginLeft: 20
          }}
        >
          <TitleText
            text={onLimit(info.title)}
            maxWidth={windowWidth - 180}
            fontSize={17}
          />
          <View>
            <DescriptionText
              text={t('Host is ') + info.hostUser.name}
              lineHeight={30}
              fontSize={13}
            />
          </View>
        </View>
      </View>
      <View
        style={[styles.rowSpaceBetween, { marginTop: 8 }]}
      >
        <View style={styles.rowAlignItems}>
          {info.participants.map((item, index) => {
            if (index > 4) return null;
            return <Image
              key={index.toString() + 'birdRoomItem'}
              source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
              style={{ width: 27, height: 27, borderRadius: 25, marginRight: -12 }}
              resizeMode='cover'
            />
          })}
          <DescriptionText
            text={info.participants.length.toString() + ' ' + t("people are listening")}
            fontSize={11}
            lineHeight={16}
            marginLeft={26}
            color='#8327D8'
          />
        </View>
        <View style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#8229F4',
          flexDirection: 'row',
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
    </TouchableOpacity>
  );
};
