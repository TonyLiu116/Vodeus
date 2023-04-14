import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  TouchableOpacity, View
} from 'react-native';


import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';


import { SvgXml } from 'react-native-svg';
import boldCloseSvg from '../../assets/post/ph_x.svg';
import { windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { SelectList } from 'react-native-dropdown-select-list'

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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [selected, setSelected] = useState('Voice Chat');

  const data = [
    { key: '1', value: 'Voice Chat', },
    { key: '2', value: 'Live Chat' },
  ]

  const onClose = () => {
    setShowModal(false);
    onCloseModal()
  }

  const onStartChatting = () => {
    if (selected == 'Voice Chat' || selected == 1) {
      onCreateRoom(title);
    }
    else {
      props.navigation.navigate('LiveChat', { title: title, content: content });
    }
    onClose();
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
      <View
        style={{
          backgroundColor: '#FFF',
          flex: 1,
          paddingHorizontal: 16
        }}
      >
        <View style={[styles.titleContainer, { borderBottomWidth: 0 }]}>
          <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={onClose}>
            <SvgXml
              width={24}
              height={24}
              xml={boldCloseSvg}
            />
          </TouchableOpacity>
          <View style={{
            width: 75,
            height: 5,
            borderRadius: 5,
            backgroundColor: '#E5E6EB'
          }}>
          </View>
        </View>
        <SelectList
          setSelected={(val) => setSelected(val)}
          data={data}
          save="value"
          defaultOption={{ key: '1', value: 'Voice Chat' }}
          boxStyles={{
            marginTop: 20
          }}
        />
        <TextInput
          style={{
            width: windowWidth - 32,
            height: 50,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            marginTop: 18,
            fontSize: 20,
            lineHeight: 30,
            color: '#484444',
            fontFamily: "SFProDisplay-Semibold",
          }}
          value={title}
          onChangeText={v => setTitle(v)}
          placeholder={t('Chat name')}
        />
        <TextInput
          style={{
            width: windowWidth - 32,
            height: 104,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            marginTop: 16,
            marginBottom: 19,
            fontSize: 20,
            lineHeight: 30,
            color: '#484444',
            fontFamily: "SFProDisplay-Regular",
          }}
          value={content}
          multiline={true}
          textAlignVertical='top'
          numberOfLines={5}
          maxLength={150}
          onChangeText={v => setContent(v)}
          placeholder={t("Description or rules of the chat")}
          placeholderTextColor="#D2D2D2"
        />
        <TouchableOpacity style={{
          position: 'absolute',
          bottom: 30,
          left: 16,
          width: windowWidth - 32,
          height: 56,
          borderRadius: 30,
          backgroundColor: '#09655D',
          justifyContent: 'center',
          alignItems: 'center'
        }}
          onPress={() => onStartChatting()}
        >
          <SemiBoldText
            text={t('Start Chatting')}
            fontSize={16}
            lineHeight={22}
            color='#FFF'
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};