import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import DatePicker from 'react-native-date-picker'
import { TitleText } from '../component/TitleText';
import { MyButton } from '../component/MyButton';
import { MyProgressBar } from '../component/MyProgressBar';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import { styles } from '../style/Login';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/actions/index';
import { SafeAreaView } from 'react-native-safe-area-context';

const BirthdayScreen = (props) => {

  const [date, setDate] = useState(new Date());

  const { t, i18n } = useTranslation();

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const handleSubmit = () => {
    let userData = { ...user };
    userData.dob = date;
    dispatch(setUser(userData));
    props.navigation.navigate('Identify');
  }

  useEffect(() => {
  }, [])

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <View
        style={[
          { marginTop: 20, paddingHorizontal: 20, marginBottom: 20, height: 30 },
          styles.rowSpaceBetween
        ]}
      >
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
        >
          <SvgXml
            width="24"
            height="24"
            xml={arrowBendUpLeft}
          />
        </TouchableOpacity>
        <MyProgressBar
          progress={2}
        />
        <TouchableOpacity
          onPress={handleSubmit}
        >
          <Text
            style={{
              textAlign: 'center',
              color: '#8327D8',
              fontSize: 15,
            }}>{t("Next")}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ marginTop: 20, paddingHorizontal: 20 }}
      >
        <TitleText
          text={t("Date of Birth")}
          fontSize={22}
          textAlign="center"
        />
      </View>
      <View style={[styles.rowJustifyCenter, { marginTop: 35 }]}>
        <DatePicker
          date={date}
          onDateChange={setDate}
          mode="date"
          androidVariant='iosClone'
          maximumDate={new Date()}
        />
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          position: 'absolute',
          width: '100%',
          bottom: 30
        }}
      >
        <MyButton
          label={t("Next")}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

export default BirthdayScreen;