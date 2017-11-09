import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import App from '../App'
import Main from '../src/Main'

// weird bug in Jest https://github.com/facebook/react-native/issues/12440
jest.mock('WebView', () => 'WebView')

describe('App', () => {
  beforeEach(() => {
    const getPreferencesMock = jest.fn(() => Promise.resolve())
    const loadConversionRatesMock = jest.fn(() => Promise.resolve())
    const fetchDataMock = jest.fn(() => Promise.resolve())
    // mock network calls
    Main.prototype.getPreferences = getPreferencesMock
    Main.prototype.loadConversionRates = loadConversionRatesMock
    Main.prototype.fetchData = fetchDataMock
  })

  // TODO: Look for solution to https://github.com/facebook/jest/issues/3707
  xit('renders without crashing', () => {
    const component = renderer.create(<App />)
    const rendered = component.toJSON()
    expect(rendered).toBeTruthy()
  })

  afterEach(() => {
    Main.prototype.getPreferences.mockReset()
    Main.prototype.getPreferences.mockRestore()
    Main.prototype.loadConversionRates.mockReset()
    Main.prototype.loadConversionRates.mockRestore()
    Main.prototype.fetchData.mockReset()
    Main.prototype.fetchData.mockRestore()
  })
})
