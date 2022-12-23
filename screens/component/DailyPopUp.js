import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform,
  FlatList,
  ScrollView,
  ImageBackground
} from 'react-native';
import { useSelector } from 'react-redux';

import { SvgXml } from 'react-native-svg';
import ShareIconsSvg from '../../assets/post/ShareIcons.svg';
import ShareHintSvg from '../../assets/post/ShareHint.svg';
import shareSvg from '../../assets/post/share.svg';
import cameraSvg from '../../assets/discover/camera.svg';
import photoSvg from '../../assets/record/photo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Categories, POST_CHECK, windowHeight, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { TitleText } from './TitleText';
import { DescriptionText } from './DescriptionText';
import { SemiBoldText } from './SemiBoldText';
import { useTranslation } from 'react-i18next';
import closeCircleSvg from '../../assets/post/gray-close.svg';
import '../../language/i18n';
import { MyButton } from './MyButton';
import CameraRoll from "@react-native-community/cameraroll"
import { CategoryIcon } from './CategoryIcon';
import ImagePicker from 'react-native-image-crop-picker';
import { AllCategory } from './AllCategory';
import { PickImage } from './PickImage';

export const DailyPopUp = ({
  props,
  createdAt = '',
  isPast = false,
  onCloseModal = () => { }
}) => {

  const { t, i18n } = useTranslation();
  let { user } = useSelector(state => state.user);

  const mounted = useRef(false);

  const scrollRef = useRef();

  const [showModal, setShowModal] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(-2);
  const [photoInfo, setPhotoInfo] = useState(null);
  const [cameraPath, setCameraPath] = useState(null);
  const [pickModal, setPickModal] = useState(false);
  const [warning, setWarning] = useState(false);

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
      <View style={styles.swipeModal}>
        <View style={{
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
                    backgroundColor:'#FFF'
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
                  onPress={() => {
                    setPhotoIndex(index);
                    setPhotoInfo({ path: item.node.image.uri, mime: item.node.type });
                    setWarning(false);
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
                  { index == photoIndex && <View style={{ position: "absolute", width: 22, height: 22, backgroundColor: "white", borderRadius: 11, top: 26, right: 18, elevation: 3 }}></View>}
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
              text={t("What is it all about? 👀")}
              color='#361252'
              fontSize={20}
              lineHeight={28}
              marginBottom={12}
            />
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
            >
              <DescriptionText
                text={t("See all")}
                color='#CF71FC'
                fontSize={20}
                lineHeight={28}
                marginBottom={12}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal={true}
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            style={{
              width: windowWidth - 36,
            }}
            data={Categories}
            renderItem={({ item, index }) => {
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
            }}
            keyExtractor={(item, index) => index.toString()}
          />
          <View
            style={{
              paddingHorizontal: 16,
              width: '100%',
              paddingBottom: 10
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
        </View>
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
                setWarning(false);
                scrollRef.current?.scrollToIndex({ animated: true, index: id });
              }}
            />
          </Pressable>
        </Modal>
        {pickModal &&
          <PickImage
            onCloseModal={() => setPickModal(false)}
            onSetImageSource={(img) => onSetRecordImg(img)}
          />
        }
      </View>
    </Modal>
  );
};
