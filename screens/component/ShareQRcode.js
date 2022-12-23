import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Modal, Pressable, ImageBackground, Image, Share } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import LinearGradient from 'react-native-linear-gradient';
import { LinearTextGradient } from "react-native-text-gradient";
import { MyButton } from './MyButton';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { styles } from '../style/Common';
import { Avatars, windowWidth } from '../../config/config';
import { useSelector } from 'react-redux';
import { stat } from 'react-native-fs';

export const ShareQRcode = ({
  userInfo,
  onCloseModal = () => { }
}) => {

  const { t, i18n } = useTranslation();
  const [showQR, setShowQR] = useState(true);

  const user = useSelector(state => state.user.user);

  let myQRCode = useRef();

  const shareQRCode = () => {
    let msg =  t("Hey! Are you ok? I'm a little tired of apps like Insta, BeReal etc. I want to share real moments with my loved ones, including you, on Vocco. Will you join me?") + '(' +  t("it's free!") + ')'
    myQRCode.toDataURL((dataURL) => {
      let shareImageBase64 = {
        title: 'Vocco',
        message: msg,
        url: `data:image/png;base64,${dataURL}`,
        subject: 'Share Link', //  for email
      };
      Share.share(shareImageBase64).catch((error) => console.log(error));
    });
  };

  const closeModal = () => {
    onCloseModal();
    setShowQR(false);
  }

  const onLimit = (v) => {
    return ((v).length > 9) ?
      (((v).substring(0, 6)) + '...') :
      v;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showQR}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPressOut={closeModal} style={styles.swipeModal}>
        <View style={[styles.swipeInputContainerContent, { backgroundColor: '#F9F1FD' }]}>
          <View style={[styles.rowSpaceBetween, { paddingHorizontal: 14, paddingVertical: 12 }]}>
            <TouchableOpacity onPress={() => closeModal()}>
              <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={closeBlackSvg}
                />
              </View>
            </TouchableOpacity>
            <SemiBoldText
              text={t(userInfo.id == user.id ? "Change your QR-code" : "QR-code")}
              fontSize={17}
              lineHeight={28}
              color='#263449'
            />
            <TouchableOpacity onPress={() => shareQRCode()}>
              <DescriptionText
                text={t('Share')}
                fontSize={17}
                lineHeight={28}
                color='#8327D8'
              />
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={require('../../assets/phoneNumber/background.png')}
            resizeMode="cover"
            style={{
              flex: 1,
              borderTopLeftRadius: 100,
              borderTopRightRadius: 100,
              alignItems: 'center'
            }}
          >
            <View style={{
              width: 279,
              height: 336,
              borderRadius: 32,
              backgroundColor: '#FFF',
              marginTop: 85,
              alignItems: 'center'
            }}>
              <LinearTextGradient
                style={{ fontSize: 80, marginTop: 53, marginBottom: 16 }}
                locations={[0, 1]}
                colors={["#FFC701", "#FF8B02"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <SemiBoldText
                  text={onLimit('@' + userInfo.name)}
                  fontSize={20}
                  lineHeight={24}
                />
              </LinearTextGradient>
              <QRCode
                getRef={(ref) => (myQRCode = ref)}
                value={`https://vocco.app.link/${user.name}`}
                size={208}
                logo={require('../../assets/common/qr-logo.png')}
                logoSize={51}
                linearGradient={['#FEAC5E', '#EBA4F3', '#B1A5FF']} gradientDirection={[0, 170, 0, 0]}
              />
            </View>
            <View style={{
              position: 'absolute',
              top: 48,
              width: windowWidth,
              alignItems: 'center'
            }}>
              <Image
                source={userInfo.avatar ? { uri: userInfo.avatar.url } : Avatars[userInfo.avatarNumber].uri}
                style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.6)' }}
                resizeMode='cover'
              />
            </View>
            <LinearGradient
              colors={['#FFFFFF', 'rgba(255,255,255, 0)']}
              locations={[0.7, 1]}
              start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
              style={{ position: 'absolute', paddingHorizontal: 16, bottom: 0, width: windowWidth }}
            >
              <MyButton
                label={t("Share QR-code")}
                //marginTop={90}
                onPress={() => shareQRCode()}
                //active={()=>{}}
                marginBottom={20}
              />
            </LinearGradient>
          </ImageBackground>
        </View>
      </Pressable>
    </Modal>
  );
};
