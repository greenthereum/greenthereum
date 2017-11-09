import * as utils from '../../src/lib/utils'

describe('#isEthereumAddress()', function() {
  it('should return true for valid addresses', function() {
    expect(utils.isEthereumAddress('0x348d5BE8f0c82EE09f094761303D14444995c9A1')).toEqual(true)
    expect(utils.isEthereumAddress('348d5BE8f0c82EE09f094761303D14444995c9A1')).toEqual(true)
  })

  it('should return fail for invalid addresses', function() {
    expect(utils.isEthereumAddress('')).toEqual(false)
    expect(utils.isEthereumAddress('348d5BE8f0c82EE09f094761303D14444995c9X1')).toEqual(false)
    expect(utils.isEthereumAddress('x348d5BE8f0c82EE09f094761303D14444995c9A1')).toEqual(false)
    expect(utils.isEthereumAddress('0x348d5BE8f0 c82EE09f094761303D14444995c9A1')).toEqual(false)
    expect(utils.isEthereumAddress(' 0x348d5BE8f0c82EE09f094761303D14444995c9A1')).toEqual(false)
  })
})

describe('formatDate', function () {
  it('should format date in english', function () {
    const date = new Date(2017, 11, 31, 10, 30)
    const actual = '12/31/17 10:30'
    const expected = utils.formatDate(date)

    expect(actual).toEqual(expected)
  })
})

describe('formatCurrency', function () {
  it('should format the amount properly', function () {
    const actual = utils.formatCurrency('5300', 'USD')
    const expected = '$5,300.00'
    expect(actual).toEqual(expected)
  })
})

describe('getCurrencySymbol', function () {
  it('should return the proper symbol', function () {
    const actual = utils.getCurrencySymbol('USD')
    const expected = '$'
    expect(actual).toEqual(expected)
  })
})

describe('formatNumber', function () {
  it('should format the amount properly', function () {
    const actual = utils.formatNumber('5100200300400.999999')
    const expected = '5,100,200,300,401.000000'
    expect(actual).toEqual(expected)
  })
  it('should format the decimals properly', function () {
    const actual = utils.formatNumber('123456.12345678', 8)
    const expected = '123,456.12345678'
    expect(actual).toEqual(expected)
  })
})

describe('convertUSDFromRate', function () {
  it('should return a function', function () {
    const actual = typeof utils.convertUSDFromRate({})
    const expected = 'function'
    expect(actual).toEqual(expected)
  })

  it('should return the proper amount converted', function () {
    const usdRates = {
      'EUR' : 0.8
    }
    const convertFromUSD = utils.convertUSDFromRate(usdRates)
    const actual = convertFromUSD(1, 'EUR')
    const expected = 0.8
    expect(actual).toEqual(expected)
  })

  it('should return the same amount if no rates', function () {
    const convertFromUSD = utils.convertUSDFromRate()
    const actual = convertFromUSD(5, 'EUR')
    const expected = 5
    expect(actual).toEqual(expected)
  })

  describe('processCurrency', function () {
    it('should use user preferences from state', function () {
      const mainState = {
        conversionRates: {
          rates: {
             "AUD": 1.3026,
             "CHF": 0.99811,
             "EUR": 0.85785
          }
        },
        preferences: {
          currency: 'EUR'
        }
      }
      const actual = utils.processCurrency(mainState, 1)
      const expected = '0,86 €'
      expect(actual).toEqual(expected)
    })

    it('should fallback to default currency(USD) if no rates are defined', function () {
      const mainState = {
        conversionRates: {},
        preferences: {
          currency: 'EUR'
        }
      }
      const actual = utils.processCurrency(mainState, 1)
      const expected = '$1.00'
      expect(actual).toEqual(expected)
    })

    it('should fallback to default currency(USD) if no rates are defined', function () {
      const mainState = {
        conversionRates: {},
        preferences: {
          currency: 'EUR'
        }
      }
      const actual = utils.processCurrency(mainState, 1)
      const expected = '$1.00'
      expect(actual).toEqual(expected)
    })
  })
})
