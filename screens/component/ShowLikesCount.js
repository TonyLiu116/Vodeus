import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Image,
  Text,
  Modal
} from 'react-native';

import * as Progress from "react-native-progress";
import { TitleText } from './TitleText';
import { LinearTextGradient } from "react-native-text-gradient";
import { SvgXml } from 'react-native-svg';
import VoiceService from '../../services/VoiceService';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import { useSelector } from 'react-redux';
import { heightRate, styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatars, windowWidth } from '../../config/config';
import { SemiBoldText } from './SemiBoldText';

export const ShowLikesCount = ({
  userInfo,
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
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
      <Pressable onPressOut={closeModal} style={[styles.swipeModal, { alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{
          width: 318,
          borderRadius: 10,
          backgroundColor: '#FFF'
        }}>
          <View style={{
            width: '100%',
            paddingVertical: 55,
            paddingHorizontal: 35,
            borderBottomWidth: 1,
            borderColor: '#D7D7D7',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <SemiBoldText
              text={`${userInfo.user.name} ${t("has received over")} `}
              fontSize={18}
              textAlign='center'
              lineHeight={23}
              width={248}
            />
            <LinearTextGradient
              style={{ fontSize: 18, fontFamily:'SFProDisplay-Semibold'}}
              locations={[0, 1]}
              colors={["#C479FF", "#650DD6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text>{userInfo.likes}</Text>
            </LinearTextGradient>
            <SemiBoldText
              text={" "+t("likes across all stories !")}
              fontSize={18}
              textAlign='center'
              lineHeight={23}
              width={248}
            />
          </View>
          <Pressable style={{
            width: '100%',
            height: 45,
            alignItems: 'center',
            justifyContent: 'center'
          }}
            onPress={closeModal}
          >
            <TitleText
              text={t("OK")}
              color="#000"
              fontSize={18}
              lineHeight={23}
            />
          </Pressable>
        </View>
        <Image
          style={{
            position: 'absolute',
            left: (windowWidth - 448) / 2,
          }}
          source={require('../../assets/profile/LikesBack1.png')}
        />
      </Pressable>
    </Modal>
  );
};
