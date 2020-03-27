import React from 'react'

import PropTypes from 'prop-types'

import './Stars.css'

const Stars = ({ units, onClick, type }) => {
  return (
    <span className={`Stars-${type}`}>
      {[1, 2, 3, 4, 5].map(elem => {
        return (
          <ion-icon
            className={elem >= units.min && 'selected'}
            onClick={() => onClick && onClick(elem)}
            name={
              units instanceof Object
                ? elem >= units.min && elem <= units.max
                  ? 'star'
                  : 'star-outline'
                : elem <= units
                ? 'star'
                : 'star-outline'
            }
          ></ion-icon>
        )
      })}
    </span>
  )
}

Stars.propTypes = {
  type: PropTypes.string,
  units: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.number),
    PropTypes.number
  ]).isRequired,
  onClick: PropTypes.func
}

export default Stars
