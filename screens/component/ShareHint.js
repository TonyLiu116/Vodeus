import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform
} from 'react-native';
import Share from 'react-native-share';
import { useSelector } from 'react-redux';

import { SvgXml } from 'react-native-svg';
import ShareIconsSvg from '../../assets/post/ShareIcons.svg';
import ShareHintSvg from '../../assets/post/ShareHint.svg';
import shareSvg from '../../assets/post/share.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POST_CHECK, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { TitleText } from './TitleText';
import { DescriptionText } from './DescriptionText';
import { SemiBoldText } from './SemiBoldText';
import { useTranslation } from 'react-i18next';
import closeCircleSvg from '../../assets/post/gray-close.svg';
import '../../language/i18n';
import { MyButton } from './MyButton';

export const ShareHint = ({
  onShareAudio = ()=>{},
  onCloseModal = () => { }
}) => {

  const { t, i18n } = useTranslation();
  let { user } = useSelector((state) => state.user);

  const mounted = useRef(false);

  const [showModal, setShowModal] = useState(true);

  const closeModal = async (v = false) => {
    setShowModal(false);
    onCloseModal();
  }

  const shareAudio = () => {
    onShareAudio();
  };

  const onShareLink = () => {
      Share.open({
          url: `https://vocco.app.link/${user.name}`,
          message: t("Hey! Are you ok? I'm a little tired of apps like Insta, BeReal etc. I want to share real moments with my loved ones, including you, on Vocco. Will you join me?") + '(' +  t("it's free!") + ')'
      }).then(res => {

      })
          .catch(err => {
              console.log("err");
          });;
  }

  useEffect(()=>{
    mounted.current = true;
    return ()=>{
      mounted.current = false;
    }
  })

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
        <View style={{
          position: 'absolute',
          backgroundColor: '#FFF',
          bottom: 0,
          width: windowWidth,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          alignItems: 'center'
        }}>
          <TouchableOpacity style={{
            width: windowWidth,
            alignItems: 'flex-end',
            marginTop: 7,
            paddingRight: 12
          }}
            onPress={closeModal}
          >
            <SvgXml
              xml={closeCircleSvg}
            />
          </TouchableOpacity>
          <TitleText
            text={t("Your story is published!")}
            color='#361252'
            fontSize={25.7}
            lineHeight={30}
          />
          <DescriptionText
            text={t("Share your new story with your friends and let the whole world hear you!")}
            color='rgba(54, 18, 82, 0.8)'
            fontSize={15}
            lineHeight={24}
            maxWidth={264}
            textAlign='center'
            marginTop={9}
          />
          <SvgXml
            style={{
              marginTop: 12
            }}
            xml={shareSvg}
          />
          <View
            style={{
              paddingHorizontal: 16,
              width: '100%'
            }}
          >
            <MyButton
              label={t("Share it now")}
              onPress={()=>shareAudio()}
            />
          </View>
          <View
            style={{
              paddingHorizontal: 16,
              width: '100%',
              marginBottom: 30
            }}>
              <MyButton
                label={t("Invite friends")}
                onPress={() => onShareLink()}
              />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
