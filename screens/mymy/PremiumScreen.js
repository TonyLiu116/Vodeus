import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { NavigationActions, StackActions } from 'react-navigation';
import { SvgXml } from 'react-native-svg';
import readedSvg from '../../assets/setting/readed.svg';
import circleCheckSvg from '../../assets/setting/circle_check.svg';
import starGreenSvg from '../../assets/common/star_green.svg';
import checkGreenSvg from '../../assets/common/check_green.svg';
import circleUnCheckSvg from '../../assets/setting/circle_uncheck.svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import closeSvg from '../../assets/call/white_close.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setRefreshState } from '../../store/actions';
import { windowHeight, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import EditService from '../../services/EditService';
import { SemiBoldText } from '../component/SemiBoldText';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import { MediumText } from '../component/MediumText';

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
    <ScrollView>
      <KeyboardAvoidingView
        style={{
          backgroundColor: '#FFF',
          flex: 1,
          width: windowWidth,
          height: windowHeight
        }}
      >
        <ImageBackground
          source={require('../../assets/Feed/head_back_green.png')}
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
                xml={starGreenSvg}
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
              text={1 + ' ' + t('Month')}
              fontSize={20}
              lineHeight={20}
              color='#111014'
              marginBottom={6}
            />
            <DescriptionText
              text={t('Total Price') + ` $9.99`}
              fontSize={14}
              lineHeight={14}
              color='#8F8996'
            />
          </View>
          <View>
            <SemiBoldText
              text={`$9.99`}
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
        <TouchableOpacity style={{
          width: windowWidth - 44,
          height: 78,
          borderRadius: 16,
          borderColor: '#EAEAEA',
          borderWidth: 1,
          padding: 19,
          marginLeft: 22,
          marginTop: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View>
            <SemiBoldText
              text={6 + ' ' + t('Month')}
              fontSize={20}
              lineHeight={20}
              color='#111014'
              marginBottom={6}
            />
            <DescriptionText
              text={t('Total Price') + ` $36.99`}
              fontSize={14}
              lineHeight={14}
              color='#8F8996'
            />
          </View>
          <View>
            <SemiBoldText
              text={`$6.99`}
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
        <TouchableOpacity style={{
          width: windowWidth - 44,
          height: 78,
          borderRadius: 16,
          borderColor: '#EAEAEA',
          borderWidth: 1,
          padding: 19,
          marginLeft: 22,
          marginTop: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View>
            <SemiBoldText
              text={1 + ' ' + t('Year')}
              fontSize={20}
              lineHeight={20}
              color='#111014'
              marginBottom={6}
            />
            <DescriptionText
              text={t('Total Price') + ` $88.99`}
              fontSize={14}
              lineHeight={14}
              color='#8F8996'
            />
          </View>
          <View>
            <SemiBoldText
              text={`$7.99`}
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
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 24,
          marginTop: 30
        }}>
          <SvgXml
            xml={checkGreenSvg}
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
            xml={checkGreenSvg}
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
            xml={checkGreenSvg}
          />
          <DescriptionText
            text={t('Unlock private channels')}
            fontSize={16}
            lineHeight={20}
            color='#8F8F8F'
            marginLeft={10}
          />
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
          style={{
            position: 'absolute',
            bottom: 0,
            width: windowWidth,
            alignItems: 'center'
          }}
        >
          <LinearGradient
            style={{
              height: 56,
              width: windowWidth - 58,
              marginBottom: 25,
              marginTop: 32,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            locations={[0, 1]}
            colors={['#0B8174', '#084B49']}
          >
            <MediumText
              text={t('Start Your Subscription')}
              fontSize={16}
              lineHeight={22}
              color='#FFF'
            />
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default PremiumScreen;