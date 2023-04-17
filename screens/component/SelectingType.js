import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import whiteAlphaSvg from '../../assets/common/white_alpha.svg';
import whiteFriendSvg from '../../assets/common/white_friend.svg';
import whiteRoomSvg from '../../assets/common/white_room.svg';
import { windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { DescriptionText } from './DescriptionText';

export const SelectingType = ({
  props,
  onNewRoom = () => { },
  onNewPost = () => { },
  onInvitePeople = () => { },
  onCloseModal = () => { }
}) => {

  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(true);

  const user = useSelector(state => state.user.user);

  const closeModal = () => {
    onCloseModal();
    setShowModal(false);
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
      <Pressable onPressOut={closeModal} style={[styles.swipeModal, { justifyContent: 'flex-end' }]}>
        <LinearGradient
          style={
            {
              width: windowWidth,
              borderRadius: 17,
              alignItems: 'center',
            }
          }
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          locations={[0, 1]}
          colors={['#6051AD', '#423582']}
        >
          <View style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 17,
            marginBottom: 28
          }}>
            <View style={{
              width: 75,
              height: 5,
              backgroundColor: '#443688',
              borderRadius: 4
            }}>

            </View>
          </View>
          <TouchableOpacity
            style={{
              width: windowWidth - 32,
              height: 73,
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 12,
              backgroundColor: '#443688',
              alignItems: 'center',
              paddingLeft: 24,
              paddingRight: 18
            }}
            onPress={() => onNewRoom()}
          >
            <DescriptionText
              text={t("New Room")}
              color='#FFF'
              fontSize={20}
              lineHeight={26}
            />
            <SvgXml
              xml={whiteRoomSvg}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: windowWidth - 32,
              height: 73,
              marginTop: 7,
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 12,
              backgroundColor: '#443688',
              alignItems: 'center',
              paddingLeft: 24,
              paddingRight: 18
            }}
            onPress={() => onNewPost()}
          >
            <DescriptionText
              text={t("New Post")}
              color='#FFF'
              fontSize={20}
              lineHeight={26}
            />
            <SvgXml
              xml={whiteAlphaSvg}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: windowWidth - 32,
              height: 73,
              marginTop: 7,
              marginBottom: 25,
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 12,
              backgroundColor: '#443688',
              alignItems: 'center',
              paddingLeft: 24,
              paddingRight: 18
            }}
            onPress={() => onInvitePeople()}
          >
            <DescriptionText
              text={t("Invite People")}
              color='#FFF'
              fontSize={20}
              lineHeight={26}
            />
            <SvgXml
              xml={whiteFriendSvg}
            />
          </TouchableOpacity>
        </LinearGradient>
      </Pressable>
    </Modal>
  );
};
