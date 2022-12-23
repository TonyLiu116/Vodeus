import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Image,
  TextInput
} from 'react-native';

import Contacts, { checkPermission } from 'react-native-contacts';
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


export const ContactList = ({
  props,
}) => {

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const { t, i18n } = useTranslation();
  const [contactUsers, setContactUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [label, setLabel] =useState("");

  const mounted = useRef(false);

  if (Platform.OS == 'ios')
    Contacts.iosEnableNotesUsage(false);

  const onInviteFriend = (index) => {
    // VoiceService.inviteFriend(contactUsers[index].phoneNumbers[0].number)
    //   .then(res=>{

    //   })
    //   .catch(err=>{
    //     console.log(err);
    //   })
    // ;
    SendSMS.send(
      {
        // Message body
        body: `Hey! Are you ok? I'm a little tired of apps like Insta, BeReal etc. I want to share real moments with my loved ones, including you, on Vocco. Will you join me?\nhttps://vocco.app.link/${user.name}`,
        // Recipients Number
        recipients: [contactUsers[index].phoneNumbers[0].number],
        // An array of types 
        // "completed" response when using android
        successTypes: ['sent', 'queued'],
      },
      (completed, cancelled, error) => {
        if (completed) {
          console.log('SMS Sent Completed');
        } else if (cancelled) {
          console.log('SMS Sent Cancelled');
        } else if (error) {
          console.log('Some error occured');
        }
      },
    ).then(res => {

    })
      .catch(err => {
        console.log(err);
      });
    setInvitedUsers(prev => {
      prev.push(index);
      return [...prev]
    });
  }

  const requestPermission = async () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        'title': 'Contacts',
        'message': 'This app would like to view your contacts.',
        'buttonPositive': 'Please accept bare mortal'
      }
    )
      .then(Contacts.getAll()
        .then((contacts) => {
          // work with contacts
          if (mounted.current)
            setContactUsers(contacts);
        })
        .catch((e) => {
          console.log(e)
        }))
  }

  const getLabel=(v)=>{
    setLabel(v);
  }

  const checkValid=(el)=>{
    if(el.givenName.length>0){
      if(el.givenName.toLowerCase().includes(label.toLowerCase()))
        return true;
    }
    if(el.familyName.length>0){
      if(el.familyName.toLowerCase().includes(label.toLowerCase()))
      return true;
    }
    if(el.phoneNumbers && el.phoneNumbers.length > 0){
      if(el.phoneNumbers[0].number.toLowerCase().includes(label.toLowerCase()))
        return true;
    }
    return false;
  }

  useEffect(async () => {
    mounted.current = true;
    if (Platform.OS == 'ios') {
      await Contacts.getAll()
        .then((contacts) => {
          if (mounted.current)
            setContactUsers(contacts);
        })
        .catch((err) => {
          console.log(e)
        })
    }
    else if (Platform.OS == 'android')
      requestPermission();
    return () => {
      mounted.current = false;
    }
  }, [])

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1,
        marginBottom:80,
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F0F5',
        borderRadius: 24,
        height: 44,
        width: windowWidth - 68,
        paddingHorizontal: 12,
        marginTop:8,
        marginBottom:6,
        marginLeft:6
      }}>
        <SvgXml
          width="24"
          height="24"
          xml={searchSvg}
        />
        <TextInput
          style={[styles.searchInput, { paddingLeft: 12, width: windowWidth - 120 }]}
          value={label}
          color='#281E30'
          placeholder={t("Search"+"...")}
          onChangeText={getLabel}
          placeholderTextColor="rgba(59, 31, 82, 0.6)"
        />
      </View>
      {
        contactUsers.map((item, index) => {
          if(!checkValid(item))
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
      }
    </View>
  );
};
