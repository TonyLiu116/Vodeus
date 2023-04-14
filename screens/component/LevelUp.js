import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, Modal, Pressable, View } from 'react-native';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import checkSvg from '../../assets/profile/check.svg';
import unCheckSvg from '../../assets/profile/unCheck.svg';
import arrowSequenceSvg from '../../assets/common/arrow_sequence.svg';
import { Avatars, calcLevel, Scores, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { DescriptionText } from './DescriptionText';
import { MyButton } from './MyButton';
import { SemiBoldText } from './SemiBoldText';
import { TitleText } from './TitleText';

export const LevelUp = ({
  props,
  userInfo,
  onCloseModal = () => { }
}) => {

  const { t, i18n } = useTranslation();
  const [showLevel, setShowLevel] = useState(true);

  const user = useSelector(state => state.user.user);

  const closeModal = () => {
    onCloseModal();
    setShowLevel(false);
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showLevel}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPressOut={closeModal} style={[styles.swipeModal, { alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{
          width: windowWidth - 16,
          borderRadius: 34,
          backgroundColor: '#FFF',
          alignItems: 'center'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: 34
          }}>
            <View style={{
              alignItems: 'center',
              marginRight: 14,
              marginTop: -14
            }}>
              <ImageBackground
                source={Scores[calcLevel(userInfo.score)].uri}
                style={{
                  width: 70,
                  height: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Progress.Circle
                  progress={userInfo.score / Scores[calcLevel(userInfo.score)].targetScore}
                  size={70}
                  thickness={3.4}
                  borderWidth={0}
                  color='#096059'
                />
              </ImageBackground>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                position: 'absolute',
                width: '100%',
                justifyContent: 'center',
                bottom: -28
              }}>
                <TitleText
                  text={'x' + userInfo.score + '/'}
                  fontSize={16}
                  lineHeight={20}
                  color='#0B7369'
                />
                <TitleText
                  text={Scores[calcLevel(userInfo.score)].targetScore+' !!!'}
                  fontSize={16}
                  lineHeight={20}
                  color='#0B7369'
                />
              </View>
            </View>
            <SvgXml
              xml={arrowSequenceSvg}
            />
            <View style={{
              marginLeft: 14
            }}>
              <Image
                source={userInfo.avatar ? { uri: userInfo.avatar.url } : Avatars[userInfo.avatarNumber].uri}
                style={{ width: 105, height: 105, borderRadius: 60, }}
                resizeMode='cover'
              />
              <Image
                source={require('../../assets/common/yellow_star.png')}
                style={{ position: 'absolute', bottom: -3, right: -6, width: 44, height: 44 }}
                resizeMode='cover'
              />
            </View>
          </View>
          <SemiBoldText
            text={t("Congratulations" + '!')}
            fontSize={36}
            lineHeight={40}
            color='#09605A'
            marginTop={47}
          />
          <SemiBoldText
            text={t("You are a ") + t(Scores[calcLevel(userInfo.score)].levelName) + ' ' + t("member")}
            fontSize={24}
            lineHeight={30}
            color='#000'
            marginTop={26}
          />
          <MyButton
            label={t("Fantastic!")}
            onPress={() => {
              closeModal();
            }}
            marginTop={38}
            marginBottom={15}
          />
        </View>
      </Pressable>
    </Modal>
  );
};
