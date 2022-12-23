import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  Vibration,
  Image,
  Modal
} from 'react-native';
import * as Progress from "react-native-progress";
import { useSelector, useDispatch } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import { NavigationActions, StackActions } from 'react-navigation';
import EmojiPicker from 'rn-emoji-keyboard';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { SvgXml } from 'react-native-svg';
import { LinearTextGradient } from 'react-native-text-gradient';
import LinearGradient from 'react-native-linear-gradient';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import '../../language/i18n';
import { Avatars, POST_CHECK, Categories, Ambiances, windowWidth, windowHeight } from '../../config/config';
import { TitleText } from '../component/TitleText';
import { MyButton } from '../component/MyButton';
import { ShareVoice } from '../component/ShareVoice';
import { useTranslation } from 'react-i18next';
import { styles } from '../style/Common';
import { AllCategory } from '../component/AllCategory';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from "../Home/VoicePlayer";
import { setRefreshState, setVoiceState, setCreatedAt } from '../../store/actions';
import { MyProgressBar } from '../component/MyProgressBar';
import { DescriptionText } from '../component/DescriptionText';
import editImageSvg from '../../assets/record/editPurple.svg';
import targetSvg from '../../assets/record/target.svg';
import colorTargetSvg from '../../assets/record/color-target.svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import fakeSvg from '../../assets/post/fake.svg';
import privacySvg from '../../assets/post/privacy.svg';
import brightFakeSvg from '../../assets/post/bright-fake.svg';
import brightPrivacySvg from '../../assets/post/bright-privacy.svg';
import pauseSvg from '../../assets/record/pause.svg';
import playSvg from '../../assets/post/play.svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import { PickImage } from '../component/PickImage';
import { SelectLocation } from '../component/SelectLocation';

