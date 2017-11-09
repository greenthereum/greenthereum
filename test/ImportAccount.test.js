import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import ImportAccount from '../src/ImportAccount'

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

// We need to have mocked this properties in the instance of the Component
// they are used in the componentDidMount()
Object.defineProperty(ImportAccount.prototype, 'navigation', {
  get: function() {
    return {
      state: {
        params: {
          mainComponent: {
            state: {}
          }
        }
      }
    }
  }
})

describe('ImportAccount', () => {

  it('renders without crashing', () => {
    const rendererInstance = renderer.create(<ImportAccount />)
    const rendered = rendererInstance.toJSON()
    expect(rendered).toBeTruthy()
  })
})
