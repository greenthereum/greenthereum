import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight
} from 'react-native'

const styles = StyleSheet.create({
  navigation: {
    flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#F5F5F5' // material grey 100
  },
  bottomGrid: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
  bottomBtn: {
    width: 32,
    height: 32
  },
  font10: {
    fontSize: 10
  },
  col: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
})
const importBtn = require('../assets/img/download.png')
const settingsBtn = require('../assets/img/settings.png')

export default class BottomNav extends React.Component {
  constructor(props) {
    super(props)
    this.openImport = this.openImport.bind(this)
    this.openPreferences = this.openPreferences.bind(this)
    this.showDetails = this.showDetails.bind(this)

    this.navigation = this.props.screenProps.rootNavigation
    this.mainComponent = this.props.screenProps.mainComponent
  }
  openImport() {
    console.log('Import()')
    this.navigation.navigate('Import', {
      mainComponent: this.mainComponent
    })
  }
  openPreferences() {
    console.log('settings')
    this.navigation.navigate('Preferences', {
      mainComponent: this.mainComponent
    })
  }
  showDetails() {
    console.log('details')
  }

  render() {
    return (
      <View style={styles.navigation}>
        <View style={styles.bottomGrid}>
          <TouchableHighlight key="add" underlayColor='transparent' onPress={this.openImport}>
            <View style={styles.col}>
              <Image style={styles.bottomBtn} source={importBtn}></Image>
              <Text style={styles.font10}>Import</Text>
            </View>
         </TouchableHighlight>
        </View>
        <View style={styles.bottomGrid}>
          <TouchableHighlight key="confs" underlayColor='transparent' onPress={this.openPreferences}>
            <View style={styles.col}>
                <Image style={styles.bottomBtn} source={settingsBtn}></Image>
              <Text style={styles.font10}>Preferences</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}
