import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'

import { bootstrapURLKeys } from './bootstrapURLKeys'
import List from './components/List'
import Tooltip from './components/Tooltip'
import Tutorial from './components/Tutorial'
import LocationPermissionWarning from './components/LocationPermissionWarning'

import RestaurantsContext from './context/RestaurantsContext'

import userMarker from './assets/icons/user-marker.svg'
import marker from './assets/icons/marker.svg'

import './MapContainer.css'

const mapStyle = {
  width: '100%',
  height: '100%'
}

// TODO : Add LocalStorage variables for location permission
// and tutorial state and User Warning

/** Hide default elements from map */
const mapOptions = [
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  }
]

/** Restaurant marker component */
const Marker = ({ restaurantInfo: info, rating, onClick, id }) => (
  <div id={id} className="Marker" onClick={() => onClick(id)}>
    <img
      src={marker}
      alt="Restaurant marker"
      className="MapContainer-marker"
    ></img>
    <Tooltip info={info} rating={rating ? rating : info.stars} />
  </div>
)

/** User marker component */
const UserMarker = () => (
  <div className="UserMarker">
    <div className="MapContainer-userMarker-glow"></div>
    <div
      className="MapContainer-userMarker-glow"
      style={{ animationDelay: '1s' }}
    ></div>
    <div
      className="MapContainer-userMarker-glow"
      style={{ animationDelay: '2s' }}
    ></div>
    <img src={userMarker} className="MapContainer-userMarker" alt="" />
  </div>
)

/** Used to set list to its default position at bottom
 * with everything closed
 */
const DEFAULT_LIST_POSITION = -50
const DEFAULT_MAX_LIST_POSITION = 400
const INITIAL_LIST_STATE = {
  formState: false,
  openedReviewCardIndex: null,
  openedCard: null
}

/** Used to set cards to default state
 * with everything closed
 */
const INITIAL_CARDS_STATE = {
  openedReviewCardIndex: null,
  openedCard: null
}

class MapContainer extends Component {
  static contextType = RestaurantsContext
  state = {
    ...INITIAL_LIST_STATE,
    formState: false,
    zoom: 15,
    refreshWhileMoving: true,
    refreshLoading: false,
    maxListPosition: DEFAULT_MAX_LIST_POSITION,
    userLocation: { lat: null, lng: null, default: 1 },
    userLocationStreet: null,
    centerPositionStreet: null,
    loading: true,
    GeocoderAPI: null,
    starsFilter: { min: 2, max: 4 },
    filterMinSelector: true,
    listPosition: DEFAULT_LIST_POSITION,
    filteredCard: [],
    locationShared: null,
    defaultCity: { lat: 48.8566, lng: 2.3522, default: 1 },
    mapToggle: true,
    tutorialState: window.localStorage.getItem('tutorialFinishState')
      ? window.localStorage.getItem('tutorialFinishState')
      : 0
  }

  /** Start Geocoder Api */
  initGeocoder = ({ map, maps }) => {
    const Geocoder = new maps.Geocoder()
    const service = new maps.places.PlacesService(map)
    this.setState({ GeocoderAPI: Geocoder, map, maps, service }, () =>
      this.getUserStreet()
    )
  }

  /** Check if user want to use his location */
  setLocationPermission = bool => {
    this.setState({ locationShared: bool })
    if (bool) {
      if (navigator.geolocation) {
        this.getUserLocation(1)
      }
    } else {
      this.setState({ mapToggle: false })
    }
  }

  /** When an user search for a city
   * It'll become the default city, clicking on logo will bring
   * user back to default city position
   * City position will be remembered in local storage for next time
   * @param {Object} position {lat, lng}
   */
  setDefaultCityPosition = position => {
    this.setState({ defaultCity: position })
  }
  /** Change map center position */
  setCenter = position => {
    this._map.map_.setCenter(position)
  }
  // CLICK HANDLERS
  /** Handle click for UX
   * If List is scrolled, clicking outside will close all open state (Card, Forms)
   * and set list position to default
   */
  handleClick = event => {
    const { listPosition } = this.state
    let element = event.target
    const elementParents = []
    while (element.parentElement) {
      elementParents.unshift(element)
      element = element.parentElement
    }
    elementParents.forEach(
      (e, i) => (elementParents[i] = e.className.split(' ')[0])
    )
    if (elementParents.includes('Form') && !elementParents.includes('Card')) {
      this.setListPosition(0)
      return
    }
    if (elementParents.includes('Card-ratings-button')) {
      return
    } else if (listPosition > DEFAULT_LIST_POSITION) {
      if (
        !(
          elementParents.includes('List') ||
          elementParents.includes('Filter') ||
          elementParents.includes('LogoBadge') ||
          elementParents.includes('Marker')
        )
      ) {
        this.setListPosition(DEFAULT_LIST_POSITION)
        this.setState({ ...INITIAL_CARDS_STATE })
        this.changeMaxPosition(
          document.getElementsByClassName('Card').length * 20
        )
      }
    }
  }

