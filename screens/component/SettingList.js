import React from "react";
import { View, TouchableOpacity } from "react-native";
import { SvgXml } from 'react-native-svg';
import { SemiBoldText } from '../component/SemiBoldText';
import { styles } from '../style/Common';

export const SettingList = ({
  svgRoute,
  svgRight,
  rightCheck = true,
  titleContent,
  onPressList = () => { }
}) => {
  return (
    <TouchableOpacity onPress={onPressList} style={[styles.rowSpaceBetween, { paddingVertical: 16, marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F2F0F5' }]}>
      <View style={styles.rowAlignItems}>
        <View style={[styles.contentCenter, { height: 40, width: 40, borderRadius: 12, backgroundColor: '#F8F0FF' }]}>
          <SvgXml
            width={24}
            height={24}
            xml={svgRoute}
          />
        </View>
        <SemiBoldText
          text={titleContent}
          fontSize={17}
          lineHeight={28}
          color='black'
          marginLeft={16}
        />
      </View>
      {rightCheck && <SvgXml
        width={24}
        height={24}
        xml={svgRight}
      />}
    </TouchableOpacity>
  );
};
