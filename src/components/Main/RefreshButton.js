import React from 'react'
import {
  Image,
  TouchableHighlight,
  StyleSheet
} from 'react-native'

const styles = StyleSheet.create({
  refreshTouch: {
    position: 'absolute',
    top: 5,
    right: 15,
    zIndex: 100,
  },
  refreshButton: {
    width: 48,
    height: 48
  }
})

const refreshButtonImg = require('../../../assets/img/refresh-circle-secundary.png')

export default class RefreshButton extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <TouchableHighlight style={styles.refreshTouch} underlayColor='transparent' onPress={this.props.action}>
        <Image source={refreshButtonImg} style={styles.refreshButton}/>
      </TouchableHighlight>
    )
  }
}
