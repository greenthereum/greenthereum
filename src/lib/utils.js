const currencyFormatter = require('currency-formatter')
const ethUnit = require('ethereum-units')

function isEthereumAddress(text) {
  return Boolean(text.length >= 40 && /^(0x){0,1}([0-9a-fA-F]{40}$)/.test(text))
}

function getShortAddress(address, first = 10, last = 5) { // length >= 40
  return `${address.substr(0, first)}...${address.substr(-1 * last)}`
}

function formatDate(date) {
  const year = date.getFullYear().toString().substr(-2)
  return `${date.getMonth() + 1}/${date.getDate()}/${year} ` +
    `${date.getHours()}:${date.getMinutes()}`
}

function getCurrencySymbol(code = 'USD') {
  return currencyFormatter.findCurrency(code).symbol
}

function formatCurrency(number, code = 'USD') {
  return currencyFormatter.format(number, {
    code: code,
    spaceBetweenAmountAndSymbol: true
  })
}

function formatNumber(number, precision = 6) {
  return currencyFormatter.format(number, {
    code: '',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    precision: precision
  })
}

function convertBalanceFromWei(wei) {
  return ethUnit.convert(wei, 'wei', 'ether').toString()
}

function convertUSDFromRate(rates) {
  return (amount, code = 'EUR') => {
    const rateConvertion = rates && rates[code] ? rates[code] : 1
    return code === 'USD' ? amount : (amount * rateConvertion)
  }
}

function processCurrency(appState, amount, defaultCurrency = 'USD') {
  const rateDefined = appState && appState.conversionRates.rates
  const userCurrency = appState.preferences.currency || defaultCurrency
  if (rateDefined) {
    const convertFromUSD = convertUSDFromRate(appState.conversionRates.rates)
    return formatCurrency(
      userCurrency !== 'USD' ? convertFromUSD(amount, userCurrency) : amount,
      userCurrency
    )
  }
  return formatCurrency(amount, defaultCurrency)
}

export {
  convertBalanceFromWei,
  convertUSDFromRate,
  formatCurrency,
  formatDate,
  formatNumber,
  getCurrencySymbol,
  getShortAddress,
  isEthereumAddress,
  processCurrency
}
