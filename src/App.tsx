import { Routes, Route } from "react-router"
import DeliveryPrices from "./pages/DeliveryPrices"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DeliveryPrices />} />
      <Route path="/delivery-prices" element={<DeliveryPrices />} />
    </Routes>
  )
}

export default App

