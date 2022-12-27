import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, Image, Text, TouchableOpacity, Linking, FlatList } from 'react-native';
import { TitleText } from '../component/TitleText';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import CheckBox from 'react-native-check-box';

import { styles } from '../style/Welcome';
import { windowWidth } from '../../config/config';
import { DescriptionText } from '../component/DescriptionText';
import { SemiBoldText } from '../component/SemiBoldText';

const WelcomeScreen = (props) => {

    const { t, i18n } = useTranslation();

    useEffect(() => {
    }, [])

    const sources = [
        {
            uri: require('../../assets/welcome/image0.png'),
            title: t('Connect'),
            bio: t('Meet new friends')
        },
        {
            uri: require('../../assets/welcome/image1.png'),
            title: t('Support'),
            bio: t('Be implied with the community')
        },
        {
            uri: require('../../assets/welcome/image2.png'),
            title: t('Receive'),
            bio: t('Get supported by the community')
        }, {
            uri: require('../../assets/welcome/image3.png'),
            title: t('Discover'),
            bio: t('Past memories & upcoming events')
        },
    ]

    const onViewableItemsChanged = ({
        viewableItems,
    }) => {
        // Do stuff
        if (viewableItems.length > 0)
            setViewIndex(viewableItems[0].index);
    };
    const viewabilityConfigCallbackPairs = useRef([{
        viewabilityConfig: {
            minimumViewTime: 100,
            itemVisiblePercentThreshold: 100
        },
        onViewableItemsChanged
    }
    ]);

    const [isWarning, setIsWarning] = useState(false);
    const [viewIndex, setViewIndex] = useState(0);

    return (
        <View style={styles.container}>
            <View style={styles.WelcomeContainer}>
                <ImageBackground
                    source={require('../../assets/welcome/Background.png')}
                    resizeMode="stretch"
                    style={styles.background}
                >
                    <FlatList
                        style={{ width: windowWidth }}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        pagingEnabled
                        data={sources}
                        keyExtractor={(_, index) => `list_item${index}`}
                        viewabilityConfigCallbackPairs={
                            viewabilityConfigCallbackPairs.current
                        }
                        renderItem={({ item, index }) => {
                            return <View style={{
                                width: windowWidth,
                                alignItems: 'center'
                            }}>
                                <Image
                                    source={item.uri}
                                    style={{
                                        height: 600,
                                        width: 400,
                                    }}
                                />
                                <SemiBoldText
                                    text={item.title}
                                    fontSize={24}
                                    color='#000'
                                    marginTop={-20}
                                />
                                <DescriptionText
                                    text={item.bio}
                                    fontSize={17}
                                    marginTop={5}
                                />
                            </View>
                        }}
                    />
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}>
                        {sources.map((item, index) => {
                            return <View style={{
                                width: 12,
                                height: 12,
                                borderRadius: 10,
                                backgroundColor: index == viewIndex ? '#CB98FB' : '#E4CAFD',
                                marginLeft: 4,
                                marginRight: 4
                            }}
                                key={index.toString() + 'circle'}
                            >

                            </View>
                        })}
                    </View>
                    <View style={[styles.rowSpaceEvenly, { marginBottom: 50, marginTop: 70 }]}>
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => { props.navigation.navigate("PhoneRegister") }}
                        >
                            <Text style={styles.registerText} >{t("Subscribe")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => { props.navigation.navigate('PhoneLogin') }}
                        //onPress={() => props.navigation.navigate('Login')}
                        >
                            <Text style={styles.loginText}>{t("Connect")}</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
            {isWarning && <View style={{ position: "absolute", width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center", top: 50 }}>
                <View style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    backgroundColor: "#E41717",
                    borderRadius: 16,
                    shadowColor: 'rgba(244, 13, 13, 0.47)',
                    elevation: 10,
                    shadowOffset: { width: 0, height: 5.22 },
                    shadowOpacity: 0.5,
                    shadowRadius: 16
                }}>
                    <Text style={{ color: "white", fontSize: 15, lineHeight: 18 }}>{t("You must agree our terms")}</Text>
                </View>
            </View>}
        </View>
    );
};

export default WelcomeScreen;