import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { windowWidth } from '../../config/config';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';

export const CategoryIcon = ({
  label,
  source,
  active = false,
  onPress = () => { },
}) => {

  const { t, i18n } = useTranslation();

  return (
    <View
      style={{
        width: (windowWidth - 20) / 25 * 4,
        margin: (windowWidth - 20) / 50,
      }}
    >
      <View
        style={{
          height: windowWidth / 26 * 4,
          alignItems: 'center',
          justifyContent: 'center',
          width: windowWidth / 26 * 4,
          borderRadius: 16,
          backgroundColor: active ? '#B35CF8' : '#FFF',
          shadowColor: 'rgba(42, 10, 111, 1)',
          elevation: !active ? 10 : 0,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity
          style={{
            width: windowWidth / 26 * 4,
            alignItems: 'center',
            padding: 1,
            borderRadius: 16,
          }}
          onPress={() => onPress()}
        >
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            color: '#4C64FF',
            backgroundColor: '#FFF',
            padding: 15,
            width: windowWidth / 26 * 4 - 4,
            height: windowWidth / 26 * 4 - 4,
            borderRadius: 14,
          }}>
            <Image source={source}
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
          color: active ? '#A24EE4' : 'rgba(54, 36, 68, 0.8)',
          textAlign: "center",
          marginTop: 8
        }}
      >
        {label == '' ? t('All') :  t(label)}
      </Text>
    </View>
  );
};
