import React from "react";
import { Text, View } from "react-native";

export const TitleText = ({
  text,
  fontFamily = "SFProDisplay-Bold",
  textAlign = "left",
  color = "#281E30",
  marginBottom,
  marginTop,
  marginLeft,
  marginRight,
  maxWidth,
  fontSize = 28,
  lineHeight
}) => {
  return (
    <Text
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        color: color,
        textAlign: textAlign,
        marginBottom: marginBottom,
        marginTop: marginTop,
        marginLeft: marginLeft,
        maxWidth: maxWidth,
        marginRight: marginRight,
        lineHeight: lineHeight,
      }}
    >
      {text}
    </Text>
  );
};
