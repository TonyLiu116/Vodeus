import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import KeyboardSpacer from 'react-native-keyboard-spacer'

import '../../language/i18n';
import { POST_CHECK, Categories, windowWidth, windowHeight } from '../../config/config';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { SemiBoldText } from '../component/SemiBoldText';
import { styles } from '../style/Login';

import closeSvg from '../../assets/record/closePurple.svg';
import uploadSvg from '../../assets/record/upload.svg';
import nextSvg from '../../assets/record/next.svg';
import editImageSvg from '../../assets/record/editPurple.svg';
import globalSvg from '../../assets/record/global.svg';
import { PickImage } from '../component/PickImage';
import { SelectLocation } from '../component/SelectLocation';

const RecordPrepareScreen = (props) => {
  let initId = Math.max(Math.ceil(Math.random() * 11), 1);
  const { t, i18n } = useTranslation();

  const mounted = useRef(false);
  const [voiceTitle, setVoiceTitle] = useState('');
  const [warning, setWarning] = useState(false);
  const [pickModal, setPickModal] = useState(false);
  const [source, setSource] = useState(null);
  const [avatarId, setAvatarId] = useState(initId);
  const [storyAddress, setStoryAddress] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [])

  const onClickNext = () => {
    if (voiceTitle.length === 0) {
      setWarning(true);
    } else {
      props.navigation.navigate('RecordBoard', { title: voiceTitle, source: source, address: storyAddress });
    }
  }

  const onSetSource = (img) => {
    if (mounted.current) {
      setSource(img);
      setAvatarId(0);
      setPickModal(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <Pressable style={{ width: windowWidth, flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF' }} onPress={() => Keyboard.dismiss()}>
        <View>
          <View>
            <TouchableOpacity style={{ marginTop: Platform.OS == 'ios' ? 50 : 20, marginLeft: 21 }} onPress={() => props.navigation.goBack()}>
              <SvgXml width={14} height={14} xml={closeSvg} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <TextInput
              placeholder={t("Your title")}
              placeholderTextColor="#3612521E"
              color="#361252"
              textAlign={'center'}
              autoFocus={true}
              value={voiceTitle}
              onChangeText={(s) => { s.length <= 25 ? setVoiceTitle(s) : null; setWarning(false) }}
              fontFamily="SFProDisplay-Regular"
              fontSize={34}
              lineHeight={41}
              marginTop={5}
              letterSpaceing={5}
            />
          </View>
          {warning === true ? <View style={{ width: "100%", alignItems: "center", marginTop: 21 }}>
            <View style={{
              backgroundColor: "#E41717",
              // backgroundColor: "#FFF",
              borderRadius: 16,
              paddingHorizontal: 34,
              paddingVertical: 10,
              shadowColor: 'rgba(244, 13, 13, 1)',
              elevation: 10,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 8
            }}>
              <Text style={{ color: "white", fontWeight: "500", fontSize: 15, lineHeight: 18, fontFamily: "SFProDisplay-Medium" }}>{t("Add a title to your story!")}</Text>
            </View>
          </View> : <View></View>}
        </View>
        <View style={{ width: "100%", alignItems: "center", marginTop: 0 }}>
          {source ? <View style={{
            position: "relative"
          }}>
            <Image source={{ uri: source.path }} style={{
              width: windowWidth / 375 * 234,
              height: windowWidth / 375 * 234,
              borderRadius: 16
            }} />
            <TouchableOpacity style={{
              width: 34,
              height: 34,
              position: "absolute",
              backgroundColor: "#F8F0FF",
              borderRadius: 18,
              bottom: 10,
              right: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}
              onPress={() => setPickModal(true)}
            >
              <SvgXml width={11} height={14} xml={editImageSvg} />
            </TouchableOpacity>
          </View> :
            <View style={{
              width: windowWidth / 375 * 234,
              height: windowWidth / 375 * 234,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <TouchableOpacity onPress={() => setPickModal(true)}>
                <SvgXml width={93} height={93} xml={uploadSvg} />
              </TouchableOpacity>
              <Text style={{ marginTop: windowHeight / 812 * 24, fontFamily: "SFProDisplay-Regular", fontSize: 12, lineHeight: 28, color: "#361252" }}>{t("Add a picture to illustrate your story!")}</Text>
            </View>
          }
        </View>
        <View style={{
        }}>
          <View style={{ marginLeft: 35, marginTop: 0, flexDirection: "row", alignItems: 'center' }}>
            <Text style={{ fontWeight: "400", fontSize: 17, lineHeight: 28, color: "#361252", fontFamily: "SFProDisplay-Regular" }}>Where did it happen? </Text>
            <Text style={{ fontWeight: "400", fontSize: 17, lineHeight: 28, color: "#36125232", fontFamily: "SFProDisplay-Regular" }}>({t('optionnal')})</Text>
          </View>
          <View style={{ paddingHorizontal: 27, marginTop: 11 }}>
            <Pressable style={{
              width: "100%",
              flexDirection: "row",
              borderRadius: 24,
              paddingVertical: 8,
              paddingHorizontal: 13,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgb(0, 0, 0)",
              backgroundColor: "rgba(242, 240, 245, 1)"
            }}
              onPress={() => setShowCityModal(true)}
            >
              <SvgXml width={15} height={15} xml={globalSvg} />
              <View style={{ width: "100%", height: 15, marginLeft: 16, borderLeftWidth: storyAddress ? 0 : 1, borderLeftColor: "rgb(0, 0, 0)" }}>
                {storyAddress ? <Text style={{ fontWeight: "400", fontSize: 17, lineHeight: 17, marginLeft: 2 }}>{storyAddress}</Text> : <Text style={{ fontWeight: "400", fontSize: 17, lineHeight: 17, marginLeft: 2 }}>{t('Search')}...</Text>}
              </View>
            </Pressable>
          </View>
        </View>
        <View style={{ width: "100%", alignItems: "center" }}>
          <TouchableOpacity onPress={() => onClickNext()}>
            <LinearGradient
              style={
                {
                  borderRadius: 30,
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingLeft: 29,
                  paddingRight: 22,
                  paddingVertical: 12
                }
              }
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              colors={['#D89DF4', '#B35CF8', '#8229F4']}
            >
              <Text style={{
                fontWeight: "500",
                fontSize: 17,
                lineHeight: 28,
                color: "white",
                marginRight: 8
              }}>{t('Next step')}</Text>
              <SvgXml width={32} height={32} xml={nextSvg} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View></View>
        {pickModal && <PickImage
          onSetImageSource={(img) => onSetSource(img)}
          onCloseModal={() => setPickModal(false)}
        />}
        {showCityModal && <SelectLocation
          selectLocation={(cty) => {
            setStoryAddress(cty);
            setShowCityModal(false);
          }}
          onCloseModal={() => setShowCityModal(false)}
        />
        }
        {/* <Modal
          animationType='slide'
          visible={showCityModal}
          onRequestClose={() => setShowCityModal(!showCityModal)}
        >
          <Pressable onPress={() => setShowCityModal(false)} style={[styles.centeredView, { justifyContent: 'flex-start', paddingHorizontal: 8 }]}>
            <View style={{ width: windowWidth, height: windowHeight, paddingTop: 50, backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
              <GooglePlacesAutocomplete
                placeholder='Search'
                onPress={(data, details = null) => {
                  // 'details' is provided when fetchDetails = true
                  setStoryAddress(data);
                  setShowCityModal(false);
                }}
                pl
                query={{
                  key: 'AIzaSyBLImCd0n7ztnIyLHwkMbZC9APGTDEqgX4',
                  language: 'en'
                }}
              />
            </View>
          </Pressable>
        </Modal> */}
      </Pressable>
      {Platform.OS == 'ios' && <KeyboardSpacer />}
    </KeyboardAvoidingView>
  )
}

export default RecordPrepareScreen;