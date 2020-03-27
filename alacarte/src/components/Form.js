import React, { Component } from 'react'

import RestaurantsContext from '../context/RestaurantsContext'

import Stars from './Stars'

import './Form.css'

const INITIAL_FORM_STATE = {
  addressMethod: null,
  rating: 0
}

/** Form component used for Add Restaurant Form and Add Review Form */
class Form extends Component {
  static contextType = RestaurantsContext
  state = INITIAL_FORM_STATE

  /** Display user star reviews */
  handleUserRating = rating => {
    this.setState({ rating: rating })
  }

  /** Set address from either source : User location, Center view, Google Search API */
  setAddress = location => {
    console.log(location)
    document.getElementById('newRestaurantAddress').value = location
    document
      .getElementById('newRestaurantAddress')
      .dispatchEvent(new Event('change'))

    if (location === null) location = this.state.address
    this.setState({ restaurantAddress: location }, () =>
      this.getAddressCoordinates(location)
    )
  }

  handleChange = event => {
    const prop = event.target.name
    const state = this.state
    state[prop] = event.target.value
    if (prop === 'restaurantName') {
      const restaurantName = event.target.value
      const upcaseRestaurantName =
        restaurantName &&
        restaurantName[0].toUpperCase() + restaurantName.slice(1)
      event.target.value = upcaseRestaurantName
    }

    this.setState(
      state,
      () =>
        prop === 'restaurantAddress' && this.getAddressCoordinates(state[prop])
    )
  }

  /** Add new restaurant to the context */
  handleSubmit = event => {
    const { restaurantName, rating, review, addressCoordinates } = this.state
    const { type } = this.props
    const context = this.context
    console.log('oui')
    if (type === 'restaurant') {
      const coordsLat = addressCoordinates[0]
      const coordsLong = addressCoordinates[1]
      context.addRestaurant({
        name: restaurantName,
        address: addressCoordinates && addressCoordinates[2],
        lat: coordsLat,
        long: coordsLong,
        ratingStars: rating,
        rating: review
      })
    } else if (type === 'review') {
      context.addReview({
        placeId: this.props.placeId,
        ratingStars: rating,
        rating: review
      })
    }

    event.preventDefault()
    this.setState(INITIAL_FORM_STATE)
    Array.from(document.getElementsByClassName('form')).forEach(elem =>
      elem.reset()
    )
  }

  /** Get coordinates based on an adress */
  getAddressCoordinates = address => {
    const geocoder = this.props.geocoder
    if (geocoder) {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            console.log(results[0])
            let addressCoordinates = [
              results[0].geometry.location.lat(),
              results[0].geometry.location.lng(),
              results[0].formatted_address.split(',')[0] +
                ', ' +
                results[0].formatted_address.split(',')[1]
            ]
            this.setState({ addressCoordinates })
          }
        }
      })
    }
  }

  render() {
    const { pin, locate, open, type } = this.props
    const { rating } = this.state
    return (
      <div className={`Form ${open && 'Form-visible'} ${`Form-${type}`}`}>
        <form className="form" onSubmit={() => false}>
          {type === 'restaurant' && (
            <div className="Form-header">
              <div className="Form-locations">
                <input
                  required
                  type="text"
                  ref="cpNewRestaurant"
                  id="newRestaurantAddress"
                  name="restaurantAddress"
                  placeholder={`Addresse*`}
                  maxLength={100}
                  onChange={this.handleChange}
                />
                <div className="Form-locations-icons">
                  <ion-icon
                    onClick={() => this.setAddress(locate)}
                    active
                    name="locate"
                  ></ion-icon>
                  <ion-icon
                    onClick={() => this.setAddress(pin ? pin : locate)}
                    name="pin"
                  ></ion-icon>
                </div>
              </div>
              <input
                required
                type="text"
                name="restaurantName"
                placeholder="Nom du restaurant*"
                onChange={this.handleChange}
              />
            </div>
          )}
          <span className="Form-Stars">
            <Stars
              type="clickable"
              units={rating}
              onClick={this.handleUserRating}
            />
          </span>
          <textarea
            required
            maxLength={300}
            name="review"
            placeholder="Avis* (300 caractères max.)"
            onChange={this.handleChange}
          ></textarea>

          <button type="button" value="Ajouter" onClick={this.handleSubmit}>
            Add
          </button>
        </form>
      </div>
    )
  }
}

export default Form
