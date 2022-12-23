import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { FlatList } from 'react-native-gesture-handler';

import { SvgXml } from 'react-native-svg';
import searchSvg from '../../assets/login/search.svg';
import checkSvg from "../../assets/login/check.svg"

import { windowHeight } from '../../config/config';

export const SearchCountry = ({
  onSelectCountry = () => { },
  marginHorizontal,
  height = windowHeight - 340,
  marginTop
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const countries = require('../component/country.json');
  const [fiteredCountries, setFilteredCountries] = useState(countries);

  const { t, i18n } = useTranslation();

  const selectCountry = (index) => {
    let data = fiteredCountries;
    data.map(eData => {
      eData.checked = false;
    });
    data[index].checked = true;
    setFilteredCountries(data);
    onSelectCountry(data[index]);
  }

  const filterCountry = (keyword) => {
    setSearchKeyword(keyword);
    let data = countries;
    let result = [];
    data.map((dt) => {
      if (dt.country.toLowerCase().indexOf(keyword.toLowerCase()) != -1) {
        result.push(dt);
      }
    });
    setFilteredCountries(result);
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
          paddingVertical: 12,
          color: "#000000"
        }}
        value={searchKeyword}
        placeholder={t("Search")}
        placeholderTextColor="rgba(59, 31, 82, 0.6)"
        onChangeText={(e) => filterCountry(e)}
      />
      <FlatList
        style={{
          marginTop: 20,
          height: height
        }}
        data={fiteredCountries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => index ? item.country.charAt(0) != fiteredCountries[index - 1].country.charAt(0) ?
          <View key={index + 'searchCountry'}>
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
                {item.country.charAt(0)}
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
              onPress={() => selectCountry(index)}
            >
              <Text
                style={{
                  fontFamily: "SFProDisplay-Regular",
                  fontSize: 17,
                  lineHeight: 28,
                  color: item.checked ? '#8327D8' : '#281E30'
                }}
              >
                {item.country}
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
            key={index + 'serchCountry'}
            onPress={() => selectCountry(index)}
          >
            <Text
              style={{
                fontFamily: "SFProDisplay-Regular",
                fontSize: 17,
                lineHeight: 28,
                color: item.checked ? '#8327D8' : '#281E30'
              }}
            >
              {item.country}
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
                {item.country.charAt(0)}
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
              onPress={() => selectCountry(index)}
            >
              <Text
                style={{
                  fontFamily: "SFProDisplay-Regular",
                  fontSize: 17,
                  lineHeight: 28,
                  color: item.checked ? '#8327D8' : '#281E30'
                }}
              >
                {item.country}
              </Text>
              {item.checked ? <SvgXml width={20} height={20} xml={checkSvg} /> : null}
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
};
