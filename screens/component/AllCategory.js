import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Vibration,
  TextInput,
  ScrollView
} from 'react-native';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from './TitleText';
import { CategoryIcon } from './CategoryIcon';
import { SvgXml } from 'react-native-svg';
import closeSvg from '../../assets/discover/close.svg'
import { Categories, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import searchSvg from '../../assets/login/search.svg';

export const AllCategory = ({
  closeModal = () => { },
  setCategory = () => { },
  selectedCategory = ''
}) => {

  const { t, i18n } = useTranslation();
  const [label, setLabel] = useState('');

  return (
    <View
      style={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: '#FFF',
        marginTop: 20,
        flex: 1
      }}
    >
      <View
        style={[
          {
            marginTop: Platform.OS == 'ios' ? 50 : 20,
            paddingHorizontal: 20,
            marginBottom: 20,
            height: 30,
          },
          styles.rowJustifyCenter
        ]}
      >
        <TitleText
          text={t("All Categories")}
          fontSize={20}
          color="#281E30"
        />
        <TouchableOpacity
          onPress={() => closeModal()}
          style={{
            position: 'absolute',
            right: 20
          }}
        >
          <SvgXml
            width="24"
            height="24"
            xml={closeSvg}
          />
        </TouchableOpacity>
      </View>
      <View style={{
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: '#F2F0F5',
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 12,
        width: windowWidth - 32,
        marginLeft: 16,
      }}>
        <SvgXml
          width="24"
          height="24"
          xml={searchSvg}
        />
        <TextInput
          style={[styles.searchInput, { paddingLeft: 12 }]}
          value={label}
          color='#281E30'
          placeholder={t("Search...")}
          onChangeText={(e) => setLabel(e)}
          placeholderTextColor="rgba(59, 31, 82, 0.6)"
        />
      </View>
      <ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
          {Categories.map((item, index) => {
            if (item.label.toLowerCase().indexOf(label.toLowerCase()) == -1) return;
            return (
              <CategoryIcon
                key={'all_catagory' + index}
                label={item.label}
                source={item.uri}
                onPress={() => {
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                  setCategory(index)
                }
                }
                active={selectedCategory == index ? true : false}
              />
            )
          })}
        </View>
      </ScrollView>
    </View>
  );
};
