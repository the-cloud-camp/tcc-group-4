import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'

interface Txn {
  ticketId: string
  isRedeemed: boolean
  productId: string
  productName: string
  productDescription: string
  productImage: string
  price: number
}

const TxnDetail = () => {
  //get txnId from url
  const txnId = window.location.pathname.split('/')[1]
  const [txnItem, setTxnItem] = useState<Txn[]>([])

  const getTxnDetail = useCallback(async () => {
    const res = await axios.get(import.meta.env.VITE_API_URL + '/txn/' + txnId)
    setTxnItem(res.data.products)
  }, [txnId])

  useEffect(() => {
    getTxnDetail()
  }, [txnId, getTxnDetail])

  return (
    <>
      {txnItem &&
        txnItem.map((item, index) => {
          return (
            <div key={index} className="border-red-500 border-2 px-5">
              <p>{item.productName}</p>
              <p>{item.price}</p>
              <p>{item.ticketId}</p>
            </div>
          )
        })}
    </>
  )
}

export default TxnDetail
