import React from 'react'
import {
  AsyncStorage,
  StyleSheet,
  Image,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  FlatList
  } from 'react-native'
import QRCode from 'react-native-qrcode'
import ActivityIndicatorLayer from './ActivityIndicatorLayer'
import Warning from './Warning'
import {
  convertBalanceFromWei,
  convertUSDFromRate,
  formatCurrency,
  formatDate,
  formatNumber,
  getShortAddress,
  processCurrency
} from './lib/utils'
import API from './lib/api'
import appStyles from './lib/styles'
import * as constants from './lib/constants'

const debounce = require('lodash.debounce')
const imgDown = require('../assets/img/downGreen.png')
const imgUp = require('../assets/img/upRed.png')
const imgChecked = require('../assets/img/checked.png')

export default class Details extends React.Component {
  static navigationOptions = {
    headerTitle: 'Account overview',
    headerStyle: appStyles.headerStyle,
    headerTitleStyle: appStyles.headerTitle,
    headerTintColor: appStyles.color.white
  }
  constructor(props) {
    super(props)
    this.state = {
      account: {},
      cached: false,
      currency: constants.CURRENCIES.DEFAULT,
      transactions: {
        data: [],
        date: null
      },
      txMsg: '',
      txLoading: true
    }
    this.rootNavigation = this.props.navigation
    this.printTransaction = this.printTransaction.bind(this)
    this.loadTxsBackup = this.loadTxsBackup.bind(this)
    this.getTransactions = debounce(this.getTransactions.bind(this), API.const.MIN_REQUEST_TIME, {
      'leading': true,
      'trailing': false
    })
  }

  componentDidMount() {
    const { params } = this.rootNavigation.state
    this._isMounted = true // avoid: Can only update mounted components error
    this.mainComponent = params.mainComponent
    const appState = this.mainComponent.state
    this.setState((prevState) => {
      return {
        account: params.account,
        currency: appState && appState.preferences.currency
      }
    })
    this.getTransactions(params.account)
  }

  getTransactions(account) {
    console.log(`get transactions for ${account.key}`)
    API.getNormalTransactions({ address: account.key})
      .then((response) => response.json())
      .then((json) => {
        console.log('getNormalTransactions:', json.message)
        if (this._isMounted) {
          this.setState((prevState) => ({txMsg: json.message}))
        }
        return json.message === 'OK' && json.result || []
      })
      .then((transactions) => {
        console.log(`found ${transactions.length} txs`)
        const txs = transactions.map((tx) => {
          return {
            key: tx.hash,
            date: new Date(Number(tx.timeStamp) * 1000),
            value: convertBalanceFromWei(tx.value),
            blockNumber: tx.blockNumber,
            confirmations: tx.confirmations,
            from: tx.from,
            to: tx.to,
            in: tx.to.toLowerCase() === account.key.toLowerCase()
          }
        })
        if (this._isMounted) {
          const transactions = {
            data: txs,
            date: new Date()
          }
          this.setState((prevState) => {
            return {
              cached: false,
              transactions: transactions,
              txLoading: false
            }
          })
          console.log(`update backup for ${account.key} transactions:`, txs.length)
          const keyStorage = constants.STG_ACCOUNT_TXS + account.key.toLowerCase()
          AsyncStorage.setItem(keyStorage, JSON.stringify(transactions))
        }
      })
      .catch((err) => {
        const keyStorage = constants.STG_ACCOUNT_TXS + account.key.toLowerCase()
        this.loadTxsBackup(err, keyStorage)
      })
  }

  componentWillUnmount() {
    this._isMounted = false // avoid: Can only update mounted components error
  }

  loadTxsBackup(err, keyStorage) { // load Backup
    console.log('getTransactions ERROR:', err)
    AsyncStorage.getItem(keyStorage)
      .then(response => JSON.parse(response))
      .then((backupTxs) => {
        console.log(`using backup transactions for ${keyStorage} from ${backupTxs.date}`)
        if (this._isMounted) {
          this.setState((prevState) => {
            return {
              cached: true,
              transactions: {
                data: backupTxs.data.map(getTransactionFromDB),
                date: new Date(backupTxs.date)
              },
              txLoading: false,
              txMsg: 'backup'
            }
          })
        }
      })
      .catch((err) => {
        console.log(`No backup found for ${keyStorage}:`, err)
        if (this._isMounted) {
          this.setState((prevState) => ({ txLoading: false }))
        }
      })
  }

