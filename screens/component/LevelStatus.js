import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Modal, Pressable, ImageBackground, Image, Share } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import checkSvg from '../../assets/profile/check.svg';
import unCheckSvg from '../../assets/profile/unCheck.svg';
import LinearGradient from 'react-native-linear-gradient';
import { LinearTextGradient } from "react-native-text-gradient";
import { MyButton } from './MyButton';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import * as Progress from "react-native-progress";
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { styles } from '../style/Common';
import { Avatars, calcLevel, Scores, windowWidth } from '../../config/config';
import { useSelector } from 'react-redux';
import { stat } from 'react-native-fs';

export const LevelStatus = ({
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
          width: 312,
          height: 425,
          borderRadius: 40,
          backgroundColor: '#FFF',
          alignItems: 'center'
        }}>
          <Image
            source={userInfo.avatar ? { uri: userInfo.avatar.url } : Avatars[userInfo.avatarNumber].uri}
            style={{ width: 55, height: 55, borderRadius: 30, marginTop: -22.5 }}
            resizeMode='cover'
          />
          {userInfo.id == user.id && <SemiBoldText
            text={t("You are a ") + t(Scores[calcLevel(userInfo.score)].levelName) + ' ' + t("member")}
            fontSize={20}
            color='#000'
            marginTop={22}
          />}
          <ImageBackground
            source={Scores[calcLevel(userInfo.score)].uri}
            style={{
              width: 97,
              height: 97,
              marginTop: 19,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Progress.Circle
              progress={userInfo.score / Scores[calcLevel(userInfo.score)].targetScore}
              size={67}
              thickness={6}
              borderColor='rgba(255, 255, 255, 0.2)'
              color='rgba(255, 255, 255, 0.8)'
            />
            <SvgXml
              xml={calcLevel(userInfo.score) > 0 ? checkSvg : unCheckSvg}
              width={32}
              height={32}
              style={{
                position: 'absolute',
                top: 32.5,
                left: 32.5
              }}
            />
          </ImageBackground>
          <View style={{
            width: 80,
            height: 30,
            borderRadius: 20,
            borderWidth: 1.76,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(200, 200, 200, 0.8)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -28
          }}>
            <DescriptionText
              text={userInfo.score + '🕯️'}
              fontSize={15}
              lineHeight={18}
              color='#FEFEFE'
            />
          </View>
          <View style={{
            marginTop: 25
          }}>
            <View style={styles.rowAlignItems}>
              <DescriptionText
                text={t("Invite friends") + ':'}
                color='#9138F6'
                fontSize={17}
              />
              <DescriptionText
                text='🕯x10'
                color='#000000'
                fontSize={17}
              />
            </View>
            <View style={styles.rowAlignItems}>
              <DescriptionText
                text={t("Like a publication") + ':'}
                color='#9138F6'
                fontSize={17}
              />
              <DescriptionText
                text='🕯x0.2'
                color='#000000'
                fontSize={17}
              />
            </View>
            <View style={styles.rowAlignItems}>
              <DescriptionText
                text={t("Comment a publication") + ':'}
                color='#9138F6'
                fontSize={17}
              />
              <DescriptionText
                text='🕯x1'
                color='#000000'
                fontSize={17}
              />
            </View>
            <View style={styles.rowAlignItems}>
              <DescriptionText
                text={t("Connect once a day") + ':'}
                color='#9138F6'
                fontSize={17}
              />
              <DescriptionText
                text='🕯x1'
                color='#000000'
                fontSize={17}
              />
            </View>
            <View style={styles.rowAlignItems}>
              <DescriptionText
                text={t("Create a publication") + ':'}
                color='#9138F6'
                fontSize={17}
              />
              <DescriptionText
                text='🕯x8'
                color='#000000'
                fontSize={17}
              />
            </View>
          </View>
          {calcLevel(userInfo.score) < 5 && <View style={{
            marginTop: 25,
            marginRight: 12
          }}>
            <Progress.Bar
              progress={userInfo.score / Scores[calcLevel(userInfo.score)].targetScore}
              width={232}
              height={21}
              borderRadius={15}
              borderColor='#EDEFF1'
              borderWidth={2}
              color='#6479FE'
              unfilledColor='#EDEFF1'
              tex
            />
            <View style={{
              position: 'absolute',
              width: 232,
              height: 21,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <DescriptionText
                text={userInfo.score.toString() + '/' + Scores[calcLevel(userInfo.score)].targetScore.toString() + ' 🕯️ ' + t("left")}
                fontSize={15}
                color='#FEFEFE'
              />
            </View>
            <ImageBackground
              source={Scores[calcLevel(userInfo.score) + 1].uri}
              style={{
                position: 'absolute',
                right: -14.5,
                top: -14.5,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Progress.Circle
                progress={userInfo.score / Scores[calcLevel(userInfo.score)].targetScore}
                size={35}
                thickness={4}
                borderColor='rgba(255, 255, 255, 0.2)'
                color='rgba(255, 255, 255, 0.8)'
              />
              <SvgXml
                xml={checkSvg}
                width={16}
                height={16}
                style={{
                  position: 'absolute',
                  top: 17,
                  left: 17
                }}
              />
            </ImageBackground>
          </View>
          }
        </View>
        <MyButton
          label={t("Earn 10 🕯️ per new friend")}
          onPress={() => {
            props.navigation.navigate("AddFriend", { isSimple: true })
            closeModal();
          }}
          marginTop={25}
        />
      </Pressable>
    </Modal>
  );
};