  /** Change tutorial state on click */
  handleTutorialClick = (forcedState, event) => {
    event.stopPropagation()
    const { tutorialState } = this.state
    if (!forcedState) {
      console.log(window.localStorage.getItem('tutorialFinishState'))
      const prevTutorialState = parseInt(tutorialState)

      if (prevTutorialState <= 3) {
        this.setState({ tutorialState: prevTutorialState + 1 }, () => {
          window.localStorage.setItem('tutorialFinishState', 0)
        })
      }
    }
    if (forcedState > 0) {
      this.setState({ tutorialState: forcedState }, () => {
        window.localStorage.setItem('tutorialFinishState', forcedState)
      })
    }
  }

  /** Change search toggle on click
   * true : Nearby Places / false : City Search
   */
  handleTogglerClick = state => {
    this.setState({ mapToggle: state })
  }

  /** Change state of Add New Restaurant on click */
  handleFormClick = () => {
    if (this.state.formState) {
      this.setListPosition('default')
      this.setState({ ...INITIAL_LIST_STATE }, () => console.log(this.state))
    } else {
      this.setListPosition(5)
      this.setState({
        formState: true,
        openedReviewCardIndex: null,
        openedCard: null
      })
    }
  }

  /** Change state of Card on click */
  handleCardClick = id => {
    const { service, maps } = this.state
    const context = this.context
    const actualCards = document.querySelectorAll('.Card')
    let index = Array(...actualCards).findIndex(x => x.id === id)
    if (this.state.openedCard !== id) {
      const contextIndex = context.restaurants.findIndex(x => x.id === id)
      if (context.restaurants[contextIndex].ratings.length < 1) {
        service.getDetails(
          {
            placeId: id,
            fields: ['review']
          },
          (place, status) => {
            if (status === maps.places.PlacesServiceStatus.OK) {
              if (place.reviews) {
                place.reviews.map(review => {
                  context.addInBoundsRestaurantGoogleReviews({
                    id: id,
                    picture: review.profile_photo_url,
                    user: review.author_name,
                    stars: review.rating,
                    comment: review.text
                  })
                })
              }
            }
          }
        )
      }
      this.setState(
        { openedCard: id, openedReviewCardIndex: null, formState: false },
        () => {
          this.changeMaxPosition(this.state.maxListPosition + 20)
          this.setListPosition((index + 1) * 20 - (index / 1.3) * 10)
        }
      )
    }
  }

  /** Change state of Add New Review on click */
  handleReviewFormClick = index => {
    if (this.state.openedReviewCardIndex !== index) {
      this.setState({ openedReviewCardIndex: index }, () => {
        this.setListPosition(
          index * document.getElementsByClassName('Card').length + 50
        )
      })
    } else {
      this.setState({ openedReviewCardIndex: null }, () => {
        this.setListPosition(
          index * document.getElementsByClassName('Card').length + 25
        )
      })
    }
  }

  /** Set filter on click, will hide filter restaurants from view and list */
  handleFilterClick = stars => {
    const { filterMinSelector } = this.state
    this.setState(
      prevState => ({
        starsFilter: {
          min: filterMinSelector ? stars : prevState.starsFilter.min,
          max: !filterMinSelector ? stars : prevState.starsFilter.max
        }
      }),
      () => {
        this.setState(prevState => ({
          filterMinSelector: !prevState.filterMinSelector
        }))
        this.changeMaxPosition(document.querySelectorAll('.Card').length * 17)
      }
    )
  }

