import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

export default function (props) {
  return (
    <View>
      <Text style={style.small}>Fetching {props.msg}...</Text>
    </View>
  )
}

const style = StyleSheet.create({
  small: {
    fontSize: 10
  }
})
