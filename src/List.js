import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  TouchableHighlight,
  Linking
} from 'react-native'
import API from './lib/api'
import {
  convertUSDFromRate,
  formatNumber,
  formatDate,
  getShortAddress,
  processCurrency,
} from './lib/utils'
import appStyles from './lib/styles'
import {CURRENCIES} from './lib/constants'

const etherIcon = require('../assets/img/ico.png')

export default class List extends React.Component {
  constructor(props) {
    super(props)
    this.rootNavigation = this.props.screenProps.rootNavigation
    this.mainComponent = this.props.screenProps.mainComponent
  }

  openAddress(account) {
    console.log(`open address ${account.key}`)
    this.mainComponent.setState((prevState) => {
      return {
        screen: 'details'
      }
    })
    this.rootNavigation.navigate('Details', {
      mainComponent: this.mainComponent,
      account: account
    })
    // Linking.openURL(`${API.URL.ADDRESS_INFO}${address}`)
    //   .catch(err => console.error('An error occurred', err))
  }

  render() {
    const fromCache = this.props.screenProps.mainState.cached
    const date = new Date(this.props.date)
    const stateDate = formatDate(date)
    return (
      <View style={[appStyles.container, style.listContainer]}>
        <View style={style.listHeader}>
        </View>
        <ScrollView>
          <FlatList
            data={this.props.items}
            renderItem={this.print.bind(this)}
          />
        </ScrollView>
      </View>
    )
  }

  print({item}) {
    const appState = this.mainComponent.state
    const convertFromUSD = convertUSDFromRate(appState.conversionRates.rates)
    // const itemAmountConverted = convertFromUSD(item.usd, appState.preferences.currency)
    const amount = appState ? processCurrency(appState, item.usd) : item.usd
    return (
      <TouchableHighlight underlayColor='transparent'
        onPress={this.openAddress.bind(this, item)}>
          <View style={style.listRow}>
            <View style={style.imgColumn}>
              <Image source={etherIcon} style={style.listImg}/>
            </View>
            <View style={style.listColumn}>
              <Text style={style.listAddress}>
                {getShortAddress(item.key, 14)}
              </Text>
              <View style={[style.listItemInfo, style.center]}>
                <View>
                  <Text><Text style={style.bold}>{formatNumber(item.balance)}</Text> Ether</Text>
                </View>
                <View>
                  <Text>{amount}</Text>
                </View>
              </View>
            </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const style = StyleSheet.create({
  listContainer: {
    flex: 1,
    height: 64
  },
  listRow: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: 'gray',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    padding: 10,
    marginTop: 3,
    backgroundColor: 'white'
  },
  columnInfo: {
    paddingLeft: 10
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  listColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imgColumn: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  listHeader: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  listHeaderTextCache: {
    fontSize: 12
  },
  listImg: {
    width: 60,
    height: 60
  },
  listAddress: {
    fontSize: 16,
    color: '#1B5E20' // material green 900
  },
  listItemInfo: {
    paddingLeft: 5,
    paddingTop: 3
  },
  bold: {
    fontWeight: 'bold'
  }
})
