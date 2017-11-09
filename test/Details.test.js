import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import Details from '../src/Details'
import * as constants from '../src/lib/constants'

// weird bug in Jest https://github.com/facebook/react-native/issues/12440
jest.mock('WebView', () => 'WebView')

// We need to have mocked this properties in the instance of the Component
// they are used in the componentDidMount()
Object.defineProperty(Details.prototype, 'rootNavigation', {
  get: function() {
    return {
      state: {
        params: {
          account: {},
          mainComponent: {
            state: {
              preferences: {
                currency: 'USD'
              },
              conversionRates: []
            }
          }
        }
      }
    }
  }
})

describe('Details', () => {
  it('renders without crashing', () => {
    const rendererInstance = renderer.create(<Details />)
    const rendered = rendererInstance.toJSON()
    expect(rendered).toBeTruthy()
  })

  it('should call getTransactions()', () => {
    const getTransactionsMock = jest.fn()
    Details.prototype.getTransactions = getTransactionsMock
    const rendererInstance = renderer.create(<Details />)
    expect(getTransactionsMock).toHaveBeenCalled()

    getTransactionsMock.mockReset()
    getTransactionsMock.mockRestore()
  })

  it('should init the state', () => {
    const getTransactionsMock = jest.fn()
    Details.prototype.getTransactions = getTransactionsMock
    const rendererInstance = renderer.create(<Details />)
    const component = rendererInstance.getInstance()
    const actual = component.state
    const expected = {
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
    expect(actual).toEqual(expected)

    getTransactionsMock.mockReset()
    getTransactionsMock.mockRestore()
  })
})
