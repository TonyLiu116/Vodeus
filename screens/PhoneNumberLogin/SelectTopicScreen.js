import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform, Image } from 'react-native';
import PhoneInput from "react-native-phone-number-input";
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';

import { styles } from '../style/Welcome';
import { MyProgressBar } from '../component/MyProgressBar';
import { Categories, windowWidth } from '../../config/config';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

const SelectTopicScreen = (props) => {

    const [topics, SetTopics] = useState([]);

    const { t, i18n } = useTranslation();
    const phoneInput = useRef();

    const onSelectTopic = ( id )=>{
        let tp = topics;
        let idx = tp.indexOf(id);
        if(idx==-1){
            tp.push(id);
        }
        else{
            tp.splice(idx,1);
        }
        SetTopics([...tp]);
    }

    useEffect(() => {
    }, [])

    return (
        <ImageBackground
            source={require('../../assets/phoneNumber/background.png')}
            resizeMode="cover"
            style={styles.background}
        >
            <View
                style={[
                    { marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 12, marginBottom: 47, height: 30 },
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
                    dag={7}
                    progress={6}
                />
                <TouchableOpacity
                    onPress={() => { }}
                >
                    <DescriptionText
                        text={t("Skip")}
                        color="#8327D8"
                        fontSize={17}
                        lineHeight={28}
                    />
                </TouchableOpacity>
            </View>
            <View
                style={{
                    alignItems: 'center'
                }}
            >
                <TitleText
                    text={t("What topics are you interested in?")}
                    textAlign='center'
                    maxWidth={280}
                />
                <DescriptionText
                    text={t("Select some topics and we'll fill your feed with a few voices you may like to get started")}
                    fontSize={15}
                    lineHeight={24}
                    textAlign='center'
                    maxWidth={320}
                    marginTop={8}
                />
            </View>
            <ScrollView style={{marginTop:13}}>
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    paddingHorizontal: 12,
                }}>
                    {Categories.map((item, index) => {
                        if (index == 0)
                            return null;
                        let selected = topics.includes(index);
                        return <TouchableOpacity
                            onPress={()=>onSelectTopic(index)}
                            key={index + "topics"}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingLeft: 12,
                                paddingRight: 16,
                                paddingVertical: 6,
                                marginHorizontal: 4,
                                marginVertical: 4,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: '#F2F0F5',
                                backgroundColor: selected?"#F44685":'#FFF',
                            }}>
                            <Image
                                source={item.uri}
                                style={{
                                    width: 24,
                                    height: 24
                                }}
                            />
                            <DescriptionText
                                text={item.label == 'Adults' ? 'For adults' : item.label}
                                fontSize={17}
                                lineHeight={28}
                                marginLeft={9}
                                color={selected?"#FFF":"#281E30"}
                            />
                        </TouchableOpacity>
                    })}
                </View>
                <View style={{height:70,width:70}}>
                </View>
            </ScrollView>
            <TouchableOpacity style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
            }}
                onPress={() => props.navigation.navigate('AddFriend')}
                disabled={topics.length < 3}
            >
                <LinearGradient
                    style={
                        {
                            height: 56,
                            width: 56,
                            borderRadius: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row'
                        }
                    }
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    colors={topics.length > 2 ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FBF2FF', '#F7E5FF', '#E5D1FF']}
                >
                    <SvgXml
                        width={32}
                        height={32}
                        xml={rightArrowSvg}
                    />
                </LinearGradient>
            </TouchableOpacity>
        </ImageBackground>
    );
};

export default SelectTopicScreen;