import React, { useState, useRef, useEffect} from 'react';
import {
  View,
  Pressable,
  Modal,
  TouchableOpacity,

} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';
import { styles } from '../style/Login';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { DescriptionText } from './DescriptionText';
import { SemiBoldText } from './SemiBoldText';
import { windowWidth } from '../../config/config';

export const PickImage = ({
  onSetImageSource = () => { },
  onCloseModal=()=>{}
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);

  const mounted = useRef(false);

  const options = {
    width: 500,
    height: 500,
    compressImageMaxWidth: 500,
    compressImageMaxHeight: 500,
    avoidEmptySpaceAroundImage: true,
    cropping: true,
    cropperCircleOverlay: true,
    mediaType: "photo",
  }

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const selectFileByCamera = async () => {
    await ImagePicker.openCamera(options).then(image => {
      if (mounted.current) {
        onSetImageSource(image);
        setShowModal(false);
      }
    })
      .catch(err => {
        console.log(err);
      })
      ;
  }

  const selectFile = async () => {
    await ImagePicker.openPicker(options).then(image => {
      if (mounted.current) {
        onSetImageSource(image);
        setShowModal(false);
      }
    })
      .catch(err => {
        console.log(err);
      })
      ;
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
      <Pressable onPressOut={() => onCloseModal()} style={[styles.centeredView, { justifyContent: 'flex-end', paddingHorizontal: 8 }]}>
        <View
          style={{
            borderRadius: 14,
            marginBottom: 8,
            backgroundColor: '#FFF'
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 16,
              width: windowWidth - 16,
              borderBottomWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.15)'
            }}
            onPress={() => selectFileByCamera()}
          >
            <DescriptionText
              text={t("Camera")}
              color='#8327D8'
              fontSize={20}
              lineHeight={24}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 16,
              width: windowWidth - 16,
            }}
            onPress={() => selectFile()}
          >
            <DescriptionText
              text={t("Gallery")}
              color='#8327D8'
              fontSize={20}
              lineHeight={24}
            />
          </TouchableOpacity>
        </View>
        <Pressable
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingVertical: 16,
            backgroundColor: '#FFF',
            width: windowWidth - 16,
            borderRadius: 14,
            marginBottom: 50
          }}
          onPress={() => closeModal()}
        >
          <SemiBoldText
            text={t("Cancel")}
            color='#8327D8'
            fontSize={20}
            lineHeight={24}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};
