import React, { useReducer } from "react";
import { View, TextInput, Pressable } from "react-native";
import { SvgXml } from 'react-native-svg';
import checkSvg from '../../assets/login/check.svg';
import showPasswordSvg from '../../assets/login/showpassword.svg'
import hidePasswordSvg from '../../assets/login/hidepassword.svg'
import errorSvg from '../../assets/common/error.svg'
import { TitleText } from "./TitleText";
import { DescriptionText } from "./DescriptionText";
import { windowWidth } from "../../config/config";

export const MyTextField = ({
  label,
  refer,
  color,
  value,
  onChangeText,
  onEndEditing,
  placeholderText,
  stateText,
  multiline = false,
  maxWidth = windowWidth - 90,
  keyboardType = "default",
  numberOfLines,
  marginTop = 16,
  errorText = null,
  secureTextEntry = false,
  check = false,
  showEye = () => { },
  isPassword = false,
  warning = false,
}) => {

  const reducer = (action) => {
    return action;
  }

  const [focusState, dispatch] = useReducer(reducer, false);

  return (
    <View
      style={{
        marginTop
      }}
    >
      <TitleText
        text={label}
        fontSize={17}
        fontFamily="SFProDisplay-Regular"
      />
      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          borderColor: warning ? '#E41717' : (focusState ? '#A65BEC' : '#F2F0F5'),
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <TextInput
          style={
            {
              fontSize: 17,
              color,
              width: windowWidth - 60
            }
          }
          onFocus={() => dispatch(true)}
          onBlur={() => dispatch(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxWidth={maxWidth}
          keyboardType={keyboardType}
          ref={refer}
          value={value}
          autoCapitalize='none'
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          placeholder={placeholderText}
          placeholderTextColor="rgba(59, 31, 82, 0.6)"
          secureTextEntry={secureTextEntry}
        />
        {
          (check || warning) &&
          <SvgXml
            width="24"
            height="24"
            xml={warning ? errorSvg : checkSvg}
          />
        }
        {
          isPassword && !warning && value.length ?
            <Pressable onPress={() => showEye()} style={{
            }}>
              <SvgXml
                width="24"
                height="24"
                xml={secureTextEntry ? showPasswordSvg : hidePasswordSvg}
              />
            </Pressable>
            : null
        }
      </View>
      {stateText && <DescriptionText
        text={stateText}
        lineHeight={16}
        fontSize={12}
        marginTop={5}
        color={warning ? '#E41717' : 'rgba(54, 36, 68, 0.8)'}
      />}
      {errorText && <DescriptionText
        text={errorText}
        lineHeight={16}
        fontSize={12}
        marginTop={5}
        color='#E41717'
      />}
    </View>
  );
};
