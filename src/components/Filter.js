import React from 'react'
import PropTypes from 'prop-types'

import Stars from './Stars'

import './List.css'

const Filter = ({ type, stars, onClick, filterMinSelector }) => {
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
