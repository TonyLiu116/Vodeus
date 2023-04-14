import React from 'react';
import {
  Image, ImageBackground, TouchableOpacity, View
} from "react-native";

import { useTranslation } from 'react-i18next';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import warningSvg from '../../assets/call/yellow_warning.svg';
import { Avatars, calcLevel, Categories, Scores, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { DescriptionText } from "./DescriptionText";
import { TitleText } from "./TitleText";
import checkSvg from '../../assets/profile/check.svg';
import unCheckSvg from '../../assets/profile/unCheck.svg';
import supportSvg from '../../assets/Feed/support.svg';
import { MediumText } from './MediumText';
import { SemiBoldText } from './SemiBoldText';
import LinearGradient from 'react-native-linear-gradient';
import { JoinRoom } from './JoinRoom';
import { useState } from 'react';

export const BirdRoomItem = ({
  props,
  info,
  itemIndex,
  isSample = false,
  onEnterRoom = () => { }
}) => {

  if (!info.hostUser?.score) {
    info.hostUser['score'] = 80000;
  }

  const { t, i18n } = useTranslation();

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const [showJoinRoom, setShowJoinRoom] = useState(false);

  const onLimit = (v) => {
    return ((v).length > 50) ?
      (((v).substring(0, 27)) + '...') :
      v;
  }

  return (
    <View
      style={{
        width: isSample ? windowWidth - 58 : windowWidth - 32,
        marginTop: 11,
        paddingLeft: 20,
        paddingRight: 16,
        marginHorizontal: isSample ? 0 : 16,
        paddingTop: 13,
        paddingBottom: 15,
        backgroundColor: itemIndex % 2 ? '#E1FFE4' : '#FFFEE1',
        shadowColor: 'rgba(88, 74, 117, 1)',
        elevation: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        borderRadius: 12,
      }}
    >
      <View
        style={styles.rowSpaceBetween}
      >
        <View>
          <Image
            source={info.hostUser.avatar ? { uri: info.hostUser.avatar.url } : Avatars[info.hostUser.avatarNumber].uri}
            style={{ width: 40, height: 40, borderRadius: 25, backgroundColor: '#FFF' }}
            resizeMode='cover'
          />
          <Image
            source={require('../../assets/common/audio.png')}
            style={{ width: 14.37, height: 14.37, position: 'absolute', right: -8, top: 3 }}
          />
        </View>
        <View style={styles.rowAlignItems}>
          <Image
            source={require("../../assets/call/novo.png")}
            style={{
              height: 18,
              width: 44,
              marginRight: 11
            }}
          />
          <View style={styles.rowAlignItems}>
            <SvgXml
              xml={supportSvg}
            />
            <MediumText
              text={t("Support")}
              fontSize={16}
              lineHeight={19}
              marginLeft={5}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: 12
        }}
      >
        <SemiBoldText
          text={onLimit(t(info.title))}
          maxWidth={windowWidth - 140}
          fontSize={12}
          lineHeight={17}
        />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <DescriptionText
            text={t('Host is ')}
            color='rgba(0, 0, 0, 0.44)'
            lineHeight={14}
            fontSize={10}
          />
          <TitleText
            text={info.hostUser.name}
            color='rgba(0, 0, 0, 0.64)'
            lineHeight={14}
            fontSize={10}
          />
        </View>
      </View>
      <View
        style={[styles.rowSpaceBetween, { marginTop: 15 }]}
      >
        <View style={styles.rowAlignItems}>
          {info.participants.map((item, index) => {
            if (index > 4) return null;
            return <Image
              key={index.toString() + 'birdRoomItem'}
              source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
              style={{ width: 35, height: 35, borderRadius: 25, marginRight: -12, borderWidth: 1, borderColor: '#F9F8F2' }}
              resizeMode='cover'
            />
          })}
          {info.participants.length > 4 && <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 25,
              borderWidth: 1,
              marginRight: -12,
              borderColor: '#F9F8F2',
              backgroundColor: '#CACACA',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <DescriptionText
              text={'+' + (info.participants.length - 4)}
              fontSize={14.64}
              lineHeight={18}
              color='#FFF'
            />
          </View>
          }
          {info.participants.length == 10 && <SvgXml
            style={{
              marginLeft: 4,
              marginTop: 2
            }}
            xml={warningSvg}
          />
          }
        </View>
        {!isSample && <TouchableOpacity style={{
          paddingVertical: 8,
          paddingHorizontal: 22,
          borderRadius: 40,
          borderWidth: 1,
          borderColor: itemIndex % 2 ? '#A4D2D9' : '#DDDBAC',
        }}
          onPress={() => setShowJoinRoom(true)}
          disabled={info.participants.length > 10}
        >
          <SemiBoldText
            text={t("Join now")}
            color='#6F6F6F'
            fontSize={12}
            lineHeight={15}
          />
        </TouchableOpacity>}
      </View>
      {showJoinRoom && <JoinRoom
        roomInfo={info}
        onJoinRoom={() => {
          onEnterRoom()
          setShowJoinRoom(false);
        }}
        onCloseModal={() => setShowJoinRoom(false)}
      />}
    </View>
  );
};
