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
import LinearGradient from 'react-native-linear-gradient';

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
      <Pressable onPressOut={closeModal} style={[styles.swipeModal, { justifyContent: 'flex-end' }]}>
        <View style={{
          width: windowWidth,
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
          backgroundColor: '#FFF',
          alignItems: 'center'
        }}>
          <View style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 18,
            marginBottom: 28
          }}>
            <View style={{
              width: 75,
              height: 5,
              backgroundColor: '#E5E6EB',
              borderRadius: 4
            }}></View>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
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
                  color='#ED532E'
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
                  color='#000'
                />
                <TitleText
                  text={Scores[calcLevel(userInfo.score)].targetScore}
                  fontSize={16}
                  lineHeight={20}
                  color='rgba(0, 0, 0, 0.23)'
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
          {userInfo.id == user.id && <SemiBoldText
            text={t("You are a ") + t(Scores[calcLevel(userInfo.score)].levelName) + ' ' + t("member")}
            fontSize={24}
            lineHeight={30}
            color='#000'
            marginTop={22}
            textAlign='center'
            maxWidth={180}
          />}
          <View style={{
            marginTop: 23,
            width: windowWidth - 59,
            borderRadius: 34,
            backgroundColor: '#FAF6F6',
            paddingLeft: 27,
            paddingRight: 19
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 21
            }}>
              <TitleText
                text={t("Invite friends")}
                color='#000'
                fontSize={12}
                lineHeight={16}
              />
              <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                colors={['#FF9768', '#E73918']}
                style = {{
                  width: 68,
                  height: 27,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <DescriptionText
                  text = {'🕯 x 50 '}
                  fontSize={12}
                  lineHeight={16}
                  color='#FFF'
                />
              </LinearGradient>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16
            }}>
              <TitleText
                text={t("Like a publication")}
                color='#000'
                fontSize={12}
                lineHeight={16}
              />
              <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                colors={['#FF9768', '#E73918']}
                style = {{
                  width: 68,
                  height: 27,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <DescriptionText
                  text = {'🕯 x 5  '}
                  fontSize={12}
                  lineHeight={16}
                  color='#FFF'
                />
              </LinearGradient>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16
            }}>
              <TitleText
                text={t("Comment a publication")}
                color='#000'
                fontSize={12}
                lineHeight={16}
              />
              <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                colors={['#FF9768', '#E73918']}
                style = {{
                  width: 68,
                  height: 27,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <DescriptionText
                  text = {'🕯 x 5  '}
                  fontSize={12}
                  lineHeight={16}
                  color='#FFF'
                />
              </LinearGradient>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16
            }}>
              <TitleText
                text={t("Connect once a day")}
                color='#000'
                fontSize={12}
                lineHeight={16}
              />
              <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                colors={['#FF9768', '#E73918']}
                style = {{
                  width: 68,
                  height: 27,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <DescriptionText
                  text = {'🕯 x 10 '}
                  fontSize={12}
                  lineHeight={16}
                  color='#FFF'
                />
              </LinearGradient>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              marginBottom: 19
            }}>
              <TitleText
                text={t("Create a publication")}
                color='#000'
                fontSize={12}
                lineHeight={16}
              />
              <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                colors={['#FF9768', '#E73918']}
                style = {{
                  width: 68,
                  height: 27,
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <DescriptionText
                  text = {'🕯 x 5  '}
                  fontSize={12}
                  lineHeight={16}
                  color='#FFF'
                />
              </LinearGradient>
            </View>
          </View>
          <MyButton
            label={t("Earn 10 🕯️ per new friend")}
            onPress={() => {
              props.navigation.navigate("AddFriend", { isSimple: true })
              closeModal();
            }}
            marginTop={32}
            marginBottom={25}
          />
        </View>
      </Pressable>
    </Modal>
  );
};
