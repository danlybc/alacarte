import React from 'react'
import PropTypes from 'prop-types'

import Stars from './Stars'

import './Review.css'

import DefaultPicture from '../assets/img/user_default_profile.jpg'

/**
 * Review component to be displayed within restaurant card
 * @param {*} param0 
 */
const Review = ({ userName, profilePicture, content, rating }) => (
  <div className="Review">
    <div className="Review-profilePicture">
      <img src={profilePicture ? profilePicture : DefaultPicture} alt="" />
    </div>

    <div className="Review-content">
      <div className="Review-userInfo">
        <h1 className="Review-userName">{userName}</h1>
        {/* <span className="Review-lastVisit">Visité en {lastVisit}</span> */}
      </div>
      <div className="Review-rating">
        <p className="Review-comment">{content}</p>
        <span className="Review-stars">
          <Stars units={rating} />
        </span>
      </div>
    </div>
    <div className="Review-thumb">
      <ion-icon name="thumbs-up"></ion-icon>
    </div>
  </div>
)

Review.propTypes = {
  userName: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
}

export default Review
