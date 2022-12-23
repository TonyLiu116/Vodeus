import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';

import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import moreSvg from '../../assets/common/more.svg';
import followSvg from '../../assets/profile/follow.svg';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';

const UserProfileListScreen = (props) => {

  useEffect(() => {
  }, [])
  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <SvgXml
            width={24}
            height={24}
            xml={arrowBendUpLeft}
          />
        </TouchableOpacity>
        <SemiBoldText
          text='@deny_prank'
          fontSize={20}
          lineHeight={24}
        />
        <View style={styles.rowAlignItems}>
          <TouchableOpacity>
            <SvgXml
              width={24}
              height={24}
              xml={followSvg}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <SvgXml
              width={24}
              height={24}
              xml={moreSvg}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UserProfileListScreen;