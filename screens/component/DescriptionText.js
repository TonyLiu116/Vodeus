import React from "react";
import { Text } from "react-native";

export const DescriptionText = ({
  text,
  fontFamily = "SFProDisplay-Regular",
  textAlign = "left",
  color = 'rgba(54, 36, 68, 0.8)',
  numberOfLines,
  marginBottom = 0,
  marginTop = 0,
  lineHeight = 24,
  marginLeft = 0,
  marginRight = 0,
  fontSize = 15,
  maxWidth
}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        color: color,
        textAlign: textAlign,
        marginBottom: marginBottom,
        marginTop: marginTop,
        marginLeft: marginLeft,
        marginRight: marginRight,
        lineHeight: lineHeight,
        maxWidth: maxWidth,
      }}
    >
      {text}
    </Text>
  );
};
