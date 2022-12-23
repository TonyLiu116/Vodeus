import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  Modal,
  Platform,
  Vibration,
} from 'react-native';

import RNVibrationFeedback from 'react-native-vibration-feedback';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import { windowWidth } from '../../config/config';

export const DeleteConfirm = ({
  onConfirmDelete = () => { },
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);

  const mounted = useRef(false);
 
  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const confirmDelete = ()=>{
    Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    onConfirmDelete();
    setShowModal(false);
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
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
      <Pressable onPressOut={() => closeModal()} style={styles.swipeModal}>
        <View style={{ height: '100%', width: '100%' }}>
          <View style={{ position: 'absolute', width: windowWidth - 16, bottom: 112, marginHorizontal: 8, height: 122, borderRadius: 14, backgroundColor: '#E9EAEC' }}>
            <View style={{ paddingTop: 14, height: 65.5, width: '100%', borderBottomWidth: 1, borderBottomColor: '#B6C2DB', alignItems: 'center' }}>
              <SemiBoldText
                text={t("Do you want to delete this story?")}
                fontSize={13}
                lineHeight={21}
                color='rgba(38, 52, 73, 0.7)'
              />
              <SemiBoldText
                text={t("This action cannot be undone")}
                fontSize={13}
                lineHeight={21}
                color='rgba(38, 52, 73, 0.7)'
              />
            </View>
            <Pressable onPress={confirmDelete}>
              <DescriptionText
                text={t("Delete")}
                fontSize={20}
                lineHeight={24}
                color='#E41717'
                textAlign='center'
                marginTop={16}
              />
            </Pressable>
          </View>
          <View style={{ position: 'absolute', width: windowWidth - 16, bottom: 48, marginHorizontal: 8, height: 56, borderRadius: 14, backgroundColor: 'white' }}>
            <Pressable onPress={() => closeModal()}>
              <DescriptionText
                text={t('Cancel')}
                fontSize={20}
                lineHeight={24}
                color='#1E61EB'
                textAlign='center'
                marginTop={16}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
