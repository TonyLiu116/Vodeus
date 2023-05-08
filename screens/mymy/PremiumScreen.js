import React, { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
  View
} from 'react-native';

import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import { NavigationActions, StackActions } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import closeSvg from '../../assets/call/white_close.svg';
import checkBlueSvg from '../../assets/common/check_blue.svg';
import starRedSvg from '../../assets/common/star_red.svg';
import { windowWidth } from '../../config/config';
import '../../language/i18n';
import EditService from '../../services/EditService';
import { setUser } from '../../store/actions';
import { DescriptionText } from '../component/DescriptionText';
import { MediumText } from '../component/MediumText';
import { SemiBoldText } from '../component/SemiBoldText';

const PremiumScreen = (props) => {

  const { t, i18n } = useTranslation();

  const [premiumState, setPremiumState] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { user, refreshState, socketInstance } = useSelector((state) => state.user);

  const mounted = useRef(false);

  const onNavigate = (des, par = null) => {
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: des, params: par })],
    });
    props.navigation.dispatch(resetActionTrue);
  }
  const dispatch = useDispatch();

  const changePremiumState = () => {
    setLoading(true);
    EditService.changePremium(premiumState).then(async res => {
      if (res.respInfo.status == 201 && mounted.current) {
        let userData = { ...user }
        userData.premium = premiumState
        dispatch(setUser(userData));
        //dispatch(setRefreshState(!refreshState));
        socketInstance.emit("premium", { email: user.email });
        onNavigate("Home");
        setLoading(false);
      }
    })
      .catch(err => {
        console.log(err);
      })
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1,
      }}
    >
      <ImageBackground
        source={require('../../assets/Feed/head_back.png')}
        style={{
          width: windowWidth,
          height: windowWidth * 83 / 371,
          justifyContent: 'flex-end'
        }}
        imageStyle={{
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          paddingHorizontal: 20
        }}>
          <View>
            <SemiBoldText
              text={t('Subscriptions')}
              fontSize={20.5}
              lineHeight={24}
              color='#FFF'
            />
            <SvgXml
              xml={starRedSvg}
              style={{
                position: 'absolute',
                right: -14,
                top: -4
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
          >
            <SvgXml
              xml={closeSvg}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <SemiBoldText
        text={t('Get access to all praying groups and features')}
        fontSize={24}
        lineHeight={28}
        color='#111014'
        maxWidth={285}
        marginTop={35}
        marginLeft={26}
      />
      <DescriptionText
        text={t('Subscribe to our plans to earn a badge and share your stories with everyone')}
        fontSize={12}
        lineHeight={18}
        color='#8F8996'
        maxWidth={216}
        marginTop={9}
        marginLeft={26}
      />
      <TouchableOpacity style={{
        width: windowWidth - 44,
        height: 78,
        borderRadius: 16,
        borderColor: '#EAEAEA',
        borderWidth: 1,
        padding: 19,
        marginLeft: 22,
        marginTop: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View>
          <SemiBoldText
            text={t("Lifetime free")}
            fontSize={20}
            lineHeight={20}
            color='#111014'
            marginBottom={6}
          />
          <DescriptionText
            text={t('Total Price') + ` $0.00`}
            fontSize={14}
            lineHeight={14}
            color='#8F8996'
          />
        </View>
        <View>
          <SemiBoldText
            text={`$0.00`}
            fontSize={20}
            lineHeight={20}
            color='#111014'
            marginBottom={6}
          />
          <DescriptionText
            text={'/ ' + t('per month')}
            fontSize={14}
            lineHeight={14}
            color='#8F8996'
          />
        </View>
      </TouchableOpacity>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: windowWidth,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 24,
          marginTop: 30
        }}>
          <SvgXml
            xml={checkBlueSvg}
          />
          <DescriptionText
            text={t('Unlock private channels')}
            fontSize={16}
            lineHeight={20}
            color='#8F8F8F'
            marginLeft={10}
          />
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 24,
          marginTop: 15
        }}>
          <SvgXml
            xml={checkBlueSvg}
          />
          <DescriptionText
            text={t('Earn a badge that shows on your profile')}
            fontSize={16}
            lineHeight={20}
            color='#8F8F8F'
            marginLeft={10}
          />
        </View>
        <TouchableOpacity
          style={{
            width: windowWidth,
            alignItems: 'center',
            marginBottom: 25,
            marginTop: 72,
          }}
          onPress={() => changePremiumState()}
          disabled={loading}
        >
          <LinearGradient
            style={{
              height: 56,
              width: windowWidth - 58,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            locations={[0, 1]}
            colors={['#6051AD', '#423582']}
          >
            <MediumText
              text={t('Start Your Subscription')}
              fontSize={16}
              lineHeight={22}
              color='#FFF'
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {loading &&
        <View style={{
          position: 'absolute',
          width: '100%',
          alignItems: 'center',
          top: 120,
        }}>
          <Progress.Circle
            indeterminate
            size={30}
            color="rgba(0, 0, 255, .7)"
            style={{ alignSelf: "center" }}
          />
        </View>
      }
    </KeyboardAvoidingView>
  );
};

export default PremiumScreen;