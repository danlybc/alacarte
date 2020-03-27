import React, { Component } from 'react'

import './Tutorial.css'

/**
 * This is a tutorial component to show user information about general UX when opening the app
 * it contains 4 state
 * 0 = Map drag
 * 1 = Switch between manual search and location based
 * 2 = Logo click
 * 3 = End
 */
class Tutorial extends Component {
  state = {}
  render() {
    const { tutorialState, onClick } = this.props
    return (
      <div
        className={`Tutorial Tutorial-${tutorialState}`}
        onClick={event => onClick(false, event)}
      >
        <div className="Tutorial-tip Tutorial-drag-map">
          <div className="Tutorial-hand-wrapper">
            <ion-icon name="hand"></ion-icon>
          </div>
          Drag the map around holding left click
        </div>
        <div className="Tutorial-tip Tutorial-logo-click">
          <ion-icon name="arrow-round-back"></ion-icon> Click on the logo to get
          back to your location otherwise to your last searched city
        </div>
        <div className="Tutorial-tip Tutorial-search">
          <ion-icon name="search"></ion-icon> Switch between browsing visible
          places or searching and jumping to another city
          <ion-icon name="arrow-round-down" style={{ flex: '' }}></ion-icon>
        </div>
        <button
          className="Tutorial-tip Tutorial-skip"
          onClick={event => onClick(3, event)}
        >
          <ion-icon name="close-circle-outline"></ion-icon>Press 'echap' or
          click this to skip tutorial
        </button>
      </div>
    )
  }
}

export default Tutorial
