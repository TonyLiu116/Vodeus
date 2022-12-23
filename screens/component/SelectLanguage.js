import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';

import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { SearchLanguage } from './SearchLanguage';
import LinearGradient from 'react-native-linear-gradient';
import { MyButton } from './MyButton';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import { windowHeight, windowWidth, MAIN_LANGUAGE } from '../../config/config';
import EditService from '../../services/EditService';
import { setRefreshState, setUser } from '../../store/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SelectLanguage = ({
  type = "story",
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(true);
  const [language, setLanguage] = useState(null);
  const [loading, setLoading] = useState(false);

  let { user, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const mounted = useRef(false);

  const OnSelectLanguage = async () => {
    if (type == 'story') {
      setLoading(true);
      EditService.changeStoryLanguage(language.language).then(res => {
        let tp = user;
        tp.storyLanguage = language.language;
        dispatch(setUser(tp));
        dispatch(setRefreshState(!refreshState));
        setLoading(false);
        closeModal();
      });
    }
    else {
      setLoading(true);
      i18n.changeLanguage(language.language).then(async () => {
        await AsyncStorage.setItem(
          MAIN_LANGUAGE,
          language.language
        );
        closeModal();
        setLoading(false);
      })
        .catch(err => console.log(err));
    }
  }

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
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
        <View style={styles.swipeInputContainerContent}>
          <View style={[styles.rowSpaceBetween, { paddingHorizontal: 14, paddingVertical: 12 }]}>
            <TouchableOpacity onPress={() => closeModal()}>
              <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={closeBlackSvg}
                />
              </View>
            </TouchableOpacity>
            <SemiBoldText
              text={t("Select your language")}
              fontSize={17}
              lineHeight={28}
              color='#263449'
            />
            <TouchableOpacity disabled={!language} onPress={() => OnSelectLanguage()}>
              <DescriptionText
                text={t('Save')}
                fontSize={17}
                lineHeight={28}
                color='#8327D8'
              />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <SearchLanguage
              height={windowHeight - 190}
              onSelectLanguage={(lge) => setLanguage(lge)}
            />
          </View>
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255,255,255, 0)']}
            locations={[0.7, 1]}
            start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
            style={{ position: 'absolute', paddingHorizontal: 16, bottom: 0, width: windowWidth }}
          >
            <MyButton
              label={t("Save")}
              //marginTop={90}
              onPress={() => OnSelectLanguage()}
              active={language ? true : false}
              marginBottom={20}
              loading={loading}
            />
          </LinearGradient>
        </View>
      </Pressable>
    </Modal>
  );
};
