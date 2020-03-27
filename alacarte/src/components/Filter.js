import React from 'react'
import PropTypes from 'prop-types'

import Stars from './Stars'

import './List.css'

/** Filter component used to display only restaurants within min and max range
 * @param {string} type 'inline' can be specified
 * @param {Object} stars Object with {Int: min range, Int: max range}
 * @param {Function} onClick Set the local state for the filter on click
 * @param {bool} filterMinSelector to see if the actual selector is for Minimum range (true) or Maximum
 */
const Filter = ({ type, style, stars, onClick, filterMinSelector }) => {
  return (
    <div className={type === 'inline' ? 'Filter inline' : 'Filter'}>
      <p className="Filter-title">
        Filter ({filterMinSelector === true ? 'MIN' : 'MAX'}.)
      </p>
      <span className="Filter-stars">
        <Stars type="clickable" onClick={onClick} units={stars} />
      </span>
    </div>
  )
}

Filter.propTypes = {
  type: PropTypes.string,
  style: PropTypes.object,
  stars: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.number),
    PropTypes.number
  ]).isRequired,
  onClick: PropTypes.func.isRequired
}
export default Filter
