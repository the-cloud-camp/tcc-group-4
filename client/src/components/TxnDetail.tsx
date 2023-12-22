import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import RedeemTicketModal from './RedeemTicketModal'

interface Txn {
  txnId: string
  item: number
  txnAmount: number
  createdAt: string
  txnStatus: string
  products: TicketList[]
}
interface TicketList {
  ticketId: string
  isRedeemed: boolean
  productId: string
  productName: string
  productDescription: string
  productImage: string
  price: number
  place: string
  eventDate: string
}

const TxnDetail: React.FC<{ txnId: string }> = ({ txnId }) => {
  //get txnId from url
  // const txnId = window.location.pathname.split('/')[1]
  const [txn, setTxn] = useState<Txn>()
  const [ticket, setTicket] = useState<TicketList>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const getTxnDetail = useCallback(async () => {
    const res = await axios.get(
      import.meta.env.VITE_API_URL + '/group-4/app/txn/' + txnId,
    )
    setTxn(res.data)
  }, [txnId])

  useEffect(() => {
    getTxnDetail()
  }, [txnId, getTxnDetail])

  const selectTicket = (ticket: TicketList) => {
    setIsModalOpen(true)
    setTicket(ticket)
  }

  const handleCloseModal = () => {
    setTicket(undefined)
    setIsModalOpen(false)
  }

  const handleRedeem = async () => {
    const res = await axios.post(
      import.meta.env.VITE_API_URL + '/group-4/app/ticket/redeem',
      {
        ticketId: ticket?.ticketId,
      },
    )
    if (res.status === 200) {
      getTxnDetail()
      setTicket(undefined)
    }
  }

  return (
    <>
      <div className="w-full ">
        <div className="px-4 w-full lg:w-3/5 lg:mx-auto">
          <div className="w-full bg-violet-800 p-4 rounded-xl my-4 text-white">
            <div className="w-full flex justify-between">
              <div className="text-orange-500 text-lg font-bold">
                {txn?.txnId}
              </div>
              <div
                className={`
            text-lg font-bold
            ${
              txn?.txnStatus == 'SUCCESS'
                ? 'text-green-500'
                : txn?.txnStatus == 'PENDING'
                ? 'text-orange-500'
                : 'text-red-500'
            }`}
              >
                {txn?.txnStatus}
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <div>จำนวนสินค้า:{txn?.item}</div>
              <div>ราคารวม:{txn?.txnAmount}</div>
            </div>
            <div className="mt-2">วันที่:{txn?.createdAt}</div>
          </div>

          {txn &&
            txn.products.map((item, index) => {
              return (
                <div
                  key={index}
                  className="bg-gray-300 rounded-lg my-4 px-5 py-2 w-full"
                >
                  <div className="w-full flex justify-between">
                    <div className="text-gray-800 text-md font-bold">
                      เลขตั๋ว:{item.ticketId}
                    </div>
                    <div>
                      {item.isRedeemed ? (
                        <div className="bg-gray-500 w-[100px] text-center text-gray-300 rounded-lg">
                          ถูกใช้แล้ว
                        </div>
                      ) : (
                        <button
                          className=" bg-green-600 w-[100px] text-center text-gray-100 rounded-lg"
                          onClick={() => selectTicket(item)}
                        >
                          เปิดใช้งาน
                        </button>
                      )}
                    </div>
                  </div>
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-[150px] h-[150px] mt-2"
                  />
                  <div className="flex justify-between">
                    <div>ชื่อ: {item.productName}</div>
                    <div>ราคา: {item.price} บาท</div>
                  </div>

                  <div className="w-full">
                    <div>รายละเอียด:</div>
                    <div className="break-all">{item.productDescription}</div>
                  </div>
                  <div className="mt-2">สถานที่จัดงาน: {item.place}</div>
                  <div>วันที่จัดงาน: {item.eventDate}</div>
                </div>
              )
            })}
        </div>
      </div>
      {ticket && isModalOpen && (
        <RedeemTicketModal
          data={ticket}
          handleSubmitRedeem={handleRedeem}
          handleCloseModal={handleCloseModal}
        />
      )}
    </>
  )
}

export default TxnDetail
