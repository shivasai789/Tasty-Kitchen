import {Component} from 'react'
import Cookies from 'js-cookie'
import {BsFilterLeft} from 'react-icons/bs'
import {FaSearch} from 'react-icons/fa'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import Footer from '../Footer'
import HomeSlider from '../HomeSlider'
import ListItem from '../RestaurantItem'
import Counter from '../Counter'
import './index.css'

const sortByOptions = [
  {id: 0, displayText: 'Highest', value: 'Highest'},
  {id: 2, displayText: 'Lowest', value: 'Lowest'},
]
const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}
const limit = 9

class Home extends Component {
  state = {
    sliderData: [],
    slidersStatus: apiStatusConstants.initial,
    selectedSortByValue: sortByOptions[1].value,
    restaurantApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activePage: 1,
    popularRestaurantData: [],
  }

  componentDidMount() {
    this.getCarouselData()
    this.getAllRestaurantsData()
  }

  getCarouselData = async () => {
    this.setState({slidersStatus: apiStatusConstants.inProgress})
    const apiUrl = 'https://apis.ccbp.in/restaurants-list/offers'
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()

    if (response.ok) {
      this.setState({
        sliderData: data.offers,
        slidersStatus: apiStatusConstants.success,
      })
    } else {
      console.log(response.error_msg)
      this.setState({slidersStatus: apiStatusConstants.failure})
    }
  }

  getActivePage = page => {
    window.scrollTo(500, 500)
    this.setState({activePage: page}, this.getAllRestaurantsData)
  }

  convertRestaurantObjects = object => ({
    costForTwo: object.cost_for_two,
    cuisine: object.cuisine,
    id: object.id,
    imageUrl: object.image_url,
    location: object.location,
    name: object.name,
    userRating: {
      rating: object.user_rating.rating,
      totalReviews: object.user_rating.total_reviews,
    },
  })

  getAllRestaurantsData = async () => {
    this.setState({restaurantApiStatus: apiStatusConstants.inProgress})
    const {selectedSortByValue, activePage, searchInput} = this.state
    const jwtToken = Cookies.get('jwt_token')
    const offset = (activePage - 1) * limit
    const restaurantsApiUrl = `https://apis.ccbp.in/restaurants-list?search=${searchInput}&offset=${offset}&limit=${limit}&sort_by_rating=${selectedSortByValue}`

    const options = {
      method: 'GET',
      headers: {Authorization: `Bearer ${jwtToken}`},
    }
    const response = await fetch(restaurantsApiUrl, options)

    if (response.ok) {
      const data = await response.json()
      const convertedRestaurants = data.restaurants.map(
        this.convertRestaurantObjects,
      )
      this.setState({
        restaurantApiStatus: apiStatusConstants.success,
        popularRestaurantData: convertedRestaurants,
      })
    } else {
      this.setState({restaurantApiStatus: apiStatusConstants.failure})
    }
  }

  renderPopularRestaurants = () => {
    const {popularRestaurantData} = this.state
    return (
      <ul className="home-page-restaurant-un-order-list-data">
        {popularRestaurantData.map(each => (
          <ListItem key={each.id} item={each} />
        ))}
      </ul>
    )
  }

  noRestaurantsFound = () => (
    <div>
      <p>No Restaurants Found!</p>
    </div>
  )

  changeTheSortByOptionValue = event => {
    this.setState(
      {selectedSortByValue: event.target.value},
      this.getAllRestaurantsData,
    )
  }

  handleSearchInputChange = event => {
    this.setState({searchInput: event.target.value})
  }

  handleSearchSubmit = () => {
    this.setState({activePage: 1}, this.getAllRestaurantsData)
  }

  handleEnterPress = event => {
    if (event.key === 'Enter') {
      this.handleSearchSubmit()
    }
  }

  sortByRestaurant = () => {
    const {selectedSortByValue, searchInput} = this.state

    return (
      <div className="home-sort-by-main-container">
        <div className="home-sort-by-content-container">
          <h1 className="home-popular-restaurant-heading">
            Popular Restaurants
          </h1>
          <p className="home-sort-by-content-paragraph">
            Select Your favourite restaurant special dish and make your day
            happy...
          </p>
          <div className="search-box-cont">
            <input
              type="search"
              placeholder="Search.."
              value={searchInput}
              onChange={this.handleSearchInputChange}
              onKeyDown={this.handleEnterPress}
            />
            <button onClick={this.handleSearchSubmit}>
              <FaSearch style={{color: '#F7931E'}} />
            </button>
          </div>
        </div>
        <div className="home-sort-by-sorting-container">
          <BsFilterLeft size={25} color="#475569" />
          <p className="home-sort-by-sort-icon-paragraph">Sort By</p>
          <select
            className="home-page-sort-by-options-style"
            onChange={this.changeTheSortByOptionValue}
            value={selectedSortByValue}
          >
            {sortByOptions.map(eachOption => (
              <option key={eachOption.id}>{eachOption.displayText}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  renderSliderView = () => {
    const {slidersStatus, sliderData} = this.state
    switch (slidersStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div
            testid="restaurants-offers-loader"
            className="home-slider-container"
          >
            <Loader type="ThreeDots" color="#F7931E" height="50" width="50" />
          </div>
        )
      case apiStatusConstants.success:
        return (
          <div className="home-page-slider-container">
            <HomeSlider sliderData={sliderData} />
          </div>
        )
      default:
        return null
    }
  }

  renderDisplayRestaurantsView = () => {
    const {restaurantApiStatus} = this.state
    switch (restaurantApiStatus) {
      case apiStatusConstants.success:
        return this.renderPopularRestaurants()
      case apiStatusConstants.inProgress:
        return (
          <div
            testid="restaurants-list-loader"
            className="home-slider-container"
          >
            <Loader type="ThreeDots" color="#F7931E" height="50" width="50" />
          </div>
        )
      case apiStatusConstants.failure:
        return this.noRestaurantsFound()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="home-page-content-including-slider">
          {this.renderSliderView()}
          {this.sortByRestaurant()}
          {this.renderDisplayRestaurantsView()}
          <Counter pageChangeFunction={this.getActivePage} />
        </div>
        <Footer />
      </>
    )
  }
}

export default Home
