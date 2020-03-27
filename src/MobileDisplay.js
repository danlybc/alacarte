import React, { Component } from 'react'

import './MobileDisplay.css'
import LogoBadge from './components/LogoBadge'

import BgShape1 from './assets/mobile/Bg-Shape-1.svg'
import BgShape2 from './assets/mobile/Bg-Shape-2.svg'
import BgShape3 from './assets/mobile/Bg-Shape-3.svg'

const style = {
  wrapper: {
    // width: '100%',
    // height: '100%',
    // backgroundColor: 'red'
  }
}

/** Show a mobile user warning and input to get informed when
 * the app will be available on mobile
 */
class MobileDisplay extends Component {
  state = {
    notifyOpen: false
  }

  handleNotifyClick = () => {
    this.setState(prevState => ({
      notifyOpen: !prevState.notifyOpen
    }))
  }

  render() {
    const { notifyOpen } = this.state
    return (
      <div className="MobileDisplay" style={style.wrapper}>
        <img className="Bg-Shape Bg-Shape-1" src={BgShape1} alt="" />
        <img className="Bg-Shape Bg-Shape-2" src={BgShape2} alt="" />
        <img className="Bg-Shape Bg-Shape-3" src={BgShape3} alt="" />
        <LogoBadge />
        <h1 className="MobileDisplay-Title">Whoops...</h1>
        <p className="MobileDisplay-Content">
          Sadly, Àlacarte is not yet available on mobile.
        </p>
        <p className="MobileDisplay-Twitter">
          Follow us on Twitter to get updates <a href="#">@alacarte</a>
        </p>
        <div
          className={`MobileDisplay-Notify ${
            notifyOpen ? 'Notify-extended' : ''
          }`}
        >
          <a onClick={() => this.handleNotifyClick()}>
            Get notified when the mobile version will be released
          </a>
          <form onSubmit={() => false}>
            <input readOnly type="email" placeholder="john@doe.com" />
            <button readOnly type="submit">
              Ok
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default MobileDisplay
