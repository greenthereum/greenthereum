import React from 'react'
import {
  Alert,
  AsyncStorage,
  FlatList,
  Image,
  NetInfo,
  StyleSheet,
  TouchableHighlight,
  Text,
  View
} from 'react-native'
import List from './List'
import Welcome from './Welcome'
import Footer from './Footer'
import BottomNav from './BottomNav'
import ActivityIndicatorLayer from './ActivityIndicatorLayer'
import RefreshButton from './components/Main/RefreshButton'
import empty from 'empty-value'

import {STG_STATE, CURRENCIES} from './lib/constants'
import API from './lib/api'
import {convertBalanceFromWei} from './lib/utils'
import appStyles from './lib/styles'
import getConversionRates from './lib/currency'
const debounce = require('lodash.debounce')
const offlineImg = require('../assets/img/offline.png')

export default class Main extends React.Component {
  static navigationOptions = {
    headerTitle: 'Greenthereum',
    headerStyle: appStyles.headerStyle,
    headerTitleStyle: appStyles.headerTitleMain
  }
  constructor(props) {
    super(props)
    this.state = {
      screen: 'Main',
      wallets: [],
      stats: {
        ethbtc: null,
        ethusd: null,
        supply: null
      },
      preferences: {
        currency: CURRENCIES.DEFAULT,
      },
      conversionRates: {},
      cached: false,
      date: null,
      loading: false,
      isConnected: true
    }
    this.navigation = this.props.navigation
    this.refresh =this.refresh.bind(this)
    this.updateBackupState = this.updateBackupState.bind(this)
    this.loadConversionRates = this.loadConversionRates.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
    this.loadApp = this.loadApp.bind(this)
    this.fetchData = debounce(this.fetchData.bind(this), API.const.MIN_REQUEST_TIME, {
      'leading': true,
      'trailing': false
    })

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  handleConnectivityChange(isConnected) {
    console.log('Change: User is ' + (isConnected ? 'online' : 'offline'))
    this.setState((prevState) => {
      return { isConnected: isConnected }
    })
  }

  componentDidMount() {
    this.loadApp()
  }

  async loadApp() {
    console.log('loading App...')
    this.setState({ loading: true })
    try {
      await this.loadBackupState()
      if (this.state.wallets.length) {
        await this.loadConversionRates()
        this.fetchData()
      } else { // no wallets found
        this.setState((prevState) => ({ loading: false }))
      }
    } catch (err) {
      console.log('loadApp error:', (err))
      this.setState({ loading: false })
      this.showAlert(
        `Can't load the app`,
        'Something went wrong.\nTry restarting the app or contact us.',
        err)
    }
  }

  loadConversionRates() {
    console.log('loadConversionRates')
    if (this.state.conversionRates && this.state.conversionRates.date) {
      console.log('Backed conversionRates found', JSON.stringify(this.state.conversionRates))
      // load from Backup
      this.setState((prevState) => ({ conversionRates: this.state.conversionRates }))
      const now = new Date()
      const conversionsBackupDate = new Date(Date.parse(this.state.conversionRates.date))
      // (Wait 2 days before update conversionRates)
      conversionsBackupDate.setDate(conversionsBackupDate.getDate() + 2)
      if (conversionsBackupDate >= now) {
        console.log(`Using conversions backup from: ${conversionsBackupDate}`)
        return Promise.resolve()
      }
    }
    if (this.state.isConnected) {
      console.log('fetching and update conversionRates...')
      return getConversionRates() // Update conversion rates
        .then(response => response.json())
        .then(data => {
          if (data.rates) {
            data.date = new Date() // Override date from the reponse (sometime gets stuck)
            this.setState((prevState) => ({ conversionRates: data }))
            this.updateBackupState('conversionRates')
          }
        })
        .catch((err) => {
          // reset to USD
          this.setState((prevState) => ({ loading: false }))
          if (!this.state.conversionRates.rates) {
            // Important: In this state the App is unable to convert currencies
            this.showAlert(
              `Can't load any currency rates`,
              'All amounts will be shown in USD, try restart the App.',
              err)
          } else {
            this.showAlert('Error: Updating conversion rates', '', err)
          }
        })
    }
  }

  showAlert(title, msg,  err) {
    Alert.alert(
      title,
      `${msg}\n\n` +
      `Error info:\n` +
      `${err}.`,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      { cancelable: false }
    )
  }

  updateBackupState(msg) {
    console.log(`Updating backup: ${msg}`, JSON.stringify(this.state))
    const backup = Object.assign({}, this.state)
    // this can't be saved or lead to wrong behaviuors
    delete backup.isConnected
    delete backup.loading

    return AsyncStorage.setItem(STG_STATE, JSON.stringify(backup))
  }

  async loadBackupState() {
    try {
      const backup = await AsyncStorage.getItem(STG_STATE)
      const backupState = JSON.parse(backup)
      if (backupState && !empty(backupState)) {
        console.log(`load Backup: ${backup}`)
        backupState.loading = false
        backupState.cached = true

        return new Promise((resolve, reject) => {
          this.setState(backupState, () => {
            resolve(backupState)
          })
        })
      } else {
        console.log('no backup found')
        return Promise.resolve({})
      }
    } catch (err) {
      console.log('loading backup error:', err)
    }
  }

  fetchData() {
    console.log('fetchData()')
    this.setState({ loading: true })
    if (this.state.isConnected) {
      // Fetch server data
      return Promise.all([API.getStats(), API.getAccounts(this.state.wallets)])
      .then((responses) => {
        return Promise.all([responses[0].json(), responses[1].json()])
      })
      .then((jsons) => {
        const stats = jsons[0].result
        const accountsResult = jsons[1].result
        const backupWallets = this.state.wallets
        const items = accountsResult.map((account) => {
          const balance = convertBalanceFromWei(account.balance)
          const usdBalance = (balance * Number(stats.ethusd)).toFixed(2)
          const accountAddress = account.account
          const backupAcc = backupWallets.find((acc) => acc.key === accountAddress)
          return {
            name: backupAcc.name,
            key: accountAddress,
            balance: balance,
            usd: usdBalance
          }
        })

        this.setState({
          wallets: items,
          loading: false,
          date: new Date(),
          stats: {
            ethbtc: stats.ethbtc,
            ethusd: stats.ethusd
          }
        })
        this.updateBackupState('(stats, accounts):')
      })
      .then(API.getTotalSupply)
      .then((response) => response.json())
      .then((json) => {
        this.setState((prevState) => ({
          stats: Object.assign(this.state.stats, {
            supply: convertBalanceFromWei(json.result)
          })
        }))
        this.updateBackupState('(total supply):')
      })
      .catch((err) => {
        console.log(err)
      })
    } else {
      console.log('No internet connection found')
    }
  }

  refresh() {
    console.log('refresh()')
    this.fetchData()
  }
  render() {
    const screenProps = {
      rootNavigation: this.navigation,
      mainState: this.state,
      mainComponent: this
    }
    const offlineStyle = {
      display: this.state.isConnected ? 'none': 'flex',
      position: 'absolute',
      bottom: 78,
      left: 20,
      zIndex: 10
    }
    const content = !this.state.wallets.length ?
      <Welcome screenProps={screenProps}></Welcome> :
      <List screenProps={screenProps} date={this.state.date} items={this.state.wallets}></List>
    return (
      <View style={styles.container}>
        {
          this.state.wallets.length ?
            <RefreshButton action={this.refresh}/> :
            undefined
        }
        <View style={[appStyles.center, styles.homeTitle]}>
          <Text style={styles.homeTitleText}>Wallets</Text>
        </View>
        <View style={offlineStyle}>
          <Image source={offlineImg} style={styles.img}/>
        </View>

        {
          this.state.loading ?
            <ActivityIndicatorLayer animating={true}></ActivityIndicatorLayer> :
            content
        }
        {
          this.state.stats.ethusd ?
            <Footer screenProps={screenProps}></Footer> :
            null
        }

        <BottomNav screenProps={screenProps}></BottomNav>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: appStyles.container,
  img: {
    width: 35,
    height: 35
  },
  homeTitle: {
    backgroundColor: appStyles.color.primary[400],
    height: 32
  },
  homeTitleText: {
    fontSize: 16,
    color: appStyles.color.white
  }
})
