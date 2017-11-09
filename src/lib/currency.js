// Powered by Fixer.io
const API_URL = 'http://api.fixer.io/latest?base=USD'

/**
 * get current conversion rates based on USD
 * @return {Promise}
 * @example
 * {
 * "base": "USD",
 * "date": "2017-11-02",
 * "rates": {
 * "AUD": 1.2982,
 * "BGN": 1.6795,
 *  ...
 *  }
 * }
 *
 */
export default function getConversionRates() {
  return fetch(API_URL)
}
