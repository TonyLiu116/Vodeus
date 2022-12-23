import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  Image,
  Animated
} from 'react-native';

import { windowHeight, windowWidth } from '../../config/config';

import { FriendStoryItem } from './FriendStoryItem';

const ITEM_LENGTH = windowWidth - 80;
const CURRENT_ITEM_TRANSLATE_Y = 40;

export const FriendStoryItems = ({
  props,
  data,
  height,
  onChangeLike = () => {}
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [dataWithPlaceholders, setDataWithPlaceholders] = useState(data);
  const currentIndex = useRef(0);
  const flatListRef = useRef(null);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isPrevDisabled, setIsPrevDisabled] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      setDataWithPlaceholders([{id: -1}, ...data, {id: data.length}]);
      currentIndex.current = 1;
      setIsPrevDisabled(true);
    }
  }, [data]);

  const handleOnViewableItemsChagned = useCallback(({ viewableItems }) => {
    const itemsInView = viewableItems.filter((item) => item.id);

    if (itemsInView.length === 0) {
      return;
    }

    currentIndex.current = itemsInView[0].index;
    console.log(currentIndex.current)

    setIsPrevDisabled(currentIndex.current === data.length);
    setIsPrevDisabled(currentIndex.current === 1);
  }, [data]);

  const getItemLayout = (_data, index) => ({
    length: ITEM_LENGTH,
    offset: ITEM_LENGTH * (index - 1),
    index,
  });

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({item, index}) => {
          return <FriendStoryItem
            key={index + item.id}
            props={props}
            itemIndex={index}
            info={item}
            height={height}
            storyLength={data.length}
            onMoveNext={(index1) => {
              flatListRef.current?.scrollToIndex({ animated: true, index: index1 })
            } }
            onChangeLike={(isLiked) => onChangeLike(index, isLiked)}
          />
        }}
        getItemLayout={getItemLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        bounces={false}
        decelerationRate={0}
        renderToHardwareTextureAndroid
        snapToInterval={ITEM_LENGTH}
        snapToAlignment="start"
        scrollEventThrottle={16}
        onViewableItemsChanged={handleOnViewableItemsChagned}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 100
        }}
      />
    </View>
  )
}