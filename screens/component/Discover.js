import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  RefreshControl,
  Modal,
  Image
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import '../../language/i18n';
import { TitleText } from './TitleText';
import { FlatList } from 'react-native-gesture-handler';
import { CategoryIcon } from './CategoryIcon';
import { DescriptionText } from './DescriptionText';
import { AllCategory } from './AllCategory';

import { SvgXml } from 'react-native-svg';

import { Categories, TODAY, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { Stories } from './Stories';
import { DiscoverStories } from './Discoverstories';
import { setRefreshState } from '../../store/actions';
import { SelectLanguage } from './SelectLanguage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Discover = ({
  props,
  category = 0,
}) => {

  const [showLanguage, setShowLanguage] = useState(false);

  const mounted = useRef(false);

  let { user, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [refreshState])

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1
      }}
    >
      <DiscoverStories
        props={props}
        category={Categories[category].label}
      />
      {showLanguage &&
        <SelectLanguage
          onCloseModal={() => setShowLanguage(false)}
        />
      }
    </View>
  );
};
