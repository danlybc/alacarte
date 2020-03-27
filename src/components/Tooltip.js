import React from 'react'
import PropTypes from 'prop-types'

import Stars from './Stars'

import '../MapContainer.css'

const arrowStyle = {
  width: '0',
  height: '0',
  borderLeft: '20px solid transparent',
  borderRight: '20px solid transparent',
  borderTop: '20px solid white',
  position: 'absolute',
  left: '50%',
  bottom: '-10%',
  transform: 'translate(-50%)'
}

const Tooltip = ({ info, rating }) => {
  return (
    <div className="Tooltip">
      <h1>{info.name}</h1>
      <span>{info.open.toUpperCase()}</span>
      <em>{info.ratings.length > 0 && info.ratings.length + ' avis'}</em>
      <Stars units={rating} />
      <div style={arrowStyle}></div>
    </div>
  )
}

Tooltip.propTypes = {
  /** Object containing restaurants informations
   * {
   *  name: Restaurant name,
   *  open: Restaurant open state,
   *  ratings: Array of objects, each object is a review
   * }
   */
  info: PropTypes.object.isRequired,
  /** Number of total star rating */
  rating: PropTypes.number
}

export default Tooltip
