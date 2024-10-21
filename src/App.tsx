import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Main } from "./pages"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
