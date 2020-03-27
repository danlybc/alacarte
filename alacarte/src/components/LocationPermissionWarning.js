import React from 'react'
import PropTypes from 'prop-types'

import './LocationPermissionWarning.css'

/** Prompt user when loading the site
 * Following Google Web Dev fundamentals, user shouldn't be faced with
 * a location prompt on page load, but should be the result of a user gesture.
 * This allow user knowledge and acceptance and knowing that he can still use the app
 * if he refuses to share his location
 * https://developers.google.com/web/fundamentals/native-hardware/user-location
 * @param  {Function} onClick function executed when a choice is clicked
 */

const LocationPermissionWarning = ({ onClick }) => {
  return (
    <div className="Location-card-wrapper">
      <div className="Location-card">
        <div className="Location-choice" onClick={() => onClick(true)}>
          <ion-icon name="locate" size="large"></ion-icon>
          <p>I want to browse local restaurants using my location</p>
        </div>
        <div className="Location-choice" onClick={() => onClick(false)}>
          <p>I want to manually search for cities (showed in tutorial)</p>
          <ion-icon name="search" size="large"></ion-icon>
        </div>
      </div>
    </div>
  )
}

LocationPermissionWarning.propTypes = {
  onClick: PropTypes.func
}

export default LocationPermissionWarning
