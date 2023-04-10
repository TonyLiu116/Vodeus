import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Image,
  TextInput,
  Text,
  Button,
  Modal,
  Pressable
} from 'react-native';

//import Contacts, { checkPermission } from 'react-native-contacts';
import SendSMS from 'react-native-sms';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { windowWidth } from '../../config/config';
import { useDispatch, useSelector } from 'react-redux';
import VoiceService from '../../services/VoiceService';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import greenCheckSvg from '../../assets/friend/green-check.svg';
import searchSvg from '../../assets/login/search.svg';
import { setUser } from '../../store/actions';
import { MyButton } from './MyButton';

export const ContactList = ({
  props,
}) => {

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const dispatch = useDispatch();

  // const { t, i18n } = useTranslation();
  // const [contactUsers, setContactUsers] = useState([]);
  // const [invitedUsers, setInvitedUsers] = useState([]);
  // const [label, setLabel] = useState("");
  // const [showRationale, setShowRationale] = useState(false);

  const mounted = useRef(false);

  // if (Platform.OS == 'ios')
  //   Contacts.iosEnableNotesUsage(false);

  // const onInviteFriend = (index) => {
  //   SendSMS.send(
  //     {
  //       // Message body
  //       body: t("Connect with God and other Christians from Brazil on Vodeus app. It's free! www.vodeus.co"),
  //       // Recipients Number
  //       recipients: [contactUsers[index].phoneNumbers[0].number],
  //       // An array of types 
  //       // "completed" response when using android
  //       successTypes: ['sent', 'queued'],
  //     },
  //     (completed, cancelled, error) => {
  //       if (completed) {
  //         let userData = { ...user };
  //         userData.score += 10;
  //         dispatch(setUser(userData));
  //         console.log('SMS Sent Completed');
  //       } else if (cancelled) {
  //         console.log('SMS Sent Cancelled');
  //       } else if (error) {
  //         console.log('Some error occured');
  //       }
  //     },
  //   ).then(res => {

  //   })
  //     .catch(err => {
  //       console.log(err);
  //     });
  //   setInvitedUsers(prev => {
  //     prev.push(index);
  //     return [...prev]
  //   });
  // }

  // const getLabel = (v) => {
  //   setLabel(v);
  // }

  // const checkValid = (el) => {
  //   if (el.givenName.length > 0) {
  //     if (el.givenName.toLowerCase().includes(label.toLowerCase()))
  //       return true;
  //   }
  //   if (el.familyName.length > 0) {
  //     if (el.familyName.toLowerCase().includes(label.toLowerCase()))
  //       return true;
  //   }
  //   if (el.phoneNumbers && el.phoneNumbers.length > 0) {
  //     if (el.phoneNumbers[0].number.toLowerCase().includes(label.toLowerCase()))
  //       return true;
  //   }
  //   return false;
  // }

  // const getContacts = async () => {
  //   try {
  //     const contacts = await Contacts.getAll();
  //     if (mounted.current)
  //       setContactUsers(contacts);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // const requestContactsPermission = async () => {
  //   setShowRationale(false);
  //   if (Platform.OS == 'android') {
  //     const rationale = {
  //       title: 'Contacts Permission',
  //       message:
  //         `This app helps you invite your friends and family to grow your faith together. By granting the permission, you allow the app to access your contacts, including their names and phone numbers. The loaded data of your contact list is only used for inviting contacts to this app and won't be saved for other purposes`,
  //       buttonPositive: 'Accept',
  //       buttonNegative: 'Deny',
  //     };
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
  //       rationale,
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       getContacts();
  //     }
  //   }
  //   else {
  //     getContacts();
  //   }
  // }

  // const checkContactsPermission = async () => {
  //   const granted = await PermissionsAndroid.check(
  //     PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
  //   );
  //   if (granted == true) {
  //     getContacts();
  //   }
  //   else
  //     setShowRationale(true);
  // };

  useEffect(() => {
    mounted.current = true;
    // console.log(showRationale);
    // if (Platform.OS == 'android')
    //   checkContactsPermission();
    // else
    //   getContacts();
    return () => {
      mounted.current = false;
    }
  }, [])

  return (
    <View
      style={{
        //backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1,
        marginBottom: 100,
      }}
    >
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={showRationale}
        onRequestClose={() => {
          setShowRationale(false);
        }}
      >
        <Pressable onPressOut={() => setShowRationale(false)} style={styles.swipeModal}>
          <View style={{
            padding: 16,
            marginHorizontal: 16,
            marginTop: 150,
            backgroundColor: '#FFF',
            borderRadius: 20
          }}>
            <SemiBoldText
              text={`This app helps you invite your friends and family to grow your faith together. By granting the permission, you allow the app to access your contacts, including their names and phone numbers. The loaded data of your contact list is only used for inviting contacts to this app and won't be saved for other purposes`}
              fontSize={16}
              textAlign='center'
              marginBottom={10}
            />
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}>
              <MyButton
                width={120}
                height={50}
                label={t("Deny")}
                marginHorizontal={4}
                onPress={() => setShowRationale(false)}
              />
              <MyButton
                marginHorizontal={4}
                width={120}
                height={50}
                label={t("OK")}
                onPress={requestContactsPermission}
              />
            </View>
          </View>
        </Pressable>
      </Modal> */}
      {/* {
        contactUsers.map((item, index) => {
          if (!checkValid(item))
            return null;
          let isInvited = invitedUsers.includes(index);
          return <View key={"InviteContacts" + index.toString()} style={[styles.rowSpaceBetween, { marginTop: 16 }]}>
            <View style={styles.rowAlignItems}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#CC9BF9',
                marginLeft: 16,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DescriptionText
                  text={(item.givenName.length > 0 ? item.givenName[0] : '') + (item.familyName.length > 0 ? item.familyName[0] : '')}
                  fontSize={20}
                  lineHeight={24}
                  color='#FFF'
                />
              </View>
              <View style={{
                marginLeft: 12
              }}>
                <SemiBoldText
                  text={item.givenName + ' ' + item.familyName}
                  fontSize={15}
                  lineHeight={24}
                />
                {item.phoneNumbers && item.phoneNumbers.length > 0 && <DescriptionText
                  text={item.phoneNumbers[0].number}
                  fontSize={13}
                  lineHeight={21}
                />}
              </View>
            </View>
            <TouchableOpacity style={{
              backgroundColor: isInvited ? '#ECF8EE' : '#F2F0F5',
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 8,
              marginRight: 8
            }}
              onPress={() => onInviteFriend(index)}
              disabled={isInvited}
            >
              <View style={styles.rowAlignItems}>
                {isInvited && <SvgXml
                  width={20}
                  height={20}
                  style={{
                    marginRight: 4
                  }}
                  xml={greenCheckSvg}
                />}
                <SemiBoldText
                  text={t(isInvited ? "Invited" : "Invite")}
                  fontSize={13}
                  lineHeight={21}
                  color={isInvited ? '#1A4C22' : '#8327D8'}
                />
              </View>
            </TouchableOpacity>
          </View>
        })
      } */}
    </View>
  );
};
