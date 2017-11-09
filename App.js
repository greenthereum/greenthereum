import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigator } from 'react-navigation'
import Main from './src/Main'
import ImportAccount from './src/ImportAccount'
import Details from './src/Details'
import Preferences from './src/Preferences'

const screens = {
  Home: { screen: Main },
  Import: { screen: ImportAccount },
  Details: { screen: Details },
  Preferences: { screen: Preferences}
}
// init router
const Greenthereum = StackNavigator(screens)

export default class App extends React.Component {
  render() {
    return <Greenthereum />
  }
}
