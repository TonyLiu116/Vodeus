import React from "react";
import { View } from "react-native";

export const MyProgressBar = ({
  progress,
  dag = 6
}) => {
  let tp = [];
  for (let i = 0; i < dag; i++) tp.push(i);
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {
        tp.map((el, index) => <View
          key={"ProgressBar"+index.toString()}
          style={{
            height: 8,
            width: 8,
            borderRadius: 4,
            backgroundColor: progress == index ? '#8327D8' : 'rgba(255, 255, 255, 0.6)',
            marginHorizontal: 12
          }}>
        </View>)
      }
    </View>
  );
};
