import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View, Image, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { windowHeight, windowWidth } from '../../config/config';
import '../../language/i18n';
import { useTranslation } from 'react-i18next';
import { styles } from '../style/Common';
import { DescriptionText } from './DescriptionText';
import redWarningSvg from '../../assets/call/redWarning.svg';
import { SemiBoldText } from './SemiBoldText';

export const WelcomeBirdRoom = ({
  onCloseModal = () => { },
}) => {

  const [showModal, setShowModal] = useState(true);

  const { t, i18n } = useTranslation();

  const onClose = () => {
    setShowModal(false);
    onCloseModal()
  }

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        onClose();
      }}
    >
      <Pressable onPressOut={onClose} style={[styles.swipeModal, { height: windowHeight, marginTop: 0, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{
          width: 331.86,
          alignItems: 'center',
          borderRadius:19.7,
          backgroundColor:'#FFF',

        }}>
          <View
            style={{
              width: 72, height: 28, borderRadius: 16, marginTop: 20,
              backgroundColor: '#8327D8', flexDirection: 'row', alignItems: 'center'
            }}>
            <View style={{
              height: 14,
              width: 14,
              backgroundColor: '#FF0000',
              borderRadius: 8,
              marginLeft: 6
            }}></View>
            <DescriptionText
              text={t("novo")}
              color='#FFF'
              fontSize={17}
              lineHeight={18}
              marginLeft={6}
            />
          </View>
          <DescriptionText
            text={t("Live chat rooms are ready!")}
            maxWidth={263}
            fontSize={20}
            lineHeight={31.76}
            textAlign='center'
            color='#000'
            marginTop={15}
          />
          <Image
            source={i18n.language=='English'?require('../../assets/call/sample_room_English.png'):require('../../assets/call/sample_room_Portuguese.png')}
            style={{
              width:279,
              height:140,
              marginTop:2
            }}
          />
          <DescriptionText
            text={'1. '+t("You can participate or create chat rooms.")+'\n2. '+t("Always be polite.")+'\n3. '+t("Make new friends.")}
            maxWidth={309}
            fontSize={13}
            lineHeight={17.27}
            color="#000"
            marginTop={31}
          />
          <Image
            source={require('../../assets/call/call_stream.png')}
            style={{
              width:188.31,
              height:59.12,
              marginTop:21,
              marginLeft:8
            }}
          />
          <SvgXml
            xml={redWarningSvg}
            style={{
              marginTop:12
            }}
          />
          <DescriptionText
            text={t("Discuss topics that interest you. Be polite and respect the thoughts of others!")}
            fontSize={10.36}
            lineHeight={17.27}
            textAlign='center'
            letterSpacing={0.07}
            color='#000'
            marginTop={8}
            maxWidth={226.27}
          />
          <TouchableOpacity style={{
            width:138,
            height:42,
            marginTop:20.55,
            marginBottom:12,
            borderRadius:10,
            backgroundColor:'#F8F0FF',
            alignItems:'center',
            justifyContent:'center'
          }}
            onPress={onClose}
          >
            <SemiBoldText
              text={t("Discover")}
              fontSize={17}
              lineHeight={28}
              color='#8327D8'
            />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};