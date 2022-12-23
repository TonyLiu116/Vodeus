import React, { useState, } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import searchSvg from '../../assets/login/search.svg';
import checkSvg from "../../assets/login/check.svg"
import { windowHeight } from '../../config/config';
import { t } from 'i18next';

export const SearchLanguage = ({
  onSelectLanguage = () => { },
  marginHorizontal,
  height = windowHeight - 340,
  marginTop
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const languages = require('./language.json');
  const [filteredLanguages, setFilteredLanguages] = useState(languages);

  const selectLanguage = (index) => {
    let data = filteredLanguages;
    data.map(eData => {
      eData.checked = false;
    });
    data[index].checked = true;
    setFilteredLanguages(data);
    onSelectLanguage(data[index]);
  }

  const filterLanguage = (keyword) => {
    setSearchKeyword(keyword);
    let data = languages;
    let result = [];
    data.map((dt) => {
      if (dt.language.toLowerCase().indexOf(keyword.toLowerCase()) != -1) {
        result.push(dt);
      }
    });
    setFilteredLanguages(result);
  }

  return (
    <View style={{ marginHorizontal: marginHorizontal, marginTop: marginTop }}>
      <SvgXml
        width="24"
        height="24"
        xml={searchSvg}
        style={{
          position: 'absolute',
          left: 20,
          top: 15,
          zIndex: 2
        }}
      />
      <TextInput
        style={{
          backgroundColor: '#F2F0F5',
          borderRadius: 24,
          fontSize: 17,
          fontFamily: 'SFProDisplay-Regular',
          paddingLeft: 55,
          paddingRight: 16,
          paddingVertical: 12
        }}
        value={searchKeyword}
        placeholder={t("Search")}
        placeholderTextColor="rgba(59, 31, 82, 0.6)"
        onChangeText={(e) => filterLanguage(e)}
      />
      <FlatList
        style={{
          marginTop: 20,
          height: height
        }}
        data={filteredLanguages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => index ? item.language.charAt(0) != filteredLanguages[index - 1].language.charAt(0) ?
          <View key={index + 'searchLanguage'}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 44
              }}
            >
              <Text
                style={{
                  fontFamily: "SFProDisplay-Semibold",
                  fontSize: 20,
                  lineHeight: 24,
                  color: '#281E30'
                }}
              >
                {item.language.charAt(0)}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 44
              }}
              key={index}
              onPress={() => selectLanguage(index)}
            >
              <Text
                style={{
                  fontFamily: "SFProDisplay-Regular",
                  fontSize: 17,
                  lineHeight: 28,
                  color: item.checked ? '#8327D8' : '#281E30'
                }}
              >
                {t(item.language)}
              </Text>
              {item.checked ? <SvgXml width={20} height={20} xml={checkSvg} /> : null}
            </TouchableOpacity>
          </View>
          :
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 44
            }}
            key={index + 'searchLanguage'}
            onPress={() => selectLanguage(index)}
          >
            <Text
              style={{
                fontFamily: "SFProDisplay-Regular",
                fontSize: 17,
                lineHeight: 28,
                color: item.checked ? '#8327D8' : '#281E30'
              }}
            >
              {t(item.language)}
            </Text>
            {item.checked ? <SvgXml width={20} height={20} xml={checkSvg} /> : null}
          </TouchableOpacity>
          :
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 44
              }}
            >
              <Text
                style={{
                  fontFamily: "SFProDisplay-Semibold",
                  fontSize: 20,
                  lineHeight: 24,
                  color: '#281E30'
                }}
              >
                {item.language.charAt(0)}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 44
              }}
              key={index}
              onPress={() => selectLanguage(index)}
            >
              <Text
                style={{
                  fontFamily: "SFProDisplay-Regular",
                  fontSize: 17,
                  lineHeight: 28,
                  color: item.checked ? '#8327D8' : '#281E30'
                }}
              >
                {t(item.language)}
              </Text>
              {item.checked ? <SvgXml width={20} height={20} xml={checkSvg} /> : null}
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
};
