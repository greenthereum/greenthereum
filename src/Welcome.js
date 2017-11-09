import React from 'react'
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native'
import Warning from './Warning'
import List from './List'
import appStyles from './lib/styles'

const styles = StyleSheet.create({
  warning: {
    padding: 20
  },
  picContainer: {
    paddingTop: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  img: {
    width: 96,
    height: 96
  }
})

const etherIcon = require('../assets/img/ico.png')

export default class Welcome extends React.Component {
  constructor(props) {
    super(props)
    this.rootNavigation = this.props.screenProps.rootNavigation
  }

  render() {
    return (
      <View style={appStyles.container}>
        <Warning customStyles={styles.warning} msg='No accounts found'></Warning>
        <Warning customStyles={styles.warning} msg='Please import an Ethereum Address to track.'></Warning>
        <View style={styles.picContainer}>
          <Image source={etherIcon} style={styles.img}/>
        </View>
      </View>
    )
  }
}
