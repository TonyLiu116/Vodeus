import React from "react";
import { TitleText } from "./TitleText";
import { View, TouchableOpacity } from "react-native";
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { DescriptionText } from "./DescriptionText";

export const BlockList = ({
  marginTop,
  blockName,
  items,
  onLoadHistory = () => { },
  onClear = ()=>{}
}) => {

  const { t, i18n } = useTranslation();

  return (
    <View style={{ marginTop }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TitleText
          text={blockName}
          color='#281E30'
          fontSize={15}
        />
        <TouchableOpacity onPress={()=>onClear()}>
          <TitleText
            text={t('Clear')}
            marginRight={16}
            fontSize={15}
            fontFamily="SFProDisplay-Regular"
            color='rgba(38, 52, 73, 0.85)'
          />
        </TouchableOpacity>
      </View>
      <View style={{ width: '100%', height: 1, backgroundColor: '#F0F4FC', marginTop: 9, marginBottom: 18 }}></View>
      {items.map((item, index) => {
        return (
          <TouchableOpacity onPress={() => onLoadHistory(item)} key={item.title + index.toString()}>
            <DescriptionText
              text={item}
              key={index + 'blocklist'}
              fontSize={15}
              fontFamily='SFProDisplay-Regular'
              color='#281E30'
              marginBottom={20}
            />
          </TouchableOpacity>
        )
      })}
    </View>
  );
};
