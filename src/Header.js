import React from 'react'
import { Image, StyleSheet, Text, View, TouchableHighlight } from 'react-native'
import appStyles from './lib/styles'

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: appStyles.color.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
    paddingBottom: 20,
    paddingTop: 32
  },
  headerText: {
    fontSize: 20,
    color: 'white'
  },
  headerVersion: {
    fontSize: 8,
    color: 'white'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default class Header extends React.Component {
  constructor(props) {
    super(props)
    this.navigation = this.props.screenProps.rootNavigation
  }
  onPressHeader() {
    console.log('Header pressed')
    this.navigation.goBack()
  }
  render() {
    const version = require('../package.json').version
    console.log('App version:', version)
    return (
      <View style={style.header}>
        <TouchableHighlight underlayColor='transparent' onPress={this.onPressHeader.bind(this)}>
          <View style={style.center}>
            <Text style={style.headerText}>Greenthereum</Text>
            <Text style={style.headerVersion}>{`v${version}`}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
}
