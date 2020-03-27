import React, { Component } from 'react'
import RestaurantsContext from '../context/RestaurantsContext'

import './Search.css'

/**
 * Search component accessible at top of the list
 * Composed of a browser for visible restaurant
 * AND a Google Autocomplete to jump to another city
 */
class Search extends Component {
  static contextType = RestaurantsContext
  state = {
    query: null
  }

  handleInputChange = event => {
    this.setState({ query: event.target.value.toLowerCase() })
  }

  /**
   * Mimic an autocomplete feature to get visible restaurants
   * If state is open it'll show
   * Clicking on it will open linked restaurant card
   */
  getUpdatedRestaurantName = (query, restaurant) => {
    const { onResultClick } = this.props
    let index = restaurant.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .indexOf(query)
    if (index !== -1) {
      return (
        <div
          tabindex="-1"
          id={restaurant.id}
          className={`Search-Results ${restaurant.open}`}
          onClick={() => {
            this.setState({ query: '' })
            document.getElementById('search-field').value = ''
            document.getElementById('search-field').placeholder =
              restaurant.name
            this.handleInputChange({ target: { value: '' } })
            onResultClick(restaurant.id)
          }}
        >
          {index > 0 && restaurant.name.slice(0, index)}
          <em>{restaurant.name.slice(index, index + query.length)}</em>
          {restaurant.name.slice(index + query.length, restaurant.name.length)}
        </div>
      )
    }
  }

  componentDidMount() {
    const { onResultClick } = this.props

    // Binding keys to make Nearby Restaurant lists more navigable
    let currentListElement = 0
    document.addEventListener('keydown', e => {
      const listElements = document.querySelectorAll(
        '.Search-Dropdown-List .Search-Results'
      )
      if (document.activeElement === document.getElementById('search-field')) {
        switch (e.keyCode) {
          case 38:
            e.preventDefault()
            listElements[currentListElement].classList.remove('selected')
            currentListElement =
              currentListElement > 0
                ? --currentListElement
                : listElements.length - 1
            listElements[currentListElement].classList.add('selected')
            break
          case 40:
            e.preventDefault()
            if (!currentListElement) {
              currentListElement = 0
            }
            listElements[currentListElement].classList.remove('selected')

            currentListElement =
              currentListElement < listElements.length - 1
                ? ++currentListElement
                : 0
            console.log(currentListElement)
            listElements[currentListElement].classList.add('selected')
            break
          case 13:
            e.preventDefault()
            this.setState({ query: '' })
            document.getElementById('search-field').value = ''
            document.getElementById(
              'search-field'
            ).placeholder = document.querySelectorAll(
              '.Search-Results.selected'
            )[0].textContent
            this.handleInputChange({ target: { value: '' } })
            document.querySelectorAll('.Search-Results.selected').length > 0 &&
              onResultClick(
                document.querySelectorAll('.Search-Results.selected')[0].id
              )

            break
          default:
            break
        }
      }
    })
  }

  render() {
    const {
      onClick,
      currentAddress,
      userLocationAddress,
      isInBounds,
      starsFilter,
      calculateRating,
      mapToggle,
      onToggleClick
    } = this.props
    const { query } = this.state
    const context = this.context

    return (
      <div className="Search" onClick={() => onClick()}>
        <div className="Search-MapToggler">
          <ion-icon
            title="Search any location to jump to it"
            name="search"
            class={!mapToggle && 'active'}
            onClick={() => onToggleClick(false)}
          ></ion-icon>
          <ion-icon
            title="Search only between visible locations"
            name="map"
            class={mapToggle && 'active'}
            onClick={() => onToggleClick(true)}
          ></ion-icon>
        </div>
        <div className="search-fields-wrapper">
          <input
            autoComplete="false"
            onChange={this.handleInputChange}
            type="text"
            id="search-field"
            name="search-bar"
            placeholder={
              currentAddress
                ? currentAddress[0]
                : userLocationAddress && userLocationAddress[0]
            }
            className={`List-streetName ${mapToggle && 'visible'}`}
          />
          <div className="Search-Dropdown-List">
            <ul>
              {context.restaurants.map(
                resto =>
                  isInBounds(resto) &&
                  (calculateRating(resto.ratings)
                    ? calculateRating(resto.ratings)
                    : resto.stars) >= starsFilter &&
                  this.getUpdatedRestaurantName(query, resto)
              )}
            </ul>
          </div>
          <input
            autoComplete="false"
            onChange={this.handleInputChange}
            type="text"
            ref="allSearchRef"
            id="allSearch-field"
            name="search-bar"
            placeholder="Search"
            className={`List-streetName ${!mapToggle && 'visible'}`}
          />
        </div>
      </div>
    )
  }
}

export default Search
