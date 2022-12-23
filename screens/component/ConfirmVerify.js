import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Text, TouchableOpacity } from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import AuthService from '../../services/AuthService';
import EditService from '../../services/EditService';
import { styles } from '../style/Login';
import { useSelector } from 'react-redux';

export const ConfirmVerify = ({
  marginTop = 0,
  onSuccess = () => { },
  isChanging = false
}) => {

  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);

  const { t, i18n } = useTranslation();

  const mounted = useRef(false);

  const user = useSelector((state) => state.user.user);

  const handleSubmit = async ({ }) => {
    const payload = {
      pseudo: pseudo,
    };
    let rqst;
    setLoading(true);
    if (isChanging)
      rqst = EditService.confirmVerify(pseudo);
    else
      rqst = AuthService.confirmVerify(payload);
    rqst.then(async res => {
      try {
        if (mounted.current) {
          if (res.respInfo.status !== 201) {
            setPseudo('');
            //  setMessage(jsonRes.message);
          } else {
            onSuccess();
            //   setMessage(jsonRes.message);
          }
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
      };
    })
      .catch(err => {
        console.log(err);
      });
  }

  useEffect(() => {
    mounted.current = true;
    return ()=>{
      mounted.current = false;
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <View
        style={{ marginTop: marginTop, paddingHorizontal: 20 }}
      >
        <DescriptionText
          text={t("We sent a code to ") + user.email + "."}
          fontSize={15}
          textAlign="center"
        />
        <DescriptionText
          text={t("Enter it here to verify your identity")}
          fontSize={15}
          textAlign="center"
        />
      </View>
      <TouchableOpacity onPress={() => AuthService.ResendCode()}>
        <Text
          style={{
            textAlign: 'center',
            color: '#8327D8',
            fontSize: 15,
            marginTop: 15
          }}
        >
          {t("Resend code")}
        </Text>
      </TouchableOpacity>
      <View
        style={
          {
            marginTop: 50,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'center'
          }
        }
      >
        <OTPInputView
          style={{ width: '80%', height: 100 }}
          pinCount={6}
          code={pseudo}
          onCodeChanged={code => { setPseudo(code) }}
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={(code) => {
            setPseudo(code)
          }}
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
          label={t("Confirm")}
          onPress={handleSubmit}
          active={pseudo.length == 6 ? true : false}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
