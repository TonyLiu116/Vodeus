import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal,
    Pressable,
    View,
    Image,
    TouchableOpacity,
    Text,
    Platform,
    FlatList,
    ScrollView,
    ImageBackground,
    SafeAreaView
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { styles } from '../style/Common';
import { Avatars, Months, windowHeight, windowWidth } from '../../config/config';
import { LinearTextGradient } from 'react-native-text-gradient';
import VoiceService from '../../services/VoiceService';
import leftArrowSvg from '../../assets/Feed/leftArrow.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { SvgXml } from 'react-native-svg';
import * as Progress from "react-native-progress";

const CalendarScreen = (props) => {

    const params = props.navigation.state.params;
    const { t, i18n } = useTranslation();
    let { user } = useSelector(state => state.user);

    const mounted = useRef(false);
    const scrollRef = useRef();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let numbers = [];
    for (let i = 0; i < 42; i++) {
        numbers.push(i);
    }

    const [historyInfo, setHistoryInfo] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCalendarStories = () => {
        setLoading(true);
        VoiceService.getCalendarStories().then(async res => {
            if (res.respInfo.status === 200) {
                const jsonRes = await res.json();
                let temp = [];
                for (let i = 0; i < 36; i++) {
                    let tempMonth = [];
                    for (let k = 0; k < 32; k++) {
                        tempMonth.push([]);
                    }
                    temp.push(tempMonth);
                }
                let mx = 0;
                jsonRes.forEach((el, index) => {
                    let el_day = parseInt(el.createdAt.split('-')[2]);
                    let el_month = parseInt(el.createdAt.split('-')[1]);
                    let el_year = parseInt(el.createdAt.split('-')[0]);
                    let md = (new Date().getFullYear() - el_year) * 12 + new Date().getMonth() - el_month + 1;
                    if (temp[md][el_day].find(v => v.user.id == el.user.id))
                        return;
                    temp[md][el_day].push(el);
                    if (md > mx)
                        mx = md;
                });
                temp = temp.slice(0, mx + 1);
                temp.reverse();
                setHistoryInfo([...temp]);
                setLoading(false);
            }
        })
            .catch(err => {
                console.log(err);
            })
    }

    useEffect(() => {
        mounted.current = true;
        getCalendarStories();
        return () => {
            mounted.current = false;
        }
    }, [])

    return (
        <SafeAreaView
            style={{
                backgroundColor: '#FFF',
                flex: 1
            }}
        >
            <View style={[styles.rowSpaceBetween, { marginTop: 31, paddingHorizontal: 20, marginBottom: 15 }]}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                    <SvgXml
                        xml={leftArrowSvg}
                    />
                </TouchableOpacity>
                <TitleText
                    text={t("Memories")}
                    fontSize={21}
                    lineHeight={21}
                    color="#B375F6"
                />
                <View style = {{
                    width:22,
                    height:1
                }}>
                </View>
            </View>
            {useMemo(() => {
                return <FlatList
                    ref={scrollRef}
                    data={historyInfo}
                    onContentSizeChange={() => {
                        let md = new Date().getMonth() - params.activeMonth+1;
                        md = Math.max(0, historyInfo.length - md - 1);
                        if( md > historyInfo.length-1 )
                            md = 0;
                        if (historyInfo.length > 0)
                            scrollRef.current?.scrollToIndex({ index: md, animated: true })
                    }}
                    renderItem={({ item, index }) => {
                        let tempDate = new Date();
                        tempDate.setMonth(new Date().getMonth() - (historyInfo.length - 1 - index));
                        tempDate.setDate(1);
                        let startNum = tempDate.getDay();
                        return <View key={"el_month" + index.toString()}>
                            <TitleText
                                text={t(Months[tempDate.getMonth()]) + ' ' + tempDate.getFullYear()}
                                fontSize={18}
                                lineHeight={22}
                                marginLeft={25}
                            />
                            <View style={{
                                flexDirection: 'row',
                                marginTop: 12
                            }}>
                                {days.map((el, index) => <View style={{
                                    width: windowWidth / 7,
                                    height: 35.7,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                    key={"days" + index.toString()}
                                >
                                    <DescriptionText
                                        text={el}
                                        fontSize={13}
                                        lineHeight={15}
                                        color='#333333'
                                    />
                                </View>)}
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                marginTop: 50
                            }}>
                                {numbers.map((el, index) => {
                                    let el_day = new Date(2022, tempDate.getMonth());
                                    el_day.setDate(index - startNum+1);
                                    let len = item[el_day.getDate()].length;
                                    return <TouchableOpacity
                                        style={{
                                            width: windowWidth / 7,
                                            height: 52,
                                            alignItems: 'center',
                                            marginBottom: 20
                                        }}
                                        key={"el_day" + index.toString()}
                                        onPress={() => props.navigation.navigate("Home", { selectedMonth: el_day.getMonth(), selectedDay: el_day.getDate(), selectedYear: el_day.getFullYear() })}
                                    >
                                        <DescriptionText
                                            text={el_day.getDate()}
                                            fontSize={20}
                                            lineHeight={25}
                                            color={el_day.getMonth() == tempDate.getMonth() ? '#333333' : '#E0E0E0'}
                                        />
                                        {el_day.getMonth() == tempDate.getMonth() && <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-evenly',
                                            width: (windowWidth - 150) / 7,
                                            marginTop: 4
                                        }}>
                                            {item[el_day.getDate()].map((el, index) => {
                                                if (index > 2) return null;
                                                return <Image
                                                    source={el.user.avatar ? { uri: el.user.avatar.url } : Avatars[el.user.avatarNumber].uri}
                                                    style={{ width: 20, height: 20, borderRadius: 13 }}
                                                    key={"cal_user" + index.toString()}
                                                />
                                            }
                                            )}
                                            {len > 3 && <View style={{
                                                position: 'absolute',
                                                bottom: 2,
                                                right: -3
                                            }}>
                                                <TitleText
                                                    text={"+" + (len - 3).toString()}
                                                    fontSize={15}
                                                    color="#FFF"
                                                    lineHeight={18}
                                                />
                                            </View>
                                            }
                                        </View>}
                                    </TouchableOpacity>
                                })}
                            </View>
                        </View>
                    }}
                    keyExtractor={(item, index) => index.toString()}
                />
            }, [historyInfo])}
            {loading &&
                <View style={{
                    position: 'absolute',
                    width: windowWidth,
                    alignItems: 'center',
                    marginTop: 150,
                    elevation: 20
                }}>
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="rgba(0, 0, 255, .7)"
                        style={{ alignSelf: "center" }}
                    />
                </View>
            }
        </SafeAreaView>
    );
};

export default CalendarScreen;