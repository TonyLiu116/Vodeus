import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import { MyButton } from '../component/MyButton';
import { MyProgressBar } from '../component/MyProgressBar';
import { MyTextField } from '../component/MyTextField';
import * as Progress from "react-native-progress";

import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/actions';

import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';

import { styles } from '../style/Login';
import EditService from '../../services/EditService';
import { SafeAreaView } from 'react-native-safe-area-context';

const UsernameScreen = (props) => {

  const [username, setUsername] = useState('');
  const [validUsername, setValidUsername] = useState(false);
  const [inputState, setInputState] = useState({});
  const [warningState, setWarningState] = useState(false);
  const [loading, setLoading] = useState(false);

  const { t, i18n } = useTranslation();

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const checkUsername = (newVal) => {
    setUsername(newVal);
    setWarningState(false);
    setInputState({});
    let reg = /^[A-Za-z0-9]+(?:[.-_-][A-Za-z0-9]+)*$/;
    // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(newVal) === true) {
      setValidUsername(true);
    } else {
      setValidUsername(false);
    }
  }
  const handleSubmit = () => {
    if (validUsername == false) {
      setInputState({ username: t("Username is not available") })
      setWarningState(true);
    }
    else if (username.length < 4) {
      setInputState({ username: t("Username must be at least 4 letters") })
      setWarningState(true);
    }
    else {
      setLoading(true);
      EditService.userNameVerify(username).then(async res => {
        if (res.respInfo.status == 201) {
          let userData = { ...user };
          userData.name = username;
          dispatch(setUser(userData));
          props.navigation.navigate("Birthday");
        }
        else {
          setWarningState(true);
          setInputState({ username: t("This username is already taken") })
        }
        setLoading(false);
      })
        .catch(err => {
          setLoading(false);
          console.log(err);
        })
    }
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
          progress={1}
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
          text={t("Create a username")}
          fontSize={22}
          textAlign="center"
        />
        <MyTextField
          label={t("Your username")}
          placeholderText="vocco e.g"
          value={username}
          color='#281E30'
          onChangeText={(newVal) => { checkUsername(newVal); }}
          stateText={inputState.username}
          marginTop={26}
          warning={warningState}
          check={validUsername}
        />
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          position: 'absolute',
          width: '100%',
          bottom: 30,
          zIndex: 0
        }}
      >
        <MyButton
          label={t("Next")}
          onPress={handleSubmit}
        />
      </View>
      {loading && <View style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Progress.Circle
          indeterminate
          size={30}
          color="white"
          style={{ alignSelf: "center" }}
        />
      </View>}
    </SafeAreaView>
  );
};

export default UsernameScreen;