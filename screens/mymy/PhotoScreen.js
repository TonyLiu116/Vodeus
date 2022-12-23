import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  Text,
  TouchableOpacity,
  Image,
  PermissionsAndroid
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { MyProgressBar } from '../component/MyProgressBar';
import RNFetchBlob from 'rn-fetch-blob';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/actions';
import { styles } from '../style/Login';
import AuthService from '../../services/AuthService';

const PhotoScreen = (props) => {

  let imageUrl = '', backPage = '';
  if (props.navigation.state.params) {
    imageUrl = props.navigation.state.params.imageUrl;
    backPage = props.navigation.state.params.backPage;
  }
  const [modalVisible, setModalVisible] = useState(false);
  const [photoResourcePath, setPhotoResourcePath] = useState({ assets: null });
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);

  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();

  const selectFileByCamera = () => {
    setModalVisible(false);
    var options = {
      mediaType: 'photo',
      cameraType: 'back',
      maxWidth: 500,
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

  const selectFile = () => {
    setModalVisible(false);
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
      maxWidth: 500,
      maxHeight: 500,
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

  const handleSubmit = async () => {
    const fileUri = Platform.OS == 'android' ? photoResourcePath.assets[0].uri : decodeURIComponent(photoResourcePath.assets[0].uri.replace('file://', ''));
    let filewrap = [{
      name: 'file', filename: photoResourcePath.assets[0].fileName, data: RNFetchBlob.wrap(fileUri)
    }];
    setLoading(true);
    AuthService.uploadPhoto(filewrap)
      .then(async res => {
        try {
          const jsonRes = await res.json();
          setLoading(false);
          if (res.respInfo.status !== 201) {
            setErrorText(jsonRes.message + ' :upload Photo');
          } else {
            AuthService.getUserInfo().then(async res => {
              const jsonRes = await res.json();
              if (res.respInfo.status == 200) {
                dispatch(setUser(jsonRes));
                props.navigation.navigate(backPage == '' ? "Tutorial" : backPage, { info: jsonRes });
              }
              else {
                setErrorText(jsonRes.message);
              }
            })
              .catch(err => {
                console.log(err);
              });
          }
        } catch (err) {
          console.log(err);
        };
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  }

  useEffect(() => {
    if (Platform.OS === 'android')
      requestCameraPermission();
  }, [])

  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      {errorText &&
        <TitleText
          color='#F00'
          text={errorText}
        />
      }
      <View
        style={[
          { marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 20, marginBottom: 20, height: 30 },
          styles.rowSpaceBetween
        ]}
      >
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
        >
          <SvgXml
            width="24"
            height="24"
            xml={arrowBendUpLeft}
          />
        </TouchableOpacity>
        {imageUrl == '' && <MyProgressBar
          progress={5}
        />}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!photoResourcePath.assets}
        >
          <Text
            style={{
              textAlign: 'center',
              color: photoResourcePath.assets ? '#8327D8' : '#CC9BF9',
              fontSize: 15,
            }}>{imageUrl == '' ? t('Next') : t('Save')}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ marginTop: 20, paddingHorizontal: 20 }}
      >
        <TitleText
          text={t("Upload a photo")}
          fontSize={22}
          textAlign="center"
        />
      </View>
      <View style={[{ marginHorizontal: 16, marginTop: 45 }, styles.rowJustifyCenter]}>
        <Pressable
          style={{
            width: 114,
            height: 114,
            borderRadius: 24,
            backgroundColor: '#F2F0F5',
            borderWidth: 1,
            borderColor: '#F2F0F5',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => { setModalVisible(true); setErrorText(null) }}
        >
          <Image source={{ uri: photoResourcePath.assets ? photoResourcePath.assets[0].uri : imageUrl != '' ? imageUrl : '' }}
            style={{
              width: '100%',
              height: '100%',
              borderWidth: 1,
              borderColor: '#F2F0F5',
              borderRadius: 24,
            }}
          />
        </Pressable>
      </View>
      <DescriptionText
        text={imageUrl == '' ? t("Tap to add a photo") : t("Tap to upload a photo")}
        fontSize={13}
        textAlign='center'
        marginTop={10}
      />
      <View
        style={{
          paddingHorizontal: 16,
          position: 'absolute',
          width: '100%',
          bottom: 30
        }}
      >
        <MyButton
          label={imageUrl == '' ? t("Next") : t("Save")}
          loading={loading}
          active={photoResourcePath.assets}
          onPress={handleSubmit}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          //  Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable onPressOut={() => setModalVisible(false)} style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={[styles.rowSpaceEvenly, { width: "100%" }]}
            >
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
              >
                <Image
                  style={styles.cameraIcon}
                  source={require('../../assets/login/image.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default PhotoScreen;