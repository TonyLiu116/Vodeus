import React, { useEffect, useRef, useState } from 'react';
import {
  Image, ImageBackground, Modal, Platform, Pressable, ScrollView, TouchableOpacity, View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import CameraRoll from "@react-native-community/cameraroll";
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native-gesture-handler';
import ImageResizer from 'react-native-image-resizer';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import { NavigationActions, StackActions } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import cameraSvg from '../../assets/discover/camera.svg';
import blackCameraSvg from '../../assets/post/blackCamera.svg';
import closeSvg from '../../assets/post/black_close.svg';
import brightFakeSvg from '../../assets/post/bright-fake.svg';
import brightPrivacySvg from '../../assets/post/bright-privacy.svg';
import editSvg from '../../assets/post/edit.svg';
import edit_pencilSvg from '../../assets/post/edit_pencil.svg';
import fakeSvg from '../../assets/post/fake.svg';
import closeCircleSvg from '../../assets/post/gray-close.svg';
import privacySvg from '../../assets/post/privacy.svg';
import voiceSvg from '../../assets/post/voice.svg';
import photoSvg from '../../assets/record/photo.svg';
import { Categories, windowWidth } from '../../config/config';
import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import { styles } from '../style/Common';
import { CategoryIcon } from './CategoryIcon';
import { DescriptionText } from './DescriptionText';
import { MyButton } from './MyButton';
import { PickImage } from './PickImage';
import { SemiBoldText } from './SemiBoldText';
import { TitleText } from './TitleText';

export const DailyPopUp = ({
  props,
  createdAt = '',
  isPast = false,
  onCloseModal = () => { }
}) => {

  const param = props.navigation.state.params;
  const isFirst = param?.isFirst;

  console.log(isFirst);

  const { t, i18n } = useTranslation();
  let { user, refreshState } = useSelector(state => state.user);

  const onNavigate = (des, par = null) => {
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: des, params: par })],
    });
    props.navigation.dispatch(resetActionTrue);
  }

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const scrollRef = useRef();

  const [showModal, setShowModal] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(-2);
  const [photoInfo, setPhotoInfo] = useState(null);
  const [cameraPath, setCameraPath] = useState(null);
  const [pickModal, setPickModal] = useState(false);
  const [warning, setWarning] = useState(false);
  const [state, setState] = useState(isFirst ? 'writtenReady' : 'select');
  const [postText, setPostText] = useState('');
  const [notSafe, setNotSafe] = useState(false);
  const [visibleStatus, setVisibleStatus] = useState(false);
  const [categoryId, setCategoryId] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const imgLength = (windowWidth - 56) / 3;

  const closeModal = async (v = false) => {
    setShowModal(false);
    onCloseModal();
  }

  const onSetRecordImg = async (img) => {
    setPhotoInfo(img);
    setPhotoIndex(-1);
    setCameraPath(img.path);
    setWarning(false);
    setPickModal(false);
  }

  const handleSubmit = () => {
    setLoading(true);
    const imagePath = Platform.OS == 'android' ? photoInfo.path : decodeURIComponent(photoInfo.path.replace('file://', ''));
    let formData = [
      {
        name: 'file', filename: 'recordImage', data: RNFetchBlob.wrap(imagePath)
      },
      { name: 'recordText', data: postText },
      { name: 'category', data: Categories[categoryId].label },
      { name: 'privacy', data: String(visibleStatus) },
      { name: 'notSafe', data: String(notSafe) },
    ];
    VoiceService.postText(formData).then(async res => {
      const jsonRes = await res.json();
      setLoading(false);
      if (res.respInfo.status === 201) {
        onNavigate('Home');
      } else {
      }
      closeModal();
    })
      .catch(err => {
        console.log(err);
      });
  }

  useEffect(() => {
    mounted.current = true;
    CameraRoll.getPhotos({
      first: 50,
      assetType: 'Photos',
    })
      .then(res => {
        if (mounted.current)
          setPhotos(res.edges.slice(0, 4));
      })
      .catch((err) => {
        console.log(err);
      });
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
      <Pressable style={styles.swipeModal} onPressOut={closeModal}>
        {state == 'select' && <View style={{ height: '100%', width: '100%' }}>
          <Pressable onPress={() => setState('vocal')} style={{ position: 'absolute', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: windowWidth - 16, bottom: 176, marginHorizontal: 8, height: 56, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <DescriptionText
              text={t("Vocal post")}
              fontSize={20}
              lineHeight={24}
              color='#631BA5'
              textAlign='center'
              marginRight={12}
            />
            <SvgXml
              xml={voiceSvg}
              width={26}
              height={26}
            />
          </Pressable>
          <Pressable onPress={() => setState('writtenReady')} style={{ position: 'absolute', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: windowWidth - 16, bottom: 112, marginHorizontal: 8, height: 56, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <DescriptionText
              text={t("Written post")}
              fontSize={20}
              lineHeight={24}
              color='#631BA5'
              textAlign='center'
              marginRight={12}
            />
            <SvgXml
              xml={editSvg}
              width={24}
              height={24}
            />
          </Pressable>
          <Pressable onPress={closeModal} style={{ position: 'absolute', width: windowWidth - 16, bottom: 48, marginHorizontal: 8, height: 56, borderRadius: 14, backgroundColor: 'white' }}>
            <SemiBoldText
              text={t('Cancel')}
              fontSize={20}
              lineHeight={24}
              color='#E41717'
              textAlign='center'
              marginTop={16}
            />
          </Pressable>
        </View>}
        {state == 'vocal' && <Pressable style={{
          position: 'absolute',
          backgroundColor: '#FFF',
          bottom: 0,
          width: windowWidth,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          alignItems: 'center'
        }}>
          {warning && <View style={{
            position: 'absolute',
            top: -20,
            width: windowWidth,
            alignItems: 'center',
          }}>
            <View style={{
              paddingHorizontal: 33,
              paddingVertical: 10,
              backgroundColor: selectedCategory == -1 ? '#E41717' : '#430979',
              borderRadius: 16,
              shadowColor: 'rgba(244, 13, 13, 0.47)',
              elevation: 10,
              shadowOffset: { width: 0, height: 5.22 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              {selectedCategory != -1 &&
                <SvgXml
                  style={{
                    marginLeft: -20,
                    marginRight: 11
                  }}
                  xml={cameraSvg}
                />
              }
              <DescriptionText
                text={selectedCategory == -1 ? t("You must select a category") : t("You must add a picture")}
                fontSize={15}
                lineHeight={18}
                color='#FFF'
              />
            </View>
          </View>}
          <TouchableOpacity style={{
            width: windowWidth,
            alignItems: 'flex-end',
            marginTop: 7,
            paddingRight: 12
          }}
            onPress={closeModal}
          >
            <SvgXml
              xml={closeCircleSvg}
            />
          </TouchableOpacity>
          <TitleText
            text={t("Share a great moment with them, ") + user.name + '!'}
            color='#361252'
            maxWidth={315}
            fontSize={25.7}
            lineHeight={30}
            textAlign='center'
          />
          <ScrollView
            style={{
              maxHeight: 260
            }}
          >
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignContent: 'center',
                width: windowWidth,
                paddingHorizontal: 4,
              }}
            >
              <TouchableOpacity style={{
                height: imgLength,
                width: imgLength,
                borderRadius: 16,
                marginTop: 16,
                marginHorizontal: 8,
              }}
                onPress={() => setPickModal(true)}
              >
                <ImageBackground
                  source={cameraPath ? { uri: cameraPath } : require("../../assets/discover/road.png")}
                  style={{
                    width: imgLength,
                    height: imgLength,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFF'
                  }}
                  imageStyle={{
                    borderRadius: 16,
                    borderWidth: photoIndex == -1 ? 1 : 0,
                    borderColor: '#A24EE4',
                  }}
                >
                  <SvgXml
                    xml={photoSvg}
                  />
                </ImageBackground>
              </TouchableOpacity>
              {photos.map((item, index) => {
                return <TouchableOpacity
                  key={index.toString() + "gallery"}
                  onPress={async () => {
                    await ImageResizer.createResizedImage(item.node.image.uri, 1000, 1000, 'JPEG', 100, 0).then(res => {
                      setPhotoInfo({ path: res.uri, mime: item.node.type });
                      setPhotoIndex(index);
                      setWarning(false);
                    })
                    //setPhotoInfo({ path: item.node.image.uri, mime: item.node.type });
                  }}
                  style={{ position: "relative" }}
                >
                  <Image
                    source={{ uri: item.node.image.uri }}
                    style={{
                      width: imgLength,
                      height: imgLength,
                      borderRadius: 16,
                      marginHorizontal: 8,
                      marginTop: 16,
                      borderWidth: index == photoIndex ? 3 : 0,
                      borderColor: '#A24EE4'
                    }}
                  />
                  {index == photoIndex && <View style={{ position: "absolute", width: 22, height: 22, backgroundColor: "white", borderRadius: 11, top: 26, right: 18, elevation: 3 }}></View>}
                </TouchableOpacity>
              })}
            </View>
            {/* <View style={{
              windowWidth: 100,
              height: 160
            }}>
            </View> */}
          </ScrollView>
          <View
            style={{
              width: windowWidth,
              paddingHorizontal: 18,
              marginTop: 38,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <DescriptionText
              text={t("Select a category")}
              color='#361252'
              fontSize={20}
              lineHeight={28}
              marginBottom={12}
            />
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            width: windowWidth
          }}>
            {Categories.map((item, index) => {
              return <CategoryIcon
                key={'all_catagory' + index.toString()}
                label={Categories[index].label}
                source={Categories[index].uri}
                onPress={() => {
                  setSelectedCategory(index);
                  setWarning(false);
                  scrollRef.current?.scrollToIndex({ animated: true, index: index });
                }}
                active={selectedCategory == index ? true : false}
              />
            })}
          </View>
          <View
            style={{
              paddingHorizontal: 16,
              width: '100%',
              paddingBottom: 10,
              marginTop: 15
            }}
          >
            <MyButton
              label={t("Next")}
              marginTop={0}
              onPress={() => {
                if (selectedCategory == -1 || photoInfo == null)
                  setWarning(true);
                else {
                  props.navigation.navigate("HoldRecord", { photoInfo, categoryId: selectedCategory, createdAt: createdAt, isPast: isPast });
                  closeModal();
                }
              }}
            />
            <TouchableOpacity
              style={{
                height: 60,
                width: windowWidth - 32,
                marginTop: 12,
                borderRadius: 16,
                backgroundColor: '#FFF',
                shadowColor: 'rgba(88, 74, 117, 1)',
                elevation: 10,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={closeModal}
            >
              <TitleText
                text={t("Cancel")}
                fontSize={17}
                lineHeight={28}
                color="#8327D8"
              />
            </TouchableOpacity>
          </View>
        </Pressable>}
        {state == 'writtenReady' && <Pressable style={{
          position: 'absolute',
          backgroundColor: '#FFF',
          bottom: 0,
          width: windowWidth,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          alignItems: 'center'
        }}>
          {warning && <View style={{
            position: 'absolute',
            top: -20,
            width: windowWidth,
            alignItems: 'center',
          }}>
            <View style={{
              paddingHorizontal: 33,
              paddingVertical: 10,
              backgroundColor: selectedCategory == -1 ? '#E41717' : '#430979',
              borderRadius: 16,
              shadowColor: 'rgba(244, 13, 13, 0.47)',
              elevation: 10,
              shadowOffset: { width: 0, height: 5.22 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              {selectedCategory != -1 &&
                <SvgXml
                  style={{
                    marginLeft: -20,
                    marginRight: 11
                  }}
                  xml={cameraSvg}
                />
              }
              <DescriptionText
                text={selectedCategory == -1 ? t("You must select a category") : t("You must add a picture")}
                fontSize={15}
                lineHeight={18}
                color='#FFF'
              />
            </View>
          </View>}
          <SemiBoldText
            text={t("New publication")}
            color='#EBA4F3'
            fontSize={19}
            lineHeight={24}
            textAlign='center'
            marginTop={25}
          />
          <View style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 15,
            marginBottom: 15
          }}>
            <View style={{
              borderWidth: 2,
              borderColor: photoInfo ? '#A24EE4' : 'rgba(255, 255, 255, 0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: 40,
              width: 240,
              height: 240
            }}>
              {photoInfo ? <Image
                source={{ uri: photoInfo?.path }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 40
                }}
              /> :
                <TouchableOpacity style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                  onPress={() => setPickModal(true)}
                >
                  <DescriptionText
                    text={t("Add a picture")}
                    fontSize={17}
                    lineHeight={28}
                    color='#000'
                    marginBottom={30}
                  />
                  <SvgXml
                    xml={blackCameraSvg}
                    width={24}
                    height={24}
                  />
                </TouchableOpacity>
              }
            </View>
          </View>
          <ScrollView
            style={{
              maxHeight: 260
            }}
          >
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignContent: 'center',
                width: windowWidth,
                paddingHorizontal: 4,
              }}
            >
              <TouchableOpacity style={{
                height: imgLength,
                width: imgLength,
                borderRadius: 16,
                marginTop: 16,
                marginHorizontal: 8,
              }}
                onPress={() => setPickModal(true)}
              >
                <ImageBackground
                  source={cameraPath ? { uri: cameraPath } : require("../../assets/discover/road.png")}
                  style={{
                    width: imgLength,
                    height: imgLength,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFF'
                  }}
                  imageStyle={{
                    borderRadius: 16,
                    borderWidth: photoIndex == -1 ? 1 : 0,
                    borderColor: '#A24EE4',
                  }}
                >
                  <SvgXml
                    xml={photoSvg}
                  />
                </ImageBackground>
              </TouchableOpacity>
              {photos.map((item, index) => {
                return <TouchableOpacity
                  key={index.toString() + "gallery"}
                  onPress={async () => {
                    await ImageResizer.createResizedImage(item.node.image.uri, 1000, 1000, 'JPEG', 100, 0).then(res => {
                      setPhotoInfo({ path: res.uri, mime: item.node.type });
                      setPhotoIndex(index);
                      setWarning(false);
                    })
                    //setPhotoInfo({ path: item.node.image.uri, mime: item.node.type });
                  }}
                  style={{ position: "relative" }}
                >
                  <Image
                    source={{ uri: item.node.image.uri }}
                    style={{
                      width: imgLength,
                      height: imgLength,
                      borderRadius: 16,
                      marginHorizontal: 8,
                      marginTop: 16,
                      borderWidth: index == photoIndex ? 3 : 0,
                      borderColor: '#A24EE4'
                    }}
                  />
                  {index == photoIndex && <View style={{ position: "absolute", width: 22, height: 22, backgroundColor: "white", borderRadius: 11, top: 26, right: 18, elevation: 3 }}></View>}
                </TouchableOpacity>
              })}
            </View>
            {/* <View style={{
              windowWidth: 100,
              height: 160
            }}>
            </View> */}
          </ScrollView>
          <View
            style={{
              alignItems: 'center',
              width: '100%',
              paddingBottom: 20,
              paddingTop: 20
            }}
          >
            <MyButton
              label={t("Next")}
              marginTop={0}
              width={windowWidth - 90}
              height={50}
              onPress={() => {
                if (photoInfo == null)
                  setWarning(true);
                else {
                  setState("writtenPublish")
                }
              }}
            />
          </View>
        </Pressable>}
        {state == 'writtenPublish' && <Pressable style={{
          position: 'absolute',
          backgroundColor: '#FFF',
          bottom: 0,
          width: windowWidth,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}>
          {loading &&
            <View style={{
              position: 'absolute',
              width: '100%',
              alignItems: 'center',
              top: 120,
              elevation: 20
            }}>
              <Progress.Circle
                indeterminate
                size={30}
                color="rgba(0, 0, 255, .7)"
                style={{ alignSelf: "center" }}
              />
            </View>
          }
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginTop: 10
          }}>
            <TouchableOpacity onPress={() => setState('writtenReady')}>
              <SvgXml
                xml={closeSvg}
                width={18}
                height={18}
              />
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={handleSubmit}>
              <SemiBoldText
                text={t("Publish")}
                color='#0B5CD7'
                fontSize={17}
                lineHeight={22}
              />
            </TouchableOpacity>
          </View>
          <View style={{
            flex: 1,
            alignItems: 'center',
            marginTop: 12,
            marginBottom: 22
          }}>
            <View style={{
              width: 48,
              height: 5,
              backgroundColor: '#E5E6EB',
              borderRadius: 10
            }}></View>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}>
            <ImageBackground
              source={{ uri: photoInfo.path }}
              resizeMode="cover"
              style={{ width: 88, height: 88, justifyContent: 'flex-end', alignItems: 'flex-end' }}
              imageStyle={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#A24EE4'
              }}
            >
              <TouchableOpacity style={{
                width: 20,
                height: 20,
                borderRadius: 15,
                backgroundColor: '#F8F0FF',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 6,
                marginBottom: 6
              }}
                onPress={() => setPickModal(true)}
              >
                <SvgXml
                  xml={edit_pencilSvg}
                  width={15}
                  height={15}
                />
              </TouchableOpacity>
            </ImageBackground>
            <TextInput
              style={
                {
                  fontSize: 17,
                  color: '#4B164C',
                  width: 233,
                  height: 122
                }
              }
              multiline={true}
              textAlignVertical='top'
              numberOfLines={5}
              maxWidth={233}
              maxLength={150}
              value={postText}
              onChangeText={(e) => {
                let lines = e.split("\n");
                if (lines.length < 7)
                  setPostText(e);
              }}
              placeholder={t("Write something...")}
              placeholderTextColor="#D2D2D2"
            />
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: 20
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
                color={visibleStatus ? "#A24EE4" : "#361252"}
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
                color={notSafe ? "#A24EE4" : "#361252"}
              />
            </TouchableOpacity>
          </View>
          <DescriptionText
            text={t("Category")}
            fontSize={17}
            color='#D5D5D5'
            marginLeft={18}
            marginTop={30}
            marginBottom={15}
          />
          <ScrollView
            style={{
              maxHeight: 50,
              marginBottom: 20
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12
            }}>
              {Categories.map((item, index) => {
                if (item.label == '') return null;
                return <TouchableOpacity style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: categoryId == index ? '#8229F4' : '#D4C9DE',
                  flexDirection: 'row',
                  marginHorizontal: 4
                }}
                  onPress={() => setCategoryId(index)}
                  key={index.toString() + 'category'}
                >
                  <Image source={item.uri}
                    style={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <DescriptionText
                    text={item.label == '' ? t('All') : item.label == 'Support' ? t("Support/Help") : t(item.label)}
                    fontSize={14}
                    lineHeight={20}
                    marginLeft={10}
                  />
                </TouchableOpacity>
              })}
            </View>
          </ScrollView>
        </Pressable>}
        {pickModal &&
          <PickImage
            onCloseModal={() => setPickModal(false)}
            onSetImageSource={(img) => onSetRecordImg(img)}
          />
        }
      </Pressable>
      {Platform.OS == 'ios' && <KeyboardSpacer />}
    </Modal>
  );
};
