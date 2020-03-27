import React, { Component } from 'react'
import RestaurantsContext from './RestaurantsContext'

import Restaurants from './restaurants.json'

/**
 * Provide context for Available restaurants
 * Allow source from Places API, external JSON and user input
 */
export default class RestaurantsProvider extends Component {
  state = {
    JSONrestaurants: [...Restaurants],
    newRestaurantsEntry: [],
    inBoundsRestaurants: [],
    restaurants: [...Restaurants],
    addedReviews: []
  }

  /** Remove in bounds restaurants to prevent duplicate */
  removeInBounds = () => {
    this.setState({ inBoundsRestaurants: [] })
  }

  /** Function called when new restaurants are added from either sources
   * allow to get unified array of each restaurants to show
   */
  mergeLists = () => {
    const {
      inBoundsRestaurants,
      JSONrestaurants,
      newRestaurantsEntry,
      addedReviews
    } = this.state

    const restaurants = [
      ...inBoundsRestaurants,
      ...JSONrestaurants,
      ...newRestaurantsEntry
    ]

    restaurants.forEach(resto => {
      let index = addedReviews.findIndex(x => x.id === resto.id)
      if (index > -1) {
        resto.mergedRatings = [...resto.ratings, ...addedReviews[index].ratings]
      } else {
        resto.mergedRatings = [...resto.ratings]
      }
    })
    this.setState({
      restaurants
    })
  }

  render() {
    return (
      <RestaurantsContext.Provider
        value={{
          restaurants: this.state.restaurants,
          removeInBounds: () => {
            this.setState({ inBoundsRestaurants: [] })
          },

          /** Get in bounds restaurants info from API */
          addInBoundsRestaurants: ({
            id,
            name,
            address,
            open,
            lat,
            long,
            reviews,
            rating,
            website,
            number
          }) => {
            const restoJSON = this.state.inBoundsRestaurants
            restoJSON.push({
              id,
              name,
              open,
              address,
              lat,
              long,
              ratings: reviews,
              stars: rating,
              mergedRatings: [this.ratings],
              website,
              number
            })

            this.setState(
              {
                inBoundsRestaurants: restoJSON
              },
              () => this.mergeLists()
            )
          },
          /** Get in bounds restaurants reviews from API */
          addInBoundsRestaurantGoogleReviews: ({
            id,
            picture,
            user,
            stars,
            comment
          }) => {
            const { inBoundsRestaurants } = this.state
            const restaurants = inBoundsRestaurants
            const index = restaurants.findIndex(x => x.id === id)

            if (restaurants[index]) {
              restaurants[index].ratings.push({
                picture: picture,
                user: user,
                stars: stars,
                comment: comment
              })

              this.setState(
                {
                  inBoundsRestaurants: restaurants
                },
                () => this.mergeLists()
              )
            }
          },
          /** Allow user to manually add restaurants */
          addRestaurant: ({
            name,
            address,
            lat,
            long,
            rating,
            ratingStars
          }) => {
            const restoJSON = this.state.newRestaurantsEntry
            restoJSON.push({
              id: this.state.newRestaurantsEntry.length + 1 + 'ua',
              name: name,
              open: 'unconfirmed',
              address: address,
              lat: lat,
              long: long,
              ratings: [
                {
                  picture: 'http://unsplash.it/70?random&gravity=center',
                  user: 'Vous',
                  stars: ratingStars,
                  comment: rating
                }
              ],
              mergedRatings: [this.ratings]
            })

            this.setState(
              {
                newRestaurantsEntry: restoJSON
              },
              () => this.mergeLists()
            )
          },
          /** 
          Allow user to add review to a restaurant from any sources (JSON/API/User-added) */
          addReview: ({ rating, ratingStars, placeId }) => {
            let restoJSON = this.state.addedReviews
            const index = restoJSON.findIndex(x => x.id === placeId)
            const review = {
              picture: 'http://unsplash.it/70?random&gravity=center',
              user: 'Vous',
              stars: ratingStars,
              comment: rating
            }
            if (restoJSON[index] === undefined) {
              restoJSON.push({ id: placeId, ratings: [review] })
            } else {
              restoJSON[index].ratings.push(review)
            }

            console.log(restoJSON)

            this.setState({ addedReviews: restoJSON }, () => this.mergeLists())
          },
          /**
          Retrieve user added reviews for a restaurant */
          setReviewsForRestaurant: (id, reviews) => {
            const { restaurants } = this.state
            let restaurantsWithReview = restaurants
            const index = restaurantsWithReview.findIndex(x => x.id === id)
            restaurantsWithReview[index].ratings = reviews
          }
        }}
      >
        {this.props.children}
      </RestaurantsContext.Provider>
    )
  }
}
