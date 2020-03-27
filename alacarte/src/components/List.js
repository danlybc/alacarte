import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Filter from './Filter'
import Form from './Form'
import Search from './Search'

import RestaurantsContext from '../context/RestaurantsContext'

import './List.css'
import Logo from './LogoBadge'
import Card from './Card'

/**
 * List of cards of visible restaurants
 */
class List extends Component {
  static contextType = RestaurantsContext

  static propTypes = {
    /** List position, used to change elements behavior and state
     * based on the user interface
     */
    listPosition: PropTypes.number,
    /** Get which card is open */
    openedCardIndex: PropTypes.number,
    /** Function to change position and list state */
    onChange: PropTypes.func,
    /** Stars filter number, min is 1 max is 5 */
    stars: PropTypes.oneOfType([
      PropTypes.objectOf(PropTypes.number),
      PropTypes.number
    ]).isRequired,
    /** Array containing current view center address as [Address, Formatted address, {lat, lng}] */
    currentAddress: PropTypes.array,
    /** Array containing user location address as [Address, Formatted address, {lat, lng}] */
    userLocationAddress: PropTypes.array,
    /** Function to get total rating taking account of all reviews */
    calculateRating: PropTypes.func,
    /** Function to check if restaurant is in bounds, to show only visible restaurants */
    isInBounds: PropTypes.func,
    /** Boolean to know if the AddRestaurant form is either active (true) or closed(false)*/
    formState: PropTypes.bool,
    /** Number to look if the actual card open has its AddReview form open */
    openedReviewCardIndex: PropTypes.number,
    /** Object containing multiples onClick function : {         
            handle: Handle every click inside the list,
            logo: Set initial center position when clicking the logo,
            filter: Setting stars filter when clicking a star,
            card: Changing state of card on click,
            form: Changing Add New Restaurant form state on click,
            review: Changing Add New Review form state on click,
            toggle: Toggle between Nearby Places or City Search on click,
            result: See default city when clicking City Search result} */
    onClick: PropTypes.objectOf(PropTypes.func),
    /** Bool to see if user gave access to his location (true if access) */
    locationShared: PropTypes.bool,
    /** Bool to see user preference for searches feature : True is Nearby Places, False is City Search
     * If locationShared is true, default will be true (Nearby Places) otherwise false
     */
    mapToggle: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.formRestaurantInput = React.createRef()
    this.placeSearchInput = React.createRef()
  }
  componentDidMount() {
    this.initAutocompletes()
  }

  /**
   * Autocomplete for two fields : Search cities
   * AND Address field when adding a new restaurant
   */
  initAutocompletes() {
    const { map, onClick } = this.props
    if (window.google && this.formRestaurantInput.current) {
      let formPlaces = new window.google.maps.places.Autocomplete(
        this.formRestaurantInput.current.refs.cpNewRestaurant,
        {
          componentRestrictions: { country: 'fr' }
        }
      )

      let searchPlaces = new window.google.maps.places.Autocomplete(
        this.placeSearchInput.current.refs.allSearchRef,
        {
          types: ['(cities)'],
          componentRestrictions: { country: 'fr' }
        }
      )
      window.google.maps.event.addListener(
        searchPlaces,
        'place_changed',
        () => {
          document.getElementById(
            'allSearch-field'
          ).placeholder = document.getElementById('allSearch-field').value
          document.getElementById('allSearch-field').value = ''
          map.setCenter({
            lat: searchPlaces.getPlace().geometry.location.lat(),
            lng: searchPlaces.getPlace().geometry.location.lng()
          })
          onClick.result({
            lat: searchPlaces.getPlace().geometry.location.lat(),
            lng: searchPlaces.getPlace().geometry.location.lng()
          })
        }
      )
      setTimeout(() => {
        document
          .getElementById('newRestaurantAddress')
          .parentNode.append(
            document.getElementsByClassName('pac-container')[0]
          )
        document
          .getElementById('allSearch-field')
          .parentNode.append(
            document.getElementsByClassName('pac-container')[1]
          )
      }, 1000)
    }
  }

  /** Set new list position and close form
   * when user click on a result
   */
  updateListState = () => {
    const { onChange } = this.props
    this.setState({ formState: false }, onChange('default'))
  }

  render() {
    const {
      listPosition,
      openedCardIndex,
      stars,
      currentAddress,
      userLocationAddress,
      geocoder,
      calculateRating,
      isInBounds,
      formState,
      openedReviewCardIndex,
      onClick,
      map,
      maps,
      service,
      locationShared,
      mapToggle,
      defaultCity,
      filterMinSelector
    } = this.props
    const context = this.context
    return (
      <>
        <div
          onClick={() =>
            onClick.logo({
              center: userLocationAddress ? userLocationAddress[2] : defaultCity
            })
          }
        >
          <Logo status={listPosition > 0 && 'hidden'} />
        </div>
        <Filter
          onClick={onClick.filter}
          stars={stars}
          filterMinSelector={filterMinSelector}
          style={listPosition !== -50 ? { opacity: 0, height: 7 } : {}}
        />
        <div className="List" style={{ marginBottom: listPosition + 'vh' }}>
          <div className="searchField">
            <Search
              ref={this.placeSearchInput}
              onClick={this.updateListState}
              currentAddress={currentAddress}
              userLocationAddress={userLocationAddress}
              isInBounds={isInBounds}
              onResultClick={onClick.card}
              starsFilter={stars}
              calculateRating={calculateRating}
              maps={maps}
              service={service}
              locationShared={locationShared}
              onToggleClick={onClick.toggle}
              mapToggle={mapToggle}
            />
          </div>
          <button
            className={`List-addRestaurant ${formState && 'active'}`}
            onClick={() => onClick.form()}
          >
            Add restaurant
          </button>
          <Form
            ref={this.formRestaurantInput}
            map={map}
            type="restaurant"
            open={formState}
            pin={currentAddress && currentAddress[1]}
            locate={userLocationAddress && userLocationAddress[1]}
            geocoder={geocoder}
          />
          <Filter
            onClick={onClick.filter}
            stars={stars}
            type="inline"
            filterMinSelector={filterMinSelector}
            style={listPosition <= -50 ? { opacity: 0, left: '2vh' } : {}}
          />
          <div className="List-cards">
            {context.restaurants.map((resto, index) =>
              isInBounds({ lat: resto.lat, long: resto.long }) &&
              (calculateRating(resto.ratings)
                ? calculateRating(resto.ratings)
                : resto.stars) >= stars.min &&
              (calculateRating(resto.ratings)
                ? calculateRating(resto.ratings)
                : resto.stars) <= stars.max ? (
                <Card
                  index={index}
                  key={resto.id}
                  position={{ lat: resto.lat, lng: resto.long }}
                  className={openedCardIndex === resto.id ? 'active' : ''}
                  resto={resto}
                  map={map}
                  calculateStars={calculateRating}
                  onClick={onClick.card}
                  onFormClick={onClick.review}
                  formOpen={openedReviewCardIndex === index ? true : false}
                />
              ) : (
                <></>
              )
            )}
          </div>
        </div>
      </>
    )
  }
}

export default List
