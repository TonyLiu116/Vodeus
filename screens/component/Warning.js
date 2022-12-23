import React from "react";
import { View } from "react-native";
import { SvgXml } from 'react-native-svg';
import dangerTriangleSvg from '../../assets/common/dangerTriangle.svg';
import { TitleText } from './TitleText';
import { windowWidth } from '../../config/config';

export const Warning = ({
  text = '',
  fontFamily = "SFProDisplay-Regular",
  fontSize = 12,
  marginLeft = 36,
  marginRight = 28,
  lineHeight = 16,
  color = "#E41717",
  bottom = 196
}) => {
  return (
    <View
      style={{
        //position: 'absolute',
        marginLeft: marginLeft,
        marginRight: marginRight,
        width: windowWidth - marginLeft - marginRight,
        //bottom: bottom,
        marginBottom:10,
        borderRadius: 16,
        borderColor: '#F58D8D',
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE8E8'
      }}
    >
      <SvgXml width="24" height="24" xml={dangerTriangleSvg} />
      <TitleText
        text={text}
        fontFamily={fontFamily}
        fontSize={fontSize}
        lineHeight={lineHeight}
        color={color}
        marginLeft={12}
        marginRight={19}
        textAlign={'left'}
      />
    </View>
  );
};
