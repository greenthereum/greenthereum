const {HOST, KEY} = require('../../ETHERSCAN_API.json')
const STATS_URL = `${HOST}?module=stats&action=ethprice&apikey=${KEY}`
const TOTAL_SUPPLY_URL = `${HOST}?module=stats&action=ethsupply&apikey=${KEY}`
const NORMAL_TRANS_URL = `${HOST}?module=account&action=txlist&` +
  `startblock=0&endblock=99999999&address=:address&page=:page&offset=:offset&sort=desc&apikey=${KEY}`
const MIN_REQUEST_TIME = 1500

function getAccounts(addresses) {
  const addressJoined = addresses.join(',')
  const BALANCE_URL = `${HOST}?module=account&action=balancemulti` +
    `&tag=latest&apikey=${KEY}&address=${addressJoined}`
  if (addresses.length) {
    console.log(`fetch ${BALANCE_URL}`)
    return fetch(BALANCE_URL)
  }
  return Promise.reject('no addresses found')
}

function getStats() {
  return fetch(STATS_URL)
}

function getTotalSupply() {
  return fetch(TOTAL_SUPPLY_URL)
}

function getNormalTransactions(opts) {
  const url = NORMAL_TRANS_URL
    .replace(':address', opts.address)
    .replace(':page', opts.page || 1)
    .replace(':offset', opts.offset || 50)
  console.log(`fetch ${url}`)
  return fetch(url)
}

export default {
  const: {
    MIN_REQUEST_TIME
  },
  URL: {
    PRICE_HISTORICAL: 'https://etherscan.io/chart/etherprice',
    ADDRESS_INFO: 'https://etherscan.io/address/'
  },
  getAccounts,
  getNormalTransactions,
  getStats,
  getTotalSupply
}
