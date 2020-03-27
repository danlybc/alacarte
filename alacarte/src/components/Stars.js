import React from 'react'

import PropTypes from 'prop-types'

import './Stars.css'

/** Stars component to be used among other components (Form, Restaurant Cards, Filter)
 * @param {Object, Number} units can either be a minimum number (ex: 2 out of 5) or an object containing a range (ex: 2 to 4)
 * @param {Function} onClick callback given if stars are clickable
 * @param {String} type to specify a type (If clickable by example)
 */
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
