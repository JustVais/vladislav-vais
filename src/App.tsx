import { Route, Routes } from "react-router-dom"

import { Home } from './pages/Home'
import { About } from './pages/About'
import { Work } from './pages/Work'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/work" element={<Work />} />
    </Routes>
  )
}

export default App
