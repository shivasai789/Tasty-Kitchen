import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

class Login extends Component {
  state = {
    username: '',
    password: '',
    errorMsg: '',
    isError: false,
  }

  onSubmitSuccess = jwtToken => {
    const {history} = this.props
    Cookies.set('jwt_token', jwtToken, {expires: 30})
    history.replace('/')
    this.setState({isError: false})
  }

  onSubmitFailure = errorMsg => {
    this.setState({errorMsg, isError: true})
  }

  handleOnSubmit = async e => {
    e.preventDefault()

    const {username, password} = this.state
    const userDetails = {username, password}
    const apiUrl = 'https://apis.ccbp.in/login'

    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }

    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      this.onSubmitSuccess(data.jwt_token)
    } else {
      this.onSubmitFailure(data.error_msg)
    }
  }

  handleUsername = e => {
    this.setState({username: e.target.value})
  }

  handlePassword = e => {
    this.setState({password: e.target.value})
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    const {errorMsg, isError} = this.state
    return (
      <div className="login-container">
        <div className="left">
          <img
            src="https://res.cloudinary.com/dsovyumur/image/upload/v1742800935/login-sm-img_isdrqk.svg"
            alt="logo"
            className="tk-logo1"
          />
          <div className="login-form-cont">
            <img
              src="https://res.cloudinary.com/dsovyumur/image/upload/v1742796910/tk-logo_zdaaxt.svg"
              alt="website logo"
              className="tk-logo"
            />
            <br />
            <h2>Tasty Kitchens</h2>
            <h1 style={{marginBottom: '30px'}}>Login</h1>
            <form className="login-form" onSubmit={this.handleOnSubmit}>
              <div>
                <label htmlFor="username">USERNAME</label>
                <br />
                <input
                  id="username"
                  type="text"
                  onChange={this.handleUsername}
                />
              </div>
              <div>
                <label htmlFor="password">PASSWORD</label>
                <br />
                <input
                  id="password"
                  type="password"
                  onChange={this.handlePassword}
                />
              </div>
              {isError && <p style={{color: 'red'}}>*{errorMsg}</p>}
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
        <div>
          <img
            src="https://res.cloudinary.com/dsovyumur/image/upload/v1742793752/login-lg-img_mhm1r0.png"
            alt="website login"
            className="lg-login-img"
          />
        </div>
      </div>
    )
  }
}

export default Login