  /** Control user scroll for list positionning  */
  handleScroll = event => {
    const { listPosition, maxListPosition, tutorialState } = this.state
    event.preventDefault()
    if (tutorialState > 2) {
      let element = event.target
      const elementParents = []
      while (element.parentElement) {
        elementParents.unshift(element)
        element = element.parentElement
      }
      elementParents.forEach(
        (e, i) => (elementParents[i] = e.className.split(' ')[0])
      )
      // Restaurants reviews horizontal scroll
      if (elementParents.includes('Card-ratings-wrapper')) {
        if (event.deltaY > 0) {
          event.target.scrollLeft += 200
          if (
            element.parentElement &&
            element.parentElement.parentElement.includes('Card-ratings-wrapper')
          )
            element.parentElement.scrollLeft += 200
        } else {
          event.target.scrollLeft -= 200
          if (
            element.parentElement &&
            element.parentElement.parentElement.includes('Card-ratings-wrapper')
          )
            element.parentElement.scrollLeft -= 200
        }
        return
      }
      if (
        event.deltaY > 0 &&
        listPosition <= DEFAULT_LIST_POSITION + maxListPosition + 5
      ) {
        this.setState(prevState => ({
          listPosition: prevState.listPosition + 25
        }))
      } else {
        if (listPosition >= -50) {
          this.setState(prevState => ({
            listPosition: prevState.listPosition - 25
          }))
        }
      }
    }
  }

