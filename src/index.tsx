import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter as Router } from "react-router-dom"

import './fonts/Eurostile-Heavy.otf'
import './fonts/OpenSans-Bold.ttf'
import './fonts/OpenSans-Medium.ttf'
import './fonts/OpenSans-Light.ttf'
import './fonts/OpenSans-Regular.ttf'

import './i18n'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals()
