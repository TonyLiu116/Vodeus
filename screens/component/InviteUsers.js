import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  Modal
} from 'react-native';

import { TitleText } from './TitleText';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { ContactList } from './ContactList';
import { windowHeight } from '../../config/config';

export const InviteUsers = ({
  props,
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
        <View style={styles.swipeInputContainerContent}>
          <View style={[styles.rowSpaceBetween, { paddingLeft: 16, paddingRight: 14, paddingTop: 14, paddingBottom: 11 }]}>
            <View></View>
            <TitleText
              text={"Invite Users"}
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
          {/* <ContactList
            props={props}
          /> */}
        </View>
      </Pressable>
    </Modal>
  );
};
