import React from "react";
import { View, TouchableOpacity } from "react-native";
import { SvgXml } from 'react-native-svg';
import { styles } from '../style/Common';
import { DescriptionText } from "./DescriptionText";
import chewronRightSvg from '../../assets/common/chewron_right.svg';

export const SelectForm = ({
  label,
  contentText,
  onPressChange = () => { },
  isCheck = false
}) => {

  return (
    <View style={{ marginTop: 16 }}>
      <DescriptionText
        text={label}
        fontSize={17}
        lineHeight={28}
        color='#281E30'
      />
      <TouchableOpacity onPress={onPressChange} style={[styles.rowSpaceBetween, { marginTop: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F2F0F5', paddingVertical: 12, paddingLeft: 12, paddingRight: 16 }]}>
        <DescriptionText
          text={contentText}
          fontSize={17}
          lineHeight={28}
          color='#281E30'
        />
        {isCheck &&
          <SvgXml
            width={24}
            height={24}
            xml={chewronRightSvg}
          />
        }
      </TouchableOpacity>
    </View>
  );
};
