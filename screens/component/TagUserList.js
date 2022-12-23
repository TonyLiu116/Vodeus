import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native';

import { TitleText } from './TitleText';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatars } from '../../config/config';

export const TagUserList = ({
  props,
  users,
  onCloseModal = () => { },
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

  useEffect(() => {

  }, [])

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
        <View style={styles.swipeContainerContent}>
          <View style={[styles.rowSpaceBetween, { paddingLeft: 16, paddingRight: 14, paddingTop: 14, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
            <TitleText
              text={t("Tag friends") + "(" + users.length + ")"}
              fontFamily="SFProDisplay-Semibold"
              fontSize={15}
              lineHeight={24}
            />
            <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
              <Pressable onPress={() => closeModal()}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={closeBlackSvg}
                />
              </Pressable>
            </View>
          </View>
          <ScrollView>
            {
              users.map((item, index) => <TouchableOpacity onPress={() => {
                if (item.id == user.id)
                  props.navigation.navigate('Profile');
                else
                  props.navigation.navigate('UserProfile', { userId: item.id });
                closeModal();
              }}
                key={index + item.id + "likes"}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 10, marginBottom: 10 }}
              >
                <Image
                  source={item.avatar ? { uri: item.avatar.url } : Avatars[item.avatarNumber].uri}
                  style={{ width: 50, height: 50, borderRadius: 25, borderColor: '#FFA002', borderWidth: item.premium == 'none' ? 0 : 2 }}
                  resizeMode='cover'
                />
                <TitleText
                  text={item.name}
                  fontSize={17}
                  marginLeft={16}
                />
              </TouchableOpacity>
              )
            }
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};
