import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
} from 'react-native';

import { DescriptionText } from '../component/DescriptionText';
import { SvgXml } from 'react-native-svg';

import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import contactsSvg from '../../assets/setting/contacts.svg';
import mailSvg from '../../assets/setting/mail.svg';
import { windowHeight } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';

const ContactScreen = (props) => {

    const { t, i18n } = useTranslation();

    const [emailaddress, setEmailaddress] = useState('team@vocco.ai')
    const [contactChat, setContactChat] = useState('chat on WhatsApp')

    useEffect(() => {
    }, [])
    return (
        <KeyboardAvoidingView
            style={{
                backgroundColor: '#FFF',
                flex: 1,
            }}
        >
            <View style={styles.titleContainer}>
                <TouchableOpacity style={{ position: 'absolute', left: 16 }} onPress={() => props.navigation.goBack()}>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={arrowBendUpLeft}
                    />
                </TouchableOpacity>
                <SemiBoldText
                    text={t('Contacts')}
                    fontSize={20}
                    lineHeight={24}
                />
            </View>
            <View style={{ marginTop: windowHeight / 5, flex: 1, alignItems: 'center' }}>
                <Image style={{
                    alignItems: 'center',
                    height: 125,
                    width: '60%',
                    //borderRadius: 16,
                    // shadowColor: 'rgba(42, 10, 111, 1)',
                    // shadowOffset: { width: 0, height: 2 },
                    // shadowOpacity: 0.5,
                    // shadowRadius: 8,
                    // elevation: 10,
                }}
                    source={require('../../assets/common/logo.png')}
                />
            </View>
            <View style={{
                position: 'absolute',
                bottom: 60,
                width: '100%'
            }}>
                <TouchableOpacity style={[styles.rowAlignItems, { paddingVertical: 16, marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F2F0F5' }]}>
                    <View style={[styles.contentCenter, { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8F0FF' }]}>
                        <SvgXml
                            width={24}
                            height={24}
                            xml={mailSvg}
                        />
                    </View>
                    <View style={{ marginLeft: 16 }}>
                        <DescriptionText
                            text="email"
                            fontSize={12}
                            lineHeight={16}
                            color='rgba(59, 31, 82, 0.6)'
                        />
                        <DescriptionText
                            text={emailaddress}
                            fontSize={17}
                            lineHeight={28}
                            color='black'
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rowAlignItems, { paddingVertical: 16, marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F2F0F5' }]}>
                    <View style={[styles.contentCenter, { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8F0FF' }]}>
                        <SvgXml
                            width={24}
                            height={24}
                            xml={contactsSvg}
                        />
                    </View>
                    <View style={{ marginLeft: 16 }}>
                        <DescriptionText
                            text={t("support")}
                            fontSize={12}
                            lineHeight={16}
                            color='rgba(59, 31, 82, 0.6)'
                        />
                        <DescriptionText
                            text={contactChat}
                            fontSize={17}
                            lineHeight={28}
                            color='black'
                        />
                    </View>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ContactScreen;