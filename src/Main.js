import React from 'react'
import {
  Alert,
  AsyncStorage,
  FlatList,
  Image,
  NetInfo,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native'
import List from './List'
import Welcome from './Welcome'
import Footer from './Footer'
import BottomNav from './BottomNav'
import ActivityIndicatorLayer from './ActivityIndicatorLayer'
import {STG_ADDRESSES, STG_STATE, CURRENCIES} from './lib/constants'
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
      accounts: [],
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
      loading: true,
      isConnected: true
    }
    this.navigation = this.props.navigation
    this.getAccounts = this.getAccounts.bind(this)
    this.refresh =this.refresh.bind(this)
    this.getPreferences = this.getPreferences.bind(this)
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
    this.setState({ loading: true })
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('User is ' + (isConnected ? 'online' : 'offline'))
      this.setState((prevState) => {
        return { isConnected: isConnected }
      }, this.loadApp)
    })
  }

  loadApp() {
    AsyncStorage.getItem(STG_ADDRESSES)
      .then((result) => {
        if (result) {
          Promise.all([
            this.getPreferences(),
            this.loadConversionRates()
          ])
            .catch((err) => {
              const title = `Error: Fetching App's data`
              const msg =   `- Please ensure you are connected to the internet and restart the app.\n` +
                `- If the error persists open an issue and attach this message.`
              this.setState({ loading: false })
              this.showAlert(title, msg, err)
            })
            .then(() => {
              this.setState({ loading: false })
            })
            .then(this.fetchData)
        } else {
          console.log('No accounts found')
          this.setState({ loading: false })
        }
      })
      .catch((err) => {
        console.log(err)
        this.setState({ loading: false })
      })

  }

  getPreferences() {
    return AsyncStorage.getItem(STG_STATE)
      .then((result) => result ? JSON.parse(result) : {})
      .then(backupState => {
        if (backupState.preferences) {
          console.log('getPreferences ok')
          this.setState((prevState) => {
            return {
              preferences: backupState.preferences
            }
          })
        }
      })
      .catch((err) => {
        console.log('No preferences loaded', err)
      })
  }

  loadConversionRates() {
    console.log('loadConversionRates')
    return AsyncStorage.getItem(STG_STATE)
      .then((result) => result ? JSON.parse(result) : {})
      .then(backupState => {
        if (backupState.conversionRates && backupState.conversionRates.date) {
          console.log('Backed conversionRates found', JSON.stringify(backupState.conversionRates))
          // load from Backup
          this.setState((prevState) => ({ conversionRates: backupState.conversionRates }))
          const now = new Date()
          const conversionsBackupDate = new Date(Date.parse(backupState.conversionRates.date))
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
                this.updateBackupState('update backup conversionRates')
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
      })
      .catch((err) => {
        console.log('No backup state found', err)
      })
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
    console.log(msg, JSON.stringify(this.state))
    const backup = Object.assign({}, this.state)
    // this can't be saved or lead to wrong behaviuors
    delete backup.isConnected
    delete backup.loading

    return AsyncStorage.setItem(STG_STATE, JSON.stringify(backup))
  }

  fetchData() {
    console.log('getStats()')
    this.setState({
      loading: true
    })
    if (this.state.isConnected) {
      // Fetch server data
      Promise.all([API.getStats(), this.getAccounts()])
      .then((responses) => {
        return Promise.all([responses[0].json(), responses[1].json()])
      })
      .then((jsons) => {
        const stats = jsons[0].result
        const accounts = jsons[1].result
        const items = accounts.map((account) => {
          const balance = convertBalanceFromWei(account.balance)
          const usdBalance = (balance * Number(stats.ethusd)).toFixed(2)
          return {
            key: account.account,
            balance: balance,
            usd: usdBalance
          }
        })

        this.setState({
          accounts: items,
          loading: false,
          date: new Date(),
          stats: {
            ethbtc: stats.ethbtc,
            ethusd: stats.ethusd
          }
        })
        this.updateBackupState('update backup (stats, accounts):')
      })
      .then(API.getTotalSupply)
      .then((response) => response.json())
      .then((json) => {
        this.setState((prevState) => ({
          stats: Object.assign(this.state.stats, {
            supply: convertBalanceFromWei(json.result)
          })
        }))
        this.updateBackupState('update backup (total supply):')
      })
      .catch(this.loadBackup.bind(this))
    } else {
      this.loadBackup('No internet connection found')
    }
  }

  getAccounts() {
    console.log(`getAccounts() in ${STG_ADDRESSES}`)
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(STG_ADDRESSES)
        .then((result) => result ? JSON.parse(result) : [])
        .then(API.getAccounts)
        .then(resolve)
        .catch(reject)
    })
  }

  loadBackup(err) { // load Backup
    console.log('fetchData ERROR:', err)
    AsyncStorage.getItem(STG_STATE)
      .then(backup => JSON.parse(backup))
      .then((backupState) => {
        console.log(`using backup state from ${backupState.date}`)
        backupState.loading = false
        backupState.isConnected = false
        backupState.cached = true
        this.setState(backupState)
      })
      .catch((err) => {
        console.log('No backup found:', err)
        this.setState({
          loading: false
        })
      })
  }

  removeAddresses() {
    AsyncStorage.removeItem(STG_ADDRESSES)
      .then(() => {
        console.log('all addresses removed')
        this.setState({
          accounts: []
        })
      })
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
      top: 5,
      right: 7,
      zIndex: 10
    }
    const content = !this.state.accounts.length ?
      <Welcome screenProps={screenProps}></Welcome> :
      <List screenProps={screenProps} date={this.state.date} items={this.state.accounts}></List>
    return (
      <View style={styles.container}>
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
    width: 32,
    height: 32
  }
})
