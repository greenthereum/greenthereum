import React from 'react'
import {
  AsyncStorage,
  StyleSheet,
  Image,
  Linking,
  Picker,
  Text,
  TextInput,
  TouchableHighlight,
  View
  } from 'react-native'
import appStyles from './lib/styles'

export default class Preferences extends React.Component {
  static navigationOptions = {
    headerTitle: 'Preferences',
    headerStyle: appStyles.headerStyle,
    headerTitleStyle: appStyles.headerTitle,
    headerTintColor: appStyles.color.white
  }

  constructor(props) {
    super(props)
    this.navigation = this.props.navigation
    this.updateCurrency = this.updateCurrency.bind(this)
    this.state = {
      currencies: [
        'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
        'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR',
        'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY',
        'ZAR', 'USD',
      ],
      currency: null
    }
  }

  componentDidMount() {
    const { params } = this.navigation.state
    this.mainComponent = params.mainComponent
    const appState = this.mainComponent.state
    this.setState((prevState) => { // predefine saved state
      return {
        currency: appState && appState.preferences.currency
      }
    })
  }

  updateCurrency(itemValue, itemIndex) {
    this.setState((prevState) => {
      return {
        currency: itemValue
      }
    })
    this.updateMainStatePrefs({ currency: itemValue })
  }

  updateMainStatePrefs(preferences) {
    this.mainComponent.setState((prevState) => ({ preferences }), () => {
    // wait for the main State is updated then:
      this.mainComponent.loadConversionRates()
        .then(this.mainComponent.refresh)
      this.mainComponent.updateBackupState('update backup preferences')
    })
  }

  render() {
    const screenProps = {
      rootNavigation: this.navigation
    }
    const currencyItems = this.state.currencies.map((currency) => {
      return (
        <Picker.Item label={currency} value={currency} key={currency} />
      )
    })
    return (
      <View style={style.container}>
        <View style={[style.optionContainer, style.center]}>
          <View style={style.center}>
            <Text style={style.optionTitle}>Currency</Text>
          </View>
          <Picker
            style={style.pickCurrency}
            selectedValue={this.state.currency}
            onValueChange={this.updateCurrency}>
            {currencyItems}
          </Picker>
        </View>
      </View>
    )
  }
}

const style = StyleSheet.create({
  input: {
    height: 60,
    width: 300,
    padding: 20
  },
  pickCurrency: {
    width: 200
  },
  center: appStyles.center,
  img: {
    width: 64,
    height: 64
  },
  optionContainer: {
    backgroundColor: appStyles.color.white,
    marginTop: 3
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  }
})
