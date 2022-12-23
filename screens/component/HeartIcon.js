import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import * as Animatable from 'react-native-animatable'
import Icon from 'react-native-vector-icons/AntDesign'

export const HeartIcon = ({
  isLike = false,
  height = 19,
  marginLeft = 0,
  marginRight = 0,
  marginBottom = 0,
  OnSetLike = () => { },
  borderColor = "#515151"
}) => {

  const [liked, setLiked] = useState(isLike);
  const mounted = useRef(false);

  const AnimatedIcon = Animatable.createAnimatableComponent(Icon);
  const smallAnimatedIcon = useRef();

  const handleOnPressLike = async () => {
    await smallAnimatedIcon.current?.bounceIn();
    if(mounted.current){
      setLiked(!liked);
    }
  }

  useEffect(() => {
    mounted.current = true;
    if (isLike != liked) {
      handleOnPressLike();
    }
    return ()=>{
      mounted.current = false;
    }
  }, [isLike])

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={OnSetLike}
      style={{ height: height, marginLeft: marginLeft, marginRight: marginRight, marginBottom: marginBottom }}
    >
      <AnimatedIcon
        ref={smallAnimatedIcon}
        name={isLike ? 'heart' : 'hearto'}
        color={isLike ? colors.heartColor : borderColor}
        size={height}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const colors = {
  transparent: 'transparent',
  white: '#fff',
  heartColor: '#e92f3c',
  textPrimary: '#515151',
  black: '#000',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {

  },
  image: {
    marginTop: 10,
    height: 280,
    width: '92%'
  },
  photoDescriptionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 10
  },
  icon: {
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  animatedIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: 160,
    opacity: 0
  },
  text: {
    textAlign: 'center',
    fontSize: 13,
    backgroundColor: colors.transparent,
    color: colors.textPrimary
  },
  textPhotographer: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  polaroidTextContainer: {
    flexDirection: 'row',
    textAlign: 'left',
    paddingTop: 0
  }
})
