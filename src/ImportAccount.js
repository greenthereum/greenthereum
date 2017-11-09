import React from 'react'
import {
  AsyncStorage,
  StyleSheet,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableHighlight,
  View
  } from 'react-native'
import appStyles from './lib/styles'
import {isEthereumAddress} from './lib/utils'
import {STG_ADDRESSES} from './lib/constants'
const QR_APP_LINK = 'https://play.google.com/store/apps/details?id=tw.mobileapp.qrcode.banner'

export default class ImportAccount extends React.Component {
  static navigationOptions = {
    headerTitle: 'Add account to track',
    headerStyle: appStyles.headerStyle,
    headerTitleStyle: appStyles.headerTitle,
    headerTintColor: appStyles.color.white
  }

  constructor(props) {
    super(props)
    this.navigation = this.props.navigation
    this.importAccount = this.importAccount.bind(this)
    this.qrScanApp = this.qrScanApp.bind(this)
    this.updateText = this.updateText.bind(this)
    this.state = {
      valid: true,
      address: ''
    }
  }

  componentDidMount() {
    const { params } = this.navigation.state
    this.mainComponent = params.mainComponent
  }

  importAccount() {
    const newAddress = this.state.address
    if (isEthereumAddress(newAddress)) {
      console.log('mergeItem', newAddress)
      AsyncStorage.getItem(STG_ADDRESSES)
        .then((addressesStr) => {
          if (addressesStr) {
            // update
            const addresses = JSON.parse(addressesStr)
            addresses.push(newAddress)
            AsyncStorage.setItem(STG_ADDRESSES, JSON.stringify(addresses))
          } else {
            AsyncStorage.setItem(STG_ADDRESSES, JSON.stringify([newAddress]))
          }
        })
        .then(() => {
          console.log('address updated')
          // refresh main State even offline
          this.mainComponent.setState((prevState) => {
            const newAccount = {
              key: newAddress,
              balance: 0,
              usd: 0
            }
            return {
              accounts: prevState.accounts.concat([newAccount])
            }
          })
          this.mainComponent.refresh()
          this.navigation.goBack()
        })
    } else {
      this.setState({ valid: false })
    }
  }

  qrScanApp() {
    console.log('qrScan pressed')
    Linking.openURL(QR_APP_LINK)
      .catch(err => console.error('An error occurred', err))
  }

  updateText(text){
    this.setState({
      address: text,
      valid: isEthereumAddress(text)
    })
  }

  render() {
    const importBtn = require('../assets/img/download.png')
    const qrBtn = require('../assets/img/qr-scan.png')
    const screenProps = {
      rootNavigation: this.navigation
    }
    const inputValidation = this.state.valid ?
      undefined :
      <Text style={style.validation}>Please paste or write a valid address</Text>
    return (
      <View style={style.container}>
        <View style={style.center}>
          <View style={style.inputContainer}>
            <TextInput
              style={style.input}
              placeholder="Paste your ethereum address"
              onChangeText={this.updateText}
              autoFocus={true}
              autoCorrect={false}
              blurOnSubmit={true}
              maxLength={42}
              returnKeyType='send'
              onSubmitEditing={this.importAccount}
            />
          </View>
          {inputValidation}
        </View>
        <View style={style.containerSubmit}>
          <TouchableHighlight underlayColor='transparent' onPress={this.importAccount}>
            <Image
              style={style.img}
              source={importBtn}>
            </Image>
         </TouchableHighlight>
        </View>
        <View style={[style.center, style.scan]}>
          <Text style={style.qrText}>
            Or just scan the QR Code and copy the address.
          </Text>
          <TouchableHighlight underlayColor='transparent' onPress={this.qrScanApp}>
            <Image
              style={style.img}
              source={qrBtn}>
            </Image>
         </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const style = StyleSheet.create({
  inputContainer: {
    paddingTop: 10
  },
  input: {
    height: 60,
    width: 300,
    padding: 20
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerSubmit: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    paddingTop: 20
  },
  img: {
    width: 64,
    height: 64
  },
  validation: {
    paddingTop: 5,
    color: '#F44336' // material red 500
  },
  scan: {
    paddingTop: 30
  },
  qrText: {
    paddingBottom: 10,
    fontSize: 12
  }
})
