import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import Preferences from '../src/Preferences'

// weird bug in Jest https://github.com/facebook/react-native/issues/12440
jest.mock('WebView', () => 'WebView')

// We need to have mocked this properties in the instance of the Component
// they are used in the componentDidMount()
Object.defineProperty(Preferences.prototype, 'navigation', {
  get: function() {
    return {
      state: {
        params: {
          mainComponent: {
            state: {
              preferences: {
                currency: 'EUR'
              }
            }
          }
        }
      }
    }
  }
})

describe('Preferences', () => {

  it('renders without crashing', () => {
    const rendererInstance = renderer.create(<Preferences />)
    const rendered = rendererInstance.toJSON()
    expect(rendered).toBeTruthy()
  })

  it('loads currency from appState', () => {
    const rendererInstance = renderer.create(<Preferences />)
    const component = rendererInstance.getInstance()
    const actual = component.state.currency
    const expected = 'EUR' // mocked in the Main state
    expect(actual).toEqual(expected)
  })
})
