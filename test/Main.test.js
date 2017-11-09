import React from 'react'
import {NetInfo} from 'react-native'
import renderer from 'react-test-renderer'
import Main from '../src/Main'

// weird bug in Jest https://github.com/facebook/react-native/issues/12440
jest.mock('WebView', () => 'WebView')

// another weird bug in Jest https://github.com/facebook/jest/issues/3707
jest.mock('TextInput', () => {
  const RealComponent = require.requireActual('TextInput')
  const React = require('React')
  class TextInput extends React.Component {
    render() {
      delete this.props.autoFocus
      return React.createElement('TextInput', this.props, this.props.children)
    }
  }
  TextInput.propTypes = RealComponent.propTypes
  return TextInput
})

// Mock NetInfo
NetInfo.isConnected = {
  fetch: () => {
    return Promise.resolve(true)
  },
  addEventListener: () => true
}

describe('Main', () => {
  beforeEach(() => {
    const getPreferencesMock = jest.fn(() => Promise.resolve())
    const loadConversionRatesMock = jest.fn(() => Promise.resolve())
    const fetchDataMock = jest.fn(() => Promise.resolve())
    const loadAppMock = jest.fn(() => Promise.resolve())
    // mock network calls
    Main.prototype.getPreferences = getPreferencesMock
    Main.prototype.loadConversionRates = loadConversionRatesMock
    Main.prototype.fetchData = fetchDataMock
    Main.prototype.loadApp = loadAppMock
  })

  it('renders without crashing', () => {
    const rendererInstance = renderer.create(<Main />)
    const rendered = rendererInstance.toJSON()
    expect(rendered).toBeTruthy()
  })

  it('should init the App\'s state', () => {
    const rendererInstance = renderer.create(<Main/>)
    const component = rendererInstance.getInstance()
    const actual = component.state
    const expected = {
      screen: 'Main',
      accounts: [],
      stats: {
        ethbtc: null,
        ethusd: null,
        supply: null
      },
      preferences: {
        currency: 'USD'
      },
      conversionRates: {},
      cached: false,
      date: null,
      loading: true,
      isConnected: true
    }
    expect(actual).toEqual(expected)
  })

  it('should call loaders on componentDidMount', (done) => {
    const loadAppMock = jest.fn(() => Promise.resolve())
    const rendererInstance = renderer.create(<Main/>)

    setTimeout(() => {
      // loadApp runs after netInfo and setState (asynchronus)
        expect(Main.prototype.loadApp).toHaveBeenCalled()
        done()
    }, 100)
  })

  describe('fetchData', () => {
    /**
     * fetchData(refrsh) is debouned: see https://etherscan.io/apis limitations
     */
    it('should not be called more than once (debounce)', () => {
      const rendererInstance = renderer.create(<Main/>) // 1st call
      const component = rendererInstance.getInstance()
      component.refresh()
      component.refresh()
      component.refresh()
      expect(Main.prototype.fetchData.mock.calls.length).toBe(1)
    })

    it('should be called on refresh() if waits enough', (done) => {
      const rendererInstance = renderer.create(<Main/>) // 1st call
      const component = rendererInstance.getInstance()
      component.refresh()
      setTimeout(() => {
        component.refresh()
        expect(Main.prototype.fetchData.mock.calls.length).toBe(2)
        done()
      }, 2000) // refresh is debounced
    })
  })

  afterEach(() => {
    Main.prototype.getPreferences.mockReset()
    Main.prototype.getPreferences.mockRestore()
    Main.prototype.loadConversionRates.mockReset()
    Main.prototype.loadConversionRates.mockRestore()
    Main.prototype.fetchData.mockReset()
    Main.prototype.fetchData.mockRestore()
    Main.prototype.loadApp.mockReset()
    Main.prototype.loadApp.mockRestore()
  })
})