  printTransaction(data) {
    const tx = data.item
    const imgTx = (
      <Image
        style={style.imgSmall}
        source={tx.in ? imgDown : imgUp}>
      </Image>
    )
    return (
      <View style={style.row}>
        <View style={style.firstColumn}>
          {imgTx}
        </View>
        <View style={style.column}>
          <Text style={style.small}>{formatDate(tx.date)}</Text>
        </View>
        <View style={style.column}>
          <Text style={style.colAddress}>{getShortAddress(tx.from, 2, 2)}</Text>
        </View>
        <View style={style.column}>
          <Text style={style.colAddress}>{getShortAddress(tx.to, 2, 2)}</Text>
        </View>
        <View style={style.column}>
          <Text>{formatNumber(tx.value, 5)}</Text>
        </View>
        <View style={style.column}>
          <Text style={style.small}>{formatNumber(tx.confirmations, 0)}</Text>
        </View>
      </View>
    )
  }

  render() {
    const screenProps = {
      rootNavigation: this.navigation,
      mainComponent: this.mainComponent
    }
    const account = this.state.account
    const appState = this.mainComponent && this.mainComponent.state
    const amount = appState ? processCurrency(appState, account.usd) : account.usd
    const table = this.state.transactions.data.length ? (
      <View style={style.transactionsList}>
        <View style={style.row}>
          <View style={style.firstColumn}>
          </View>
          <View style={style.column}>
            <Text style={style.tableHeader}>Date</Text>
          </View>
          <View style={style.column}>
            <Text style={style.tableHeader}>From</Text>
          </View>
          <View style={style.column}>
            <Text style={style.tableHeader}>To</Text>
          </View>
          <View style={style.column}>
            <Text style={style.tableHeader}>Ether</Text>
          </View>
          <View style={style.column}>
            <Text style={style.tableHeader}>
              <Image style={style.img} source={imgChecked}></Image>
            </Text>
          </View>
        </View>
        <FlatList
          data={this.state.transactions.data}
          renderItem={this.printTransaction.bind(this)}
        />
      </View>
    ) : <Warning msg={this.state.txMsg}></Warning>

    return (
      <ScrollView style={style.container}>
        <View style={style.detail}>
          <View style={style.detailHeader}>
            <QRCode
              value={account.key}
              size={200}
              bgColor='black'
              fgColor='white'/>
              <Text selectable style={style.accountKey}>{account.key}</Text>
          </View>
          <View style={style.balanceRow}>
            <View style={style.balanceColumn}>
              <Text selectable>
                <Text style={style.bold}>{formatNumber(account.balance || '0')} </Text>
                  Ether
               </Text>
            </View>
            <View style={style.balanceColumn}>
              <Text selectable>
                {amount}
              </Text>
            </View>
          </View>
        </View>
        <View style={[style.detail, {flex: 1}]}>
          <View style={style.transactions}>
            <Text style={style.transactionsTitle}>Transactions</Text>
          </View>
          {
            this.state.txLoading ?
              <ActivityIndicatorLayer animating={true}></ActivityIndicatorLayer> :
              table
          }
        </View>
      </ScrollView>
    )
  }
}

function getTransactionFromDB(tx) {
  const txObj = Object.assign({}, tx)
  txObj.date = new Date(txObj.date)
  return txObj
}

const style = StyleSheet.create({
  container: appStyles.container,
  img: {
    width: 32,
    height: 32
  },
  imgSmall: {
    width: 28,
    height: 28
  },
  detail: {
    backgroundColor: appStyles.color.white,
    marginTop: 3
  },
  detailHeader: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20
  },
  accountKey: {
    paddingTop: 20,
    paddingBottom: 10,
    fontSize: 12,
    color: appStyles.color.primary[900]
  },
  balanceRow: {
    flexDirection: 'row',
    paddingBottom: 10
  },
  balanceColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bold: {
    fontWeight: 'bold'
  },
  transactions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  transactionsTitle: {
    fontSize: 16
  },
  transactionsList: {
    padding: 3
  },
  tableHeader: {
    fontSize: 14
  },
  row: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: 'gray',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    padding: 5
  },
  firstColumn: {
    width: 40
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  small: {
    fontSize: 10
  },
  colAddress: {
    color: appStyles.color.primary[900]
  }
})
