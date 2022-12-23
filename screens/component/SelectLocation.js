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
import LinearGradient from 'react-native-linear-gradient';
import { MyButton } from './MyButton';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import { windowHeight, windowWidth } from '../../config/config';
import { SearchCountry } from './SearchCountry';

export const SelectLocation = ({
  type = "story",
  selectLocation = ()=>{},
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);
  const [location, setLocation] = useState(null);

  const mounted = useRef(false);

  const OnSelectLocation = ()=>{
    selectLocation(location.country);
    setShowModal(false);
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
              text={t("Where did it happen?")}
              fontSize={17}
              lineHeight={28}
              color='#263449'
            />
            <TouchableOpacity disabled={!location} onPress={() => OnSelectLocation()}>
              <DescriptionText
                text={t('Save')}
                fontSize={17}
                lineHeight={28}
                color='#8327D8'
              />
            </TouchableOpacity>
          </View>
          <SearchCountry
            marginHorizontal={16}
            marginTop={35}
            onSelectCountry={(cty) => setLocation(cty)}
          />
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255,255,255, 0)']}
            locations={[0.7, 1]}
            start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
            style={{ position: 'absolute', paddingHorizontal: 16, bottom: 0, width: windowWidth }}
          >
            <MyButton
              label={t("Save")}
              //marginTop={90}
              onPress={() => OnSelectLocation()}
              active={location ? true : false}
              marginBottom={20}
            />
          </LinearGradient>
        </View>
      </Pressable>
    </Modal>
  );
};
