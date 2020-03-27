import React, { Component } from 'react'
import { isMobile } from 'react-device-detect'

import MapContainer from './MapContainer'
import MobileDisplay from './MobileDisplay'
import RestaurantsProvider from './context/RestaurantsProvider'

import './App.css'

class App extends Component {
  render() {
    return isMobile ? (
      <MobileDisplay />
    ) : (
      <RestaurantsProvider>
        <div className="App">
          <MapContainer />
        </div>
      </RestaurantsProvider>
    )
  }
}

export default App
