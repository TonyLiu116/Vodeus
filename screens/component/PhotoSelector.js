import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  Modal,
  Pressable
} from 'react-native';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { MyButton } from './MyButton';

export const PhotoSelector = ({
  onSendPhoto = () => { },
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);
  const [photoResourcePath, setPhotoResourcePath] = useState({ assets: null });

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const selectFileByCamera = () => {
    var options = {
      mediaType: 'photo',
      cameraType: 'back',
      maxWidth: 200,
      maxHeight: 500,
    };

    launchCamera(options, res => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        let source = res;
        setPhotoResourcePath(source);
      }
    });
  }

  const selectFile = () => {
    var options = {
      title: 'Select Image',
      customButtons: [
        {
          name: 'customOptionKey',
          title: t("Choose file from Custom Option")
        },
      ],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 400,
    };

    launchImageLibrary(options, res => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        let source = res;
        setPhotoResourcePath(source);
      }
    });
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: t("App Camera Permission"),
          message: t("App needs access to your camera "),
          buttonNeutral: t("Ask Me Later"),
          buttonNegative: t("Cancel"),
          buttonPositive: t("OK")
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission given");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android')
      requestCameraPermission();
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
        <View style={[styles.swipeContainerContent, { alignItems: 'center' }]}>
          <View style={{
            width: 31,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#D4C9DE',
            marginTop: 8,
            marginBottom: 40
          }}>
          </View>
          <View style={styles.rowAlignItems}>
            <View
              style={{
                width: 150,
                height: 150,
                borderRadius: 24,
                backgroundColor: '#F2F0F5',
                borderWidth: 1,
                borderColor: '#F2F0F5',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => { setModalVisible(true); setErrorText(null) }}
            >
              {photoResourcePath.assets&&<Image source={{ uri: photoResourcePath.assets[0].uri }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderWidth: 1,
                  borderColor: '#F2F0F5',
                  borderRadius: 24,
                }}
              />}
            </View>
            <View style={{
              marginLeft: 50
            }}>
              <TouchableOpacity
                onPress={selectFileByCamera}
              >
                <Image
                  style={styles.cameraIcon}
                  source={require('../../assets/login/camera.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={selectFile}
                style={{
                  marginTop: 10
                }}
              >
                <Image
                  style={styles.cameraIcon}
                  source={require('../../assets/login/image.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 16,
              width: '100%',
              marginBottom: 30,
              marginTop: 30
            }}
          >
            <MyButton
              label={t("Send")}
              active={photoResourcePath.assets}
              onPress={() => onSendPhoto(photoResourcePath.assets[0])}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
