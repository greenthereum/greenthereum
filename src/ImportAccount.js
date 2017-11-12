import React from 'react'
import {
  AsyncStorage,
  StyleSheet,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  ScrollView
  } from 'react-native'
import appStyles from './lib/styles'
import {isEthereumAddress} from './lib/utils'
const QR_APP_LINK = 'https://play.google.com/store/apps/details?id=tw.mobileapp.qrcode.banner'

export default class ImportAccount extends React.Component {
  static navigationOptions = {
    headerTitle: 'Add address to track',
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
    this.updateName = this.updateName.bind(this)
    this.state = {
      validAddress: true,
      address: '',
      name: ''
    }
  }

  componentDidMount() {
    const { params } = this.navigation.state
    this.mainComponent = params.mainComponent
  }
  // TODO: Add unit tests to this
  importAccount() {
    const newAddress = this.state.address
    const newName = this.state.name.trim() || this.state.address
    const newWallet = {
      name: newName,
      key: newAddress,
      balance: 0,
      usd: 0
    }
    if (isEthereumAddress(newAddress)) {
      console.log('mergeItem', newWallet)
      const wallets = this.mainComponent.state.wallets
      // add if it is not stored already
      if (!wallets.find((wallets) => wallets.key === newAddress)) {
        // refresh main State even offline
        this.mainComponent.setState((prevState) => {
          return {
            wallets: prevState.wallets.concat([newWallet])
          }
        }, () => {
          console.log('main state wallets updated')
          this.mainComponent.refresh()
          this.mainComponent.updateBackupState('Wallets')
          this.navigation.goBack()
        })
      } else {
        console.log('Address already exists')
        this.navigation.goBack()
      }
    } else {
      this.setState({ validAddress: false })
    }
  }

  qrScanApp() {
    console.log('qrScan pressed')
    Linking.openURL(QR_APP_LINK)
      .catch(err => console.error('An error occurred', err))
  }

  updateText(text) {
    this.setState({
      address: text,
      validAddress: isEthereumAddress(text)
    })
  }

  updateName(text) {
    this.setState({ name: text })
  }

  render() {
    const importBtn = require('../assets/img/download.png')
    const qrBtn = require('../assets/img/qr-scan.png')
    const screenProps = {
      rootNavigation: this.navigation
    }
    const inputValidation = this.state.validAddress ?
      undefined :
      <Text style={style.validation}>Please paste or write a valid address</Text>
    return (
      <ScrollView style={style.container}>
        <View>
          <Text style={style.label}>Name</Text>
          <View style={style.formInput}>
            <TextInput
              style={style.input}
              placeholder="My cool ethers"
              onChangeText={this.updateName}
              autoCorrect={false}
              maxLength={42}
            />
          </View>
        </View>
        <View>
          <Text style={style.label}>Address</Text>
          <View style={style.formInput}>
            <TextInput
              style={style.input}
              placeholder="Ethereum public address"
              onChangeText={this.updateText}
              autoCorrect={false}
              blurOnSubmit={true}
              maxLength={42}
              returnKeyType='send'
              onSubmitEditing={this.importAccount}
            />
            {inputValidation}
          </View>
        </View>
        <View style={style.containerSubmit}>
          <TouchableHighlight underlayColor='transparent' onPress={this.importAccount}>
            <Image
              style={style.img}
              source={importBtn}>
            </Image>
         </TouchableHighlight>
        </View>
        <View style={[appStyles.center, style.scan]}>
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
      </ScrollView>
    )
  }
}

const style = StyleSheet.create({
  label: {
    paddingTop: 10,
    marginLeft: 40,
    color: appStyles.color.secundary[900]
  },
  input: {
    height: 60
  },
  formInput: {
    marginLeft: 40,
    marginRight: 40
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
