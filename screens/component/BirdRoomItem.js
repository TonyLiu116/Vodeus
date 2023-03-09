import React from 'react';
import {
  Image, TouchableOpacity, View
} from "react-native";

import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import warningSvg from '../../assets/call/yellow_warning.svg';
import { Avatars, Categories, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { DescriptionText } from "./DescriptionText";
import { TitleText } from "./TitleText";


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
    return ((v).length > 30) ?
      (((v).substring(0, 27)) + '...') :
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
      onPress={() => onEnterRoom()}
      disabled={info.participants.length > 99}
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
            maxWidth={windowWidth - 140}
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
          {info.participants.length < 10 ? <DescriptionText
            text={info.participants.length.toString() + ' ' + t("people are listening")}
            fontSize={11}
            lineHeight={16}
            marginLeft={26}
            color='#8327D8'
          /> :
            <DescriptionText
              text={info.participants.length.toString() + ' ' + t("people joined - full")}
              fontSize={11}
              lineHeight={16}
              marginLeft={26}
              color='#F79F40'
            />
          }
          {info.participants.length == 10 &&<SvgXml
            style={{
              marginLeft: 4,
              marginTop: 2
            }}
            xml={warningSvg}
          />
          }
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
