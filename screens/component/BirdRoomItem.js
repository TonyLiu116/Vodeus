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

export const BirdRoomItem = ({
  props,
  info,
  onEnterRoom = () => { }
}) => {

  if(!info.hostUser?.score){
    info.hostUser['score'] = 80000;
  }

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
        width: windowWidth - 32,
        height: 141,
        marginTop: 11,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
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
      <View style={{
        width: windowWidth - 32,
        alignItems: 'center',
        position: 'absolute',
        top: -11,
      }}>
        <View
          style={{
            width: 57, height: 22, borderRadius: 12,
            backgroundColor: '#8327D8', flexDirection: 'row', alignItems: 'center',
          }}>
          <View style={{
            height: 11,
            width: 11,
            backgroundColor: '#FF0000',
            borderRadius: 6,
            marginLeft: 4.7
          }}></View>
          <DescriptionText
            text={t("novo")}
            color='#FFF'
            fontSize={13.6}
            lineHeight={14}
            marginLeft={4.7}
          />
        </View>
      </View>
      <DescriptionText
        text={t("Now in direct")}
        fontSize={13}
        lineHeight={21}
        color='#8327D8'
        marginBottom={8}
      />
      <View
        style={styles.row}
      >
        <Image
          source={info.hostUser.avatar ? { uri: info.hostUser.avatar.url } : Avatars[info.hostUser.avatarNumber].uri}
          style={{ width: 40, height: 40, borderRadius: 25, borderWidth: 1, borderColor: '#8327D8' }}
          resizeMode='cover'
        />
        <View style={{
          width: 27,
          height: 27,
          borderRadius: 18,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          left: 24,
          top: 20
        }}>
          <View style={{
            width: 21,
            height: 21,
            borderRadius: 14,
            backgroundColor: '#FFF',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              width: 8.7,
              height: 8.7,
              borderRadius: 6,
              backgroundColor: '#E41717',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            </View>
          </View>
        </View>
        <View
          style={{
            marginLeft: 20
          }}
        >
          <TitleText
            text={onLimit(t(info.title))}
            maxWidth={windowWidth - 140}
            fontSize={17}
          />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <DescriptionText
              text={t('Host is ')}
              color='rgba(54, 18, 82, 0.8)'
              lineHeight={24}
              fontSize={13}
            />
            <TitleText
              text={info.hostUser.name}
              color='rgba(54, 18, 82, 0.8)'
              lineHeight={24}
              fontSize={13}
            />
            <ImageBackground
              source={Scores[calcLevel(info.hostUser.score)].uri}
              style={{
                width: 15,
                height: 15,
                marginLeft:5,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Progress.Circle
                progress={info.hostUser.score / Scores[calcLevel(info.hostUser.score)].targetScore}
                size={15}
                borderWidth={0}
                color='rgba(255, 255, 255, 0.8)'
                unfilledColor='rgba(255, 255, 255, 0.2)'
              />
              <SvgXml
                xml={calcLevel(info.hostUser.score) > 0 ? checkSvg : unCheckSvg}
                width={9}
                height={9}
                style={{
                  position: 'absolute',
                  top: 3,
                  left: 3
                }}
              />
            </ImageBackground>
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
          {info.participants.length == 10 && <SvgXml
            style={{
              marginLeft: 4,
              marginTop: 2
            }}
            xml={warningSvg}
          />
          }
        </View>
        <View style={{
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#8229F4',
          flexDirection: 'row',
        }}
        >
          <View style={{
            width: '100%',
            alignItems: 'center',
            position: 'absolute',
            top: -5
          }}>
            <View style={{
              borderRadius: 10,
              paddingHorizontal: 9,
              backgroundColor: '#FF3B62'
            }}>
              <DescriptionText
                text={t("Live")}
                fontSize={8.75}
                color="#FFF"
                lineHeight={9.55}
              />
            </View>
          </View>
          <Image source={Categories[info.categoryId].uri}
            style={{
              width: 20,
              height: 20,
              marginLeft: 14
            }}
          />
          <DescriptionText
            text={Categories[info.categoryId].label == '' ? t('All') : Categories[info.categoryId].label == 'Support' ? t('Support/Help') : t(Categories[info.categoryId].label)}
            fontSize={14}
            lineHeight={20}
            marginLeft={10}
            marginRight={14}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
