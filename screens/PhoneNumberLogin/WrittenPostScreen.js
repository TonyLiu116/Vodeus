import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { useSelector } from 'react-redux';
import '../../language/i18n';
import { MyButton } from '../component/MyButton';
import { SemiBoldText } from '../component/SemiBoldText';

const WrittenPostScreen = (props) => {

    const { t, i18n } = useTranslation();

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    let { user } = useSelector((state) => {
        return (
            state.user
        )
    });

    return (
        <ImageBackground
            source={require('../../assets/login/writtenPostBackground.png')}
            resizeMode="cover"
            style={{ flex: 1, width: '100%', height: '100%' }}
        >
            <View
                style={{
                    position: 'absolute',
                    width: '100%',
                    alignItems: 'center',
                    top:240
                }}
            >
                <ImageBackground
                    source={require('../../assets/login/writtenContentBackground.png')}
                    resizeMode="cover"
                    style={{ justifyContent:'center', width: 318, height: 201 }}
                >
                    <View style={{
                        width:'100%',
                        alignItems:'center'
                    }}>
                        <SemiBoldText
                            text={t("Hey! Hello ")+user.name+'.'}
                            fontSize={15}
                            lineHeight={28}
                            color='#000'
                        />
                        <SemiBoldText
                            text={t("Why don't you introduce yourself to the community?")}
                            fontSize={15}
                            textAlign='center'
                            lineHeight={28}
                            color='#000'
                        />
                        <SemiBoldText
                            text={t("Where are you from? How old are you?")}
                            fontSize={15}
                            lineHeight={28}
                            color='#000'
                        />
                        <SemiBoldText
                            text={t("What do you like to do in life?")}
                            fontSize={15}
                            lineHeight={28}
                            color='#000'
                        />
                    </View>
                </ImageBackground>
            </View>

            <View
                style={{
                    position: 'absolute',
                    paddingHorizontal: 16,
                    width: '100%',
                    bottom: 20,
                    alignItems:'center',
                }}
            >
                <MyButton
                    label={t("Next")}
                    onPress={() => onNavigate('AddFriend')}
                />
            </View>
        </ImageBackground>
    );
};

export default WrittenPostScreen;