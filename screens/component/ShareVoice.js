import React, { useState } from "react";
import { View, TouchableOpacity, Image, Modal, Pressable, Share } from "react-native";
import { SvgXml } from 'react-native-svg';
import { windowWidth } from '../../config/config';
import Clipboard from '@react-native-community/clipboard';
import socialShare from 'react-native-share';
import { styles } from '../style/Common';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import messageSvg from '../../assets/setting/message.svg';
import copySvg from '../../assets/post/copy.svg';
import { DescriptionText } from "./DescriptionText";
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import VoiceService from "../../services/VoiceService";
import { useDispatch, useSelector } from 'react-redux';

export const ShareVoice = ({
  onCloseModal = () => { },
  info
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const singleShare = async (customOptions) => {
    try {
      await socialShare.shareSingle(customOptions);
    } catch (err) {
      console.log(err);
    }
  };

  const shareMessage = async () => {
    let msg =  t("Hey! Are you ok? I'm a little tired of apps like Insta, BeReal etc. I want to share real moments with my loved ones, including you, on Vocco. Will you join me?") + '(' +  t("it's free!") + ')';
    const options = {
        title: 'Sharing!',
        message: msg,
        url: `https://vocco.app.link/${user.name}`,
    };
    await Share.share(options);
  }

  const onCopyLink = () => {
    Clipboard.setString(`https://vocco.app.link/${user.name}`);
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPressOut={closeModal} style={styles.swipeModal}>
        <View
          style={{
            position: 'absolute',
            bottom: 25,
            width: '100%',
            paddingHorizontal: 14,
            flex: 1,
            alignItems: 'center'
          }}
        >
          <View
            style={{
              borderRadius: 24,
              width: '100%',
              height: 281,
              backgroundColor: 'white',
              shadowColor: 'rgba(42, 10, 111, 1)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 10,
              paddingHorizontal: 24
            }}
          >
            <View style={[styles.rowSpaceBetween, { marginTop: 16, marginBottom: 24 }]}>
              <DescriptionText
                text={t("Share with a friend")}
                color="#281E30"
                fontSize={17}
                lineHeight={28}
              />
              <TouchableOpacity onPress={closeModal} style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                <View>
                  <SvgXml
                    width={18}
                    height={18}
                    xml={closeBlackSvg}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {/* <View style={styles.rowSpaceEvenly}>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={async () => {
                  await singleShare({
                    title: "Share via message",
                    message: "some awesome dangerous message",
                    url: info.file.url,
                    social: socialShare.Social.SNAPCHAT,
                    filename: info.title,
                  });
                  VoiceService.shareStory(info.id, 'record');
                }}>
                  <Image
                    style={{
                      width: 58,
                      height: 58
                    }}
                    source={require('../../assets/post/Logo-snap.jpg')}
                  />
                </TouchableOpacity>
                <DescriptionText
                  text='Snapchat'
                  fontSize={12}
                  lineHeight={16}
                  color='rgba(54, 36, 68, 0.8)'
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {
                  VoiceService.shareStory(info.id, 'record');
                }}>
                  <Image
                    style={{
                      width: 58,
                      height: 58
                    }}
                    source={require('../../assets/post/Logo-tiktok.jpg')}
                  />
                </TouchableOpacity>
                <DescriptionText
                  text='TikTok'
                  fontSize={12}
                  lineHeight={16}
                  color='rgba(54, 36, 68, 0.8)'
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={async () => {
                  await singleShare({
                    title: "Share via message",
                    message: "some awesome dangerous message",
                    url: info.file.url,
                    backgroundImage: 'https://source.unsplash.com/daily',
                    social: socialShare.Social.INSTAGRAM_STORIES,
                    filename: info.title,
                  });
                  VoiceService.shareStory(info.id, 'record');
                }}>
                  <Image
                    style={{
                      width: 58,
                      height: 58
                    }}
                    source={require('../../assets/post/Logo-instagram.jpg')}
                  />
                </TouchableOpacity>
                <DescriptionText
                  text='Instagram'
                  fontSize={12}
                  lineHeight={16}
                  color='rgba(54, 36, 68, 0.8)'
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={async () => {
                  await singleShare({
                    title: "Share via message",
                    message: "some awesome dangerous message",
                    url: info.file.url,
                    social: socialShare.Social.WHATSAPP,
                    //whatsAppNumber: user.phoneNumber?user.phoneNumber:"91999999",
                    filename: info.title,
                  });
                  VoiceService.shareStory(info.id, 'record');
                }}>
                  <Image
                    style={{
                      width: 58,
                      height: 58
                    }}
                    source={require('../../assets/post/Logo-whatsapp.jpg')}
                  />
                </TouchableOpacity>
                <DescriptionText
                  text='WhatsApp'
                  fontSize={12}
                  lineHeight={16}
                  color='rgba(54, 36, 68, 0.8)'
                />
              </View>
            </View> */}
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => shareMessage()}
                style={styles.boxContainer}>
                <SvgXml
                  width={39}
                  height={39}
                  xml={messageSvg}
                />
              </TouchableOpacity>
              <DescriptionText
                text='Message'
                fontSize={11}
                lineHeight={12}
                color='#281E30'
                marginTop={12}
              />
            </View>
            <View style={{ backgroundColor: '#F2F0F5', height: 1, width: '100%', marginTop: 20, marginBottom: 16 }}></View>
            <DescriptionText
              text={t("Story Link") + ":"}
              color="#281E30"
              fontSize={17}
              lineHeight={28}
            />
            <View style={[styles.rowSpaceBetween, { width: '100%', height: 40, marginTop: 8, borderWidth: 1, borderColor: '#F2F0F5', borderRadius: 12 }]}>
              <View style={{ width: windowWidth - 115, height: 26 }}>
                <DescriptionText
                  text={`https://vocco.app.link/${user.name}`}
                  color="#281E30"
                  fontSize={22}
                  lineHeight={26}
                  marginLeft={12}
                />
              </View>
              <TouchableOpacity onPress={onCopyLink}>
                <SvgXml
                  width={24}
                  height={24}
                  marginRight={10}
                  xml={copySvg}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