  // USER LOCATION AND MAP POSITIONNING
  /** Return user current location */
  getUserLocation = param => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        this.setState(
          {
            userLocation: {
              lat: latitude,
              lng: longitude
            },
            centerPosition: {
              lat: latitude,
              lng: longitude
            },

            loading: false
          },
          () => this.getUserStreet(param && param)
        )
      },
      err => {
        console.error(`ERROR(${err.code}): ${err.message}`)
        this.setState({ loading: false })
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    )
  }

  /**
   * @param  {Object} position Object with lat and lng properties
   */
  getCenter = position => {
    this.setState({ centerPosition: position.center }, () => {
      this.getCenterStreet()
    })
  }

  /** Get street info for current centered position */
  getCenterStreet = () => {
    const { GeocoderAPI, centerPosition } = this.state

    let centerPositionStreet

    GeocoderAPI &&
      GeocoderAPI.geocode({ location: centerPosition }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            centerPositionStreet = [
              results[0].formatted_address.split(',')[0],
              results[0].formatted_address,
              [
                results[0].geometry.location.lat(),
                results[0].geometry.location.lng()
              ]
            ]
            this.setState({ centerPositionStreet })
          }
        }
      })
  }

  /** Get street from user location
   * @param {Int} callTime check if the map is positionning on Load (prevent double queries)
   */
  getUserStreet = callTime => {
    const { GeocoderAPI, userLocation } = this.state
    let userLocationStreet
    GeocoderAPI &&
      GeocoderAPI.geocode({ location: userLocation }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            userLocationStreet = [
              results[0].formatted_address.split(',')[0],
              results[0].formatted_address,
              userLocation
            ]
            this.setState({ userLocationStreet }, () =>
              this.setBounds(callTime)
            )
          }
        }
      })
  }

  /**
   * Calculate approx. center from coordinates
   * @param  {Object} coords Coordinates object from Geocoder
   */
  calculateCoords = coords => {
    return (coords.g + coords.h) / 2
  }

  /** Set actual map bounds and call function to add new restaurants
   * if user use 'Refresh while moving map' feature
   * and if it's not a window onload call
   */
  setBounds = callTime => {
    const { map, refreshWhileMoving } = this.state

    if (map) {
      const bounds = map.getBounds()

      this.setState({ bounds }, () => {
        if (refreshWhileMoving) {
          if (callTime !== 1) this.addInBoundsRestaurants(bounds)
        }
      })
    }
  }

  /**
   * Check if a marker is on the map
   * @param  {Object} position {lat, lng}
   */
  areMarkersInBounds = position => {
    const { bounds } = this.state
    let inBounds = false
    if (bounds) {
      if (
        position &&
        bounds.getSouthWest().lat() <= position.lat &&
        position.lat <= bounds.getNorthEast().lat() &&
        bounds.getSouthWest().lng() <= position.long &&
        position.long <= bounds.getNorthEast().lng()
      ) {
        inBounds = true
      }
    }
    return inBounds
  }

  // LIST MODIFICATIONS
  /** Set user preference for refreshing the map */
  changeRefreshMethod = () => {
    this.setState(freshState => ({
      refreshWhileMoving: !freshState.refreshWhileMoving
    }))
  }

  /** Calculate mean of ratings from all restaurant ratings
   * @param {Array} ratings Array containing restaurant reviews
   */
  calculateRestaurantRating = ratings => {
    let restaurantRating = 0
    for (let rating of ratings) {
      restaurantRating = restaurantRating + rating.stars
    }
    restaurantRating = restaurantRating / ratings.length
    return Math.floor(restaurantRating)
  }

  /**
   * Adapt list position to actual interaction
   * @param  {Int} value percentage value of list position
   */
  setListPosition = value => {
    if (value === 'default') {
      this.setState({
        listPosition: DEFAULT_LIST_POSITION
      })
    } else
      this.setState({
        listPosition: value
      })
  }

  /**
   * Adapt max list position to actual interaction
   * @param  {Int} value percentage value of list position
   */
  changeMaxPosition = value => {
    if (value === 'default') {
      this.setState({ maxListPosition: DEFAULT_MAX_LIST_POSITION })
    } else {
      this.setState({ maxListPosition: value })
    }
  }

  /**
   * Add filtered restaurants to local state array for further manipulation
   * @param  {Int} index
   */
  addFilteredRestaurants = index => {
    if (index) {
      const { filteredCard } = this.state
      if (
        filteredCard.length >= document.getElementsByClassName('Card').length
      ) {
        this.setState({ filteredCard: [] })
      }
      const filtered = [...filteredCard]
      filtered.push(index)
      console.log(filtered)
      this.setState({ filteredCard: filtered })
    }
  }

  /**
   * Add new in bounds restaurant to RestaurantsContext
   * @param  {Object} bounds {lat, lng}
   */
  addInBoundsRestaurants = bounds => {
    const { maps, map, service } = this.state
    const context = this.context
    // Remove previous restaurants to prevent duplicate request and restaurants
    context.removeInBounds()

    if (!bounds) {
      bounds = this.state.bounds
    }

    if (map) {
      this.setState({ refreshLoading: true })

      service.nearbySearch(
        { bounds, type: ['restaurant'] },
        (results, status) => {
          if (status === maps.places.PlacesServiceStatus.OK) {
            results.forEach(elem => {
              service.getDetails(
                {
                  placeId: elem.reference,
                  fields: [
                    'rating',
                    'international_phone_number',
                    'opening_hours',
                    'utc_offset_minutes',
                    'website'
                  ]
                },
                (place, status) => {
                  if (status === maps.places.PlacesServiceStatus.OK) {
                    context.addInBoundsRestaurants({
                      id: elem.reference,
                      name: elem.name,
                      address: elem.vicinity,
                      open:
                        place.opening_hours && place.opening_hours.isOpen()
                          ? 'open'
                          : 'closed',
                      lat: elem.geometry.location.lat(),
                      long: elem.geometry.location.lng(),
                      reviews: [],
                      number: place.international_phone_number,
                      website: place.website,
                      rating: place.rating
                    })
                  }
                }
              )
            })
          }
        }
      )
      this.setState({ refreshLoading: false }, () => {
        this.changeMaxPosition(
          document.querySelectorAll('.Card').length > 2
            ? document.querySelectorAll('.Card').length * 17
            : context.restaurants.length * 17
        )
      })
    }
  }

  /** Adding event listeners */
  componentDidMount() {
    const { tutorialState, locationShared, defaultCity } = this.state
    if (locationShared) {
      if (navigator.geolocation) {
        this.getUserLocation()
      }
    } else {
      this.setState({ loading: false }, () =>
        this.getCenter({ defaultCity, default: 1 })
      )
    }

    window.addEventListener('click', event => {
      this.handleClick(event)
    })

    window.addEventListener('wheel', event => {
      this.handleScroll(event)
    })

    window.addEventListener('keydown', event => {
      if (event.keyCode === 27) {
        if (tutorialState < 3) {
          this.setState({ tutorialState: 3 })
        }
      }
    })
  }

  render() {
    const {
      refreshLoading,
      refreshWhileMoving,
      formState,
      openedReviewCardIndex,
      openedCard,
      listPosition,
      starsFilter,
      GeocoderAPI,
      centerPosition,
      loading,
      userLocation,
      centerPositionStreet,
      userLocationStreet,
      service,
      bounds,
      tutorialState,
      locationShared,
      mapToggle,
      defaultCity,
      filterMinSelector
    } = this.state
    const context = this.context
    if (loading) return null
    return (
      <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
        {locationShared === null && (
          <LocationPermissionWarning onClick={this.setLocationPermission} />
        )}
        {locationShared !== null && (
          <Tutorial
            tutorialState={tutorialState}
            onClick={this.handleTutorialClick}
          />
        )}
        <button
          onClick={() => this.setLocationPermission(!locationShared)}
          className={`location-button ${locationShared ? 'active' : ''}`}
          style={{ left: !refreshWhileMoving && '57%' }}
        >
          <ion-icon name="locate" size="large"></ion-icon>
        </button>
        <GoogleMapReact
          ref={map => (this._map = map)}
          yesIWantToUseGoogleMapApiInternals
          bootstrapURLKeys={bootstrapURLKeys}
          zoom={16}
          options={{ styles: mapOptions, scrollwheel: false }}
          style={mapStyle}
          tilt={0}
          defaultCenter={defaultCity ? defaultCity : userLocation}
          center={centerPosition && centerPosition}
          onChange={map => {
            this.getCenter(map, 'onChange')
            this.setBounds()
          }}
          onGoogleApiLoaded={({ map, maps }) =>
            this.initGeocoder({ map, maps })
          }
        >
          {userLocation.default !== 1 && (
            <UserMarker lat={userLocation.lat} lng={userLocation.lng} />
          )}
          {context.restaurants.map(
            (elem, index) =>
              this.areMarkersInBounds({ lat: elem.lat, long: elem.long }) &&
              (this.calculateRestaurantRating(elem.ratings)
                ? this.calculateRestaurantRating(elem.ratings)
                : elem.stars) >= starsFilter.min &&
              (this.calculateRestaurantRating(elem.ratings)
                ? this.calculateRestaurantRating(elem.ratings)
                : elem.stars) <= starsFilter.max && (
                <Marker
                  key={elem.id}
                  id={elem.id}
                  lat={elem.lat}
                  lng={elem.long}
                  index={index}
                  onClick={this.handleCardClick}
                  restaurantInfo={elem}
                  rating={this.calculateRestaurantRating(elem.ratings)}
                />
              )
          )}
        </GoogleMapReact>
        <div
          className={`refresh-map ${!refreshWhileMoving && 'refresh-button'}`}
          onClick={
            refreshWhileMoving
              ? () => this.changeRefreshMethod()
              : () => this.addInBoundsRestaurants()
          }
        >
          <input
            defaultChecked
            type={refreshWhileMoving ? 'checkbox' : 'button'}
            name="refresh-map"
            value={!refreshWhileMoving && 'Click to refresh area'}
          />
          {refreshWhileMoving && (
            <label htmlFor="refresh-map">
              Refresh when I'm moving the map{' '}
            </label>
          )}
          {refreshLoading && <ion-icon name="compass"></ion-icon>}
        </div>
        <ion-icon name="contract"></ion-icon>
        <List
          onClick={{
            handle: this.handleClick,
            logo: this.getCenter,
            filter: this.handleFilterClick,
            card: this.handleCardClick,
            form: this.handleFormClick,
            review: this.handleReviewFormClick,
            toggle: this.handleTogglerClick,
            result: this.setDefaultCityPosition
          }}
          formState={formState}
          openedReviewCardIndex={openedReviewCardIndex}
          openedCardIndex={openedCard}
          isInBounds={this.areMarkersInBounds}
          calculateRating={this.calculateRestaurantRating}
          onChange={this.setListPosition}
          defaultPosition={DEFAULT_LIST_POSITION}
          listPosition={listPosition}
          listMaxPositionModifier={this.changeMaxPosition}
          stars={starsFilter}
          filterMinSelector={filterMinSelector}
          currentAddress={centerPositionStreet}
          userLocationAddress={userLocationStreet}
          geocoder={GeocoderAPI}
          map={{ setCenter: this.setCenter }}
          service={service}
          bounds={bounds}
          locationShared={locationShared}
          mapToggle={mapToggle}
          defaultCity={defaultCity}
        />
      </div>
    )
  }
}

export default MapContainer
