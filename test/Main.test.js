import React from 'react'
import {NetInfo, AsyncStorage} from 'react-native'
import renderer from 'react-test-renderer'
import Main from '../src/Main'
import * as constants from '../src/lib/constants'
import * as API from '../src/lib/api'
import * as backupStateMock from './mock/state'

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
    const loadConversionRatesMock = jest.fn(() => Promise.resolve())
    const fetchDataMock = jest.fn(() => Promise.resolve())
    const getItemMock = jest.fn(() => Promise.resolve('{}'))
    // mock network calls
    Main.prototype.loadConversionRates = loadConversionRatesMock
    Main.prototype.fetchData = fetchDataMock
    AsyncStorage.getItem = getItemMock
  })

  it('renders without crashing', () => {
    const rendererInstance = renderer.create(<Main />)
    const rendered = rendererInstance.toJSON()
    expect(rendered).toBeTruthy()
  })

  it('should init the App\'s state', (done) => {
    const rendererInstance = renderer.create(<Main/>)
    const component = rendererInstance.getInstance()
    const expected = {
      screen: 'Main',
      wallets: [],
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
      isConnected: true
    }
    //first the app starts loading
    expected.loading = true

    expect(component.state).toEqual(expected)
    setTimeout(() => {
      // wait for componentDidMount loaders
      expected.loading = false
      expect(component.state).toEqual(expected)
      done()
    }, 100)
  })

  it('should load App', () => {
    const loadAppMock = jest.fn(() => Promise.resolve())
    Main.prototype.loadApp = loadAppMock
    const rendererInstance = renderer.create(<Main/>)

    expect(Main.prototype.loadApp).toHaveBeenCalled()
    loadAppMock.mockReset()
    loadAppMock.mockRestore()
  })

  describe('loadBackupState', () => {
    it('it should load backup on Main state', async (done) => {
      const rendererInstance = renderer.create(<Main/>)
      const component = rendererInstance.getInstance()

      AsyncStorage.getItem = jest.fn(() => Promise.resolve(JSON.stringify(backupStateMock)))
      await component.loadBackupState()
      const actual = component.state
      const expected = Object.assign({}, backupStateMock)

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(constants.STG_STATE)
      expect(actual).toEqual(expected)
      done()
    })
  })

  describe('updateBackupState', () => {
    it('should update the storage state', (done) => {
      AsyncStorage.setItem = jest.fn(() => Promise.resolve())
      const rendererInstance = renderer.create(<Main/>)
      const component = rendererInstance.getInstance()
      const stateMock = Object.assign({}, backupStateMock)
      // this isn't saved
      delete stateMock.loading
      delete stateMock.isConnected

      component.setState(stateMock, () => {
        component.updateBackupState('tests')
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          constants.STG_STATE,
          JSON.stringify(stateMock)
        )
        done()
      })

    })
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
    Main.prototype.loadConversionRates.mockReset()
    Main.prototype.loadConversionRates.mockRestore()
    Main.prototype.fetchData.mockReset()
    Main.prototype.fetchData.mockRestore()
    AsyncStorage.getItem.mockReset()
    AsyncStorage.getItem.mockRestore()
  })
})
