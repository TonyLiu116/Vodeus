import React, { useEffect, useRef, useState } from 'react';
import {
  Image, Modal, Platform, Pressable, ScrollView, TouchableOpacity, View
} from 'react-native';


import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { DescriptionText } from './DescriptionText';


import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Avatars, Categories, windowHeight, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';

export const CreateRoom = ({
  props,
  onCreateRoom = () => { },
  onCloseModal = () => { },
}) => {

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();

  let { user, refreshState, voiceState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const [showModal, setShowModal] = useState(true);
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);

  const onClose = () => {
    setShowModal(false);
    onCloseModal()
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [])
  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        onClose();
      }}
    >
      <Pressable onPressOut={onClose} style={[styles.swipeModal, { height: windowHeight, marginTop: 0 }]}>
        <Pressable style={[styles.swipeContainerContent, { bottom: 0, maxHeight: windowHeight, minHeight: 0 }]}>
          <View
            style={{
              flex: 1,
            }}
          >
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginTop: 27,
                marginBottom: 14
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SemiBoldText
                    text={t("Now in direct")}
                    fontSize={13}
                    lineHeight={21}
                    color='#8327D8'
                  />
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: '#8327D8',
                    marginHorizontal: 6
                  }}>
                  </View>
                  <SemiBoldText
                    text={'0 '+t("people are listening")}
                    color='#5E4175'
                    fontSize={10.12}
                    lineHeight={16.67}
                  />
                </View>
                <TouchableOpacity onPress={() => onCreateRoom(label, categoryId)}>
                  <SemiBoldText
                    text={t("Create")}
                    fontSize={17.89}
                    lineHeight={23.4}
                    color='#0B5CD7'
                  />
                </TouchableOpacity>
              </View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 20,
                marginBottom: 26
              }}>
                <Image
                  source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
                  style={{ width: 46, height: 46, borderRadius: 25 }}
                  resizeMode='cover'
                />
                <View>
                  <TextInput
                    style={{ fontSize: 19.35, lineHeight: 32, fontFamily: "SFProDisplay-Semibold", paddingLeft: 20, width: windowWidth - 110 }}
                    value={label}
                    color='#281E30'
                    placeholder={t("Write title" + "...")}
                    autoFocus
                    onChangeText={(e) => setLabel(e)}
                    placeholderTextColor="#E4CAFC"
                  />
                  <DescriptionText
                    text={t("You are the host")}
                    fontSize={14.8}
                    lineHeight={15}
                    color='rgba(54, 18, 82, 0.8)'
                    marginLeft={20}
                    marginTop={10}
                  />
                </View>
              </View>
              <ScrollView
                style={{
                  maxHeight: 50,
                  marginBottom: 18
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
                        text={item.label == '' ? t('All') : item.label == 'Support' ? t('Support/Help') : t(item.label)}
                        fontSize={14}
                        lineHeight={20}
                        marginLeft={10}
                      />
                    </TouchableOpacity>
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
          {Platform.OS == 'ios' && <KeyboardSpacer />}
        </Pressable>
      </Pressable>
    </Modal>
  );
};