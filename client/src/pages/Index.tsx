import { useLocation } from 'react-router-dom'
import ProductPage from '../components/ProductPage'
import TxnDetail from '../components/TxnDetail'

const Index = () => {
  // Get the current location object
  const location = useLocation()

  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search)

  // Get the value of the 'txn' parameter
  const txn = queryParams.get('txn')
  console.log(txn)

  if (txn) {
    return <TxnDetail txnId={txn} />
  } else {
    return <ProductPage />
  }
}

export default Index
