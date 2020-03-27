import React, { Component } from 'react'
import { TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types'
import { bootstrapURLKeys } from '../bootstrapURLKeys'

import Review from './Review'
import Stars from './Stars'
import Form from './Form'

import './Card.css'

class Card extends Component {
  static _propTypes = {
    /** Index of card
     */
    index: PropTypes.number,
    /** Object of lat and lng properties */
    position: PropTypes.objectOf(PropTypes.number),
    /** Object containing all restaurants info ( name, open, address, reviews ) */
    resto: PropTypes.object,
    /** Used to calculate reviews number median */
    calculateStars: PropTypes.func,
    /** Function on card click, used to change interface state and open restaurant card */
    onClick: PropTypes.func,
    /** Function on form click, used to change interface state and open form in card */
    onFormClick: PropTypes.func,
    /** Bool to know if a form is actually open */
    formOpen: PropTypes.bool
  }

  constructor() {
    super()

    this.state = {
      reviewFormState: false,
      isScrollable: { right: null, left: null }
    }
  }

  componentDidMount() {
    this.areCommentsScrollable()
  }

  /** Check if there is enough comments to enable scroll
   */
  areCommentsScrollable() {
    document
      .getElementsByClassName(`Card-${this.props.index}`)[0]
      .getElementsByClassName('Card-ratings-wrapper')[0].scrollLeft += 106

    if (
      document
        .getElementsByClassName(`Card-${this.props.index}`)[0]
        .getElementsByClassName('Card-ratings-wrapper')[0].scrollLeft > 100
    ) {
      this.setState({ isScrollable: { right: true } })
    } else {
      this.setState({ isScrollable: { right: false } })
    }
    document
      .getElementsByClassName(`Card-${this.props.index}`)[0]
      .getElementsByClassName('Card-ratings-wrapper')[0].scrollLeft = 0
  }

  /** Scroll comment section of given Card
   * @param {Int} index index of card
   */
  scrollRightComments(index) {
    let card = document
      .getElementsByClassName('Card-' + index)[0]
      .getElementsByClassName('Card-ratings-wrapper')[0]

    let scrollLeft = 0
    let interval = setInterval(scrollRight, 20)
    function scrollRight() {
      if (scrollLeft === 100) {
        clearInterval(interval)
      } else {
        scrollLeft += 10
        card.scrollLeft += scrollLeft
      }
    }
  }

  render() {
    const {
      resto,
      index,
      className,
      onClick,
      onFormClick,
      calculateStars,
      position,
      formOpen
    } = this.props
    return (
      <TransitionGroup component={null}>
        <div
          id={resto.id}
          className={`Card ${className} Card-${index} ${formOpen &&
            'Card-visible-form'}`}
          onClick={() => onClick(resto.id)}
        >
          <div className="Card-banner">
            <div className="Card-informations">
              <h2 className="Card-restaurantName">{resto.name}</h2>
              <span className={`Card-restaurantStatus ${resto.open}`}></span>
              <p className="Card-address">{resto.address}</p>
              <div className="Card-ratings">
                <Stars
                  units={
                    calculateStars(resto.mergedRatings)
                      ? calculateStars(resto.mergedRatings)
                      : resto.stars
                  }
                />
              </div>
            </div>
            <div className="Card-options">
              <a
                href={resto.number && `tel:${resto.number}`}
                className={`Card-optionsButton ${!resto.number &&
                  'unavailable'}`}
              >
                <ion-icon name="call" className="icon" size="large"></ion-icon>
                Call
                <span>{resto.number}</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={resto.website && `${resto.website}`}
                className={`Card-optionsButton ${!resto.website &&
                  'unavailable'}`}
              >
                <ion-icon
                  name="laptop"
                  className="icon"
                  size="large"
                ></ion-icon>
                Reservation
                <span>
                  {resto.website && <ion-icon name="open"></ion-icon>}
                </span>
              </a>
            </div>
          </div>
          <div className="Card-content">
            <div className="Card-reviews">
              <h3>
                {resto.mergedRatings.length > 0 &&
                  resto.mergedRatings.length +
                    ' review' +
                    (resto.mergedRatings.length > 1 ? 's' : '')}
              </h3>
              <div className="Card-ratings-wrapper">
                {resto.mergedRatings.map(rating => (
                  <Review
                    userName={rating.user}
                    profilePicture={rating.picture}
                    content={rating.comment}
                    rating={rating.stars}
                  />
                ))}
              </div>
              <div className="Card-photo">
                <img
                  src={
                    'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' +
                    position.lat +
                    ',' +
                    position.lng +
                    '&fov=80&heading=70&pitch=0&key=' +
                    bootstrapURLKeys.key
                  }
                  alt=""
                />
              </div>
            </div>
            <button
              className="Card-addRating"
              onClick={() => onFormClick(index)}
            >
              Add review
            </button>
          </div>
          <div className={`Card-rating-Form ${formOpen && 'active'}`}>
            <Form open={true} type="review" index={index} placeId={resto.id} />
          </div>
        </div>
      </TransitionGroup>
    )
  }
}

export default Card