const PostingVoiceScreen = (props) => {

  const param = props.navigation.state.params;
  let displayDuration = param.recordSecs ? param.recordSecs : param.info.duration;

  let { user, refreshState, voiceState, socketInstance } = useSelector((state) => state.user);

  let initCategory = param.categoryId ? param.categoryId : 0;
  if (param.info) {
    for (let i = 0; i < Categories.length; i++) {
      if (Categories[i].label == param.info.category) {
        initCategory = i;
        break;
      }
    }
  }

  const { t, i18n } = useTranslation();

  const [category, setCategory] = useState(initCategory);
  const [visibleStatus, setVisibleStatus] = useState(user.isPrivate ? user.isPrivate : false);
  const [notSafe, setNotSafe] = useState(false);
  const [visibleReaction, setVisibleReaction] = useState(false);
  const [icon, setIcon] = useState(param.info ? param.info.emoji : "😁");
  const [voiceTitle, setVoiceTitle] = useState(param.info ? param.info.title.toUpperCase() : '');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareVoice, setShowShareVoice] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initCategory);
  const [isPlaying, setIsPlaying] = useState(false);
  const [postStep, setPostStep] = useState(0);
  const [warning, setWarning] = useState(false);
  const [recordImg, setRecordImg] = useState(param.photoInfo ? param.photoInfo : null);
  const [pickModal, setPickModal] = useState(false);
  const [storyAddress, setStoryAddress] = useState(param.info ? param.info.address : '');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const dirs = RNFetchBlob.fs.dirs;

  const path = Platform.select({
    ios: `${dirs.CacheDir}/hello.m4a`,
    android: `${dirs.CacheDir}/hello.mp3`,
  });

  const onNavigate = (des, par = null) => {
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: des, params: par })],
    });
    props.navigation.dispatch(resetActionTrue);
  }

  const selectIcon = (icon) => {
    setIcon(icon);
    setVisibleReaction(false);
  }

  const handleSubmit = async () => {
    if (path) {
      let voiceFile = [
        {
          name: 'file', filename: Platform.OS === 'android' ? `${param.title}.mp3` : `${param.title}.m4a`, data: RNFetchBlob.wrap(path)
        },
        { name: 'title', data: voiceTitle },
        { name: 'emoji', data: String(icon) },
        { name: 'duration', data: String(displayDuration) },
        { name: 'category', data: Categories[category].label },
        { name: 'privacy', data: String(visibleStatus) },
        { name: 'notSafe', data: String(notSafe) },
        { name: 'address', data: String(storyAddress) },
        { name: 'createdAt', data: String(param.createdAt) }
      ];
      setIsLoading(true);
      VoiceService.postVoice(voiceFile, param.isPast).then(async res => {
        const jsonRes = await res.json();
        // if (mounted.current) {
        if (res.respInfo.status !== 201) {
        } else {
          if (recordImg) {
            let formData = new FormData();
            formData.append('recordId', jsonRes.id);
            const imagePath = Platform.OS == 'android' ? recordImg.path : decodeURIComponent(recordImg.path.replace('file://', ''));
            const mimeType = recordImg.mime;
            const fileData = {
              uri: imagePath,
              type: mimeType,
              name: 'recordImage',
            }
            formData.append('file', fileData);
            VoiceService.postRecordImage(formData).then(res => {
              Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
              socketInstance.emit("newVoice", { uid: user.id });
              dispatch(setCreatedAt(param.createdAt));
              onNavigate("Home", { shareInfo: jsonRes })
            })
          }
          else {
            Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
            socketInstance.emit("newVoice", { uid: user.id });
            // dispatch(setCreatedAt(param.createdAt));
            // onNavigate("Home", { shareInfo: jsonRes })
          }
        }
        // }
      })
        .catch(err => {
          console.log(err);
        });
      props.navigation.navigate("Home");

    }
  }

  const changeStory = async () => {
    let formData = new FormData();
    formData.append('id', param.info.id);
    if (recordImg) {
      const imagePath = Platform.OS == 'android' ? recordImg.path : decodeURIComponent(recordImg.path.replace('file://', ''));
      const mimeType = recordImg.mime;
      const fileData = {
        uri: imagePath,
        type: mimeType,
        name: 'recordImage',
      }
      formData.append('file', fileData);
    }
    formData.append('category', Categories[category].label);
    formData.append('address', storyAddress);
    formData.append('title', voiceTitle);
    formData.append('privacy', visibleStatus);
    formData.append('notSafe', notSafe);
    setIsLoading(true);
    VoiceService.changeVoice(formData).then(async res => {
      if (mounted.current) {
        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
        let info = param.info;
        info.title = param.title.toUpperCase();
        info.emoji = icon;
        info.category = Categories[category].label;
        info.privacy = visibleStatus;
        onNavigate("VoiceProfile", { id: info.id });
        setIsLoading(false);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const onClickPost = async () => {
    Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    // if (category == 0) {
    //   setWarning(true);
    //   setPostStep(1);
    //   return;
    // }
    if (param.info)
      changeStory();
    else {
      handleSubmit();
    }
  }

  const onSetRecordImg = (img) => {
    if (mounted.current) {
      setRecordImg(img);
      setPickModal(false);
      setWarning(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    if (param.info)
      dispatch(setVoiceState(voiceState + 1));
    return () => {
      mounted.current = false;
    }
  }, [])
  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <View
        style={{
          width: windowWidth,
          flex: 1
        }}
      >
        <View style={{ marginTop: Platform.OS == 'ios' ? 50 : 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
          <Pressable style={{
            marginLeft: 16,
            position: 'absolute',
            left: 0
          }} onPress={() => postStep == 0 ? props.navigation.goBack() : setPostStep(0)}>
            <SvgXml width="24" height="24" xml={postStep == 0 ? closeBlackSvg : arrowBendUpLeft} />
          </Pressable>

          <MyProgressBar
            dag={2}
            progress={postStep}
          />
        </View>
        {postStep == 0 ? <View style={{
          flexDirection: 'column',
          justifyContent: 'space-around',
          flex: 1
        }}>
          <View style={{ alignItems: 'center' }}>
            <TextInput
              placeholder={t("Your title")}
              placeholderTextColor="#3B1F5290"
              color="#281E30"
              textAlign={'center'}
              autoFocus={true}
              value={voiceTitle}
              onChangeText={(s) => { s.length <= 25 ? setVoiceTitle(s) : null; setWarning(false) }}
              fontFamily="SFProDisplay-Regular"
              fontSize={34}
              lineHeight={41}
              marginTop={5}
              letterSpaceing={5}
              autoCapitalize="characters"
            />
          </View>
          <View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
              <TouchableOpacity
                style={{
                  paddingLeft: 12,
                  paddingRight: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderColor: visibleStatus ? '#CA83F6' : '#F2F0F5',
                  borderWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                onPress={() => {
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                  setVisibleStatus(!visibleStatus);
                }}
              >
                <SvgXml
                  xml={visibleStatus ? brightFakeSvg : fakeSvg}
                />
                <DescriptionText
                  text={t("Only for friends")}
                  fontSize={17}
                  marginLeft={8}
                  color={visibleStatus ? "#A24EE4" : "#000000"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{
                paddingLeft: 12,
                paddingRight: 16,
                paddingVertical: 6,
                borderRadius: 20,
                borderColor: notSafe ? '#CA83F6' : '#F2F0F5',
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center'
              }}
                onPress={() => {
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                  setNotSafe(!notSafe);
                }}
              >
                <SvgXml
                  xml={notSafe ? brightPrivacySvg : privacySvg}
                />
                <DescriptionText
                  text={t("NSFW content")}
                  fontSize={17}
                  marginLeft={8}
                  color={notSafe ? "#A24EE4" : "#000000"}
                />
              </TouchableOpacity>
            </View>
            <View style={{
              width: windowWidth,
              alignItems: 'center',
              marginTop: 19
            }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
                paddingLeft: 13,
                paddingRight: 16,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: storyAddress == '' ? '#F2F0F5' : '#8229F4',
                justifyContent: 'center',
                alignItems: 'center'
              }}
                onPress={() => setShowCityModal(true)}
              >
                <SvgXml
                  xml={storyAddress == '' ? targetSvg : colorTargetSvg}
                />
                <DescriptionText
                  text={storyAddress == '' ? t("Locate my story") : storyAddress}
                  fontSize={17}
                  lineHeight={20}
                  color={storyAddress == '' ? '#000000' : '#A24EE4'}
                  marginLeft={10}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            {isPlaying ? <VoicePlayer
              key={0}
              voiceUrl={param.info ? param.info.file.url : null}
              playBtn={false}
              replayBtn={false}
              waveColor={user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playing={true}
              stopPlay={() => setIsPlaying(false)}
              startPlay={() => { }}
              tinWidth={windowWidth / 170}
              mrg={windowWidth / 400}
              height={70}
              duration={displayDuration * 1000}
            /> : <VoicePlayer
              key={1}
              voiceUrl={param.info ? param.info.file.url : null}
              playBtn={false}
              replayBtn={false}
              waveColor={user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playing={false}
              stopPlay={() => { }}
              startPlay={() => { }}
              tinWidth={windowWidth / 170}
              mrg={windowWidth / 400}
              height={80}
              duration={displayDuration * 1000}
            />
            }
          </View>
          {/* {
            showEffect && <View style={{ marginTop: windowHeight / 812 * 29, paddingHorizontal: 16 }}>
              <Text style={{ fontWeight: "600", fontSize: 20, lineHeight: 24, color: "rgba(54, 18, 82, 0.8)", fontFamily: "SFProDisplay-Semibold" }}>{t("Add ambiance")}:</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
                {
                  Ambiances.map((item, index) => {
                    return (
                      <View
                        style={{
                          width: (windowWidth - 75) / 25 * 4,
                          marginRight: 16
                        }}
                        key={'all_ambiance' + index}
                      >
                        <View
                          style={{
                            height: (windowWidth - 75) / 25 * 4,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: (windowWidth - 75) / 25 * 4,
                            borderRadius: 16,
                            backgroundColor: selectedAmbiance === item.label ? '#B35CF8' : '#FFF',
                            shadowColor: 'rgba(42, 10, 111, 1)',
                            elevation: !(selectedAmbiance === item.label) ? 10 : 0,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4,
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              width: (windowWidth - 75) / 25 * 4,
                              alignItems: 'center',
                              padding: 1,
                              borderRadius: 16,
                            }}
                            onPress={() => {
                              if (selectedAmbiance !== item.label) {
                                setSelectedAmbiance(item.label);
                              } else {
                                setSelectedAmbiance('');
                              }
                            }}
                          >
                            <View style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: '#4C64FF',
                              backgroundColor: '#FFF',
                              padding: 15,
                              width: (windowWidth - 75) / 25 * 4 - 4,
                              height: (windowWidth - 75) / 25 * 4 - 4,
                              borderRadius: 14,
                            }}>
                              <Image source={item.uri}
                                style={{
                                  width: 32,
                                  height: 32
                                }}
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "SFProDisplay-Regular",
                            letterSpacing: 0.066,
                            color: selectedAmbiance === item.label ? '#A24EE4' : 'rgba(54, 36, 68, 0.8)',
                            textAlign: "center",
                            marginTop: 8
                          }}
                        >
                          {t(item.label)}
                        </Text>
                      </View>
                    )
                  })
                }
              </View>
            </View>
          } */}
          <View style={{
            flexDirection: 'row',
            width: windowWidth,
            paddingHorizontal: 8
          }}>
            <View style={{
              width: '100%',
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
            }}>
              <View style={{
                justifyContent: 'center',
                alignItems: "center",
                width: 68,
                height: 56,
                borderRadius: 32,
                backgroundColor: '#FFF',
                shadowColor: 'rgba(42, 10, 111, 1)',
                elevation: 10,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 57,
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying && <SvgXml
                    xml={pauseSvg}
                    height={24}
                  />}
                  {!isPlaying && <SvgXml
                    xml={playSvg}
                    height={24}
                  />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setPickModal(true);
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                }}
              >
                <LinearGradient
                  style={
                    {
                      height: 56,
                      width: 56,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row'
                    }
                  }
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  colors={['#D89DF4', '#B35CF8', '#8229F4']}
                >
                  <View style={{
                    width: 52,
                    height: 52,
                    backgroundColor: '#FFF',
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Image source={recordImg ? { uri: recordImg.path } : { uri: param.info.imgFile.url }} style={{ width: 52, height: 52, borderRadius: 18 }} />
                  </View>
                  <View style={{
                    width: 23,
                    height: 23,
                    position: "absolute",
                    backgroundColor: "#F8F0FF",
                    borderRadius: 18,
                    bottom: -2,
                    right: -3,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  >
                    <SvgXml width={10} height={10} xml={editImageSvg} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryModal(true);
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                }}
              >
                <LinearGradient
                  style={
                    {
                      height: 56,
                      width: 56,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row'
                    }
                  }
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  colors={['#D89DF4', '#B35CF8', '#8229F4']}
                >
                  <View style={{
                    width: 52,
                    height: 52,
                    backgroundColor: '#FFF',
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Image source={Categories[selectedCategory].uri} style={{ width: 32, height: 32 }} />
                  </View>
                  <View style={{
                    width: 23,
                    height: 23,
                    position: "absolute",
                    backgroundColor: "#F8F0FF",
                    borderRadius: 18,
                    bottom: -2,
                    right: -3,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  >
                    <SvgXml width={10} height={10} xml={editImageSvg} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (voiceTitle == '' || !recordImg) {
                    setWarning(true);
                  }
                  else {
                    onClickPost();
                    Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                  }
                }}
                disabled={isLoading}
              >
                <LinearGradient
                  style={
                    {
                      height: 56,
                      width: 100,
                      borderRadius: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row'
                    }
                  }
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  colors={['#D89DF4', '#B35CF8', '#8229F4']}
                >
                  {!isLoading ? <Text
                    style={
                      {
                        color: '#FFF',
                        fontFamily: "SFProDisplay-Semibold",
                        fontSize: 17
                      }
                    }
                  >
                    {t("Publish")}
                  </Text> :
                    <Progress.Circle
                      indeterminate
                      size={30}
                      color="rgba(255, 255, 255, .7)"
                      style={{ alignSelf: "center" }}
                    />
                  }
                  {/* <SvgXml
                    style={{
                      marginLeft: 2
                    }}
                    xml={rightArrowSvg}
                  /> */}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View> :
          <>
            <View
              style={{
                alignItems: 'center'
              }}
            >
              <TitleText
                text={t("Select category")}
                textAlign='center'
                maxWidth={280}
                marginTop={43}
              />
              <DescriptionText
                text={t("Select some categories for ...")}
                fontSize={15}
                lineHeight={24}
                textAlign='center'
                maxWidth={320}
                marginTop={8}
              />
            </View>
            <ScrollView style={{ marginTop: 13 }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 12,
              }}>
                {Categories.map((item, index) => {
                  if (index == 0)
                    return null;
                  return <TouchableOpacity
                    onPress={() => {
                      setWarning(false);
                      setCategory(index);
                      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                    }}
                    key={index + "topics"}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingLeft: 12,
                      paddingRight: 16,
                      paddingVertical: 6,
                      marginHorizontal: 4,
                      marginVertical: 4,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#F2F0F5',
                      backgroundColor: index == category ? "#F44685" : '#FFF',
                    }}>
                    <Image
                      source={item.uri}
                      style={{
                        width: 24,
                        height: 24
                      }}
                    />
                    <DescriptionText
                      text={item.label}
                      fontSize={17}
                      lineHeight={28}
                      marginLeft={9}
                      color={index == category ? "#FFF" : "#281E30"}
                    />
                  </TouchableOpacity>
                })}
              </View>
              <View style={{ height: 70, width: 70 }}>
              </View>
            </ScrollView>
            <View
              style={{
                paddingHorizontal: 16,
                width: '100%',
                bottom: 20
              }}
            >
              <MyButton
                label={t("Publish story")}
                loading={isLoading}
                onPress={() => onClickPost()}
              />
            </View>
          </>
        }
        {warning && <View style={{
          position: 'absolute',
          top: 40,
          width: windowWidth,
          alignItems: 'center'
        }}>
          <View style={{
            paddingHorizontal: 33,
            paddingVertical: 10,
            backgroundColor: '#E41717',
            borderRadius: 16,
            shadowColor: 'rgba(244, 13, 13, 0.47)',
            elevation: 10,
            shadowOffset: { width: 0, height: 5.22 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
          }}>
            <DescriptionText
              text={voiceTitle == "" ? t("Add a title to your story!") : recordImg == null ? t("Add a picture to illustrate your story!") : t("You must select a category.")}
              fontSize={15}
              lineHeight={18}
              color='#FFF'
            />
          </View>
        </View>}
        {showCityModal && <SelectLocation
          selectLocation={(cty) => {
            setStoryAddress(cty);
            setShowCityModal(false);
          }}
          onCloseModal={() => {
            setShowCityModal(false);
          }} />
        }
        {visibleReaction &&
          <EmojiPicker
            onEmojiSelected={(icon) => selectIcon(icon.emoji)}
            open={visibleReaction}
            onClose={() => setVisibleReaction(false)} />
        }
        {showShareVoice &&
          <ShareVoice
            info={showShareVoice}
            onCloseModal={() => { setShowShareVoice(false); onNavigate("Home"); }}
          />}
        {pickModal &&
          <PickImage
            onCloseModal={() => setPickModal(false)}
            onSetImageSource={(img) => onSetRecordImg(img)}
          />
        }
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCategoryModal}
          onRequestClose={() => {
            setShowCategoryModal(false);
          }}
        >
          <Pressable style={styles.swipeModal}>
            <AllCategory
              closeModal={() => setShowCategoryModal(false)}
              selectedCategory={selectedCategory}
              setCategory={(id) => {
                setSelectedCategory(id);
                setShowCategoryModal(false);
              }}
            />
          </Pressable>
        </Modal>
      </View>
      {Platform.OS == 'ios' && <KeyboardSpacer />}
    </KeyboardAvoidingView>
  );
};

export default PostingVoiceScreen;