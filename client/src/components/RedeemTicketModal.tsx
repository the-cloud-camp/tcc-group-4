import { XMarkIcon } from '@heroicons/react/24/outline'
import React from 'react'

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

interface RedeemTicketModalProps {
  data: TicketList
  handleSubmitRedeem: () => void
  handleCloseModal: () => void
}

const RedeemTicketModal: React.FC<RedeemTicketModalProps> = ({
  data,
  handleSubmitRedeem,
  handleCloseModal,
}) => {
  return (
    <section
      id="modal-container"
      className="fixed top-0 left-0 right-0 flex h-full items-center justify-center bg-black bg-opacity-20 z-0"
    >
      <form
        className="rounded-lg bg-white p-4 relative w-[400px] z-50 "
        onSubmit={handleSubmitRedeem}
      >
        <div className="w-full">
          <div>
            <XMarkIcon
              type="button"
              className="w-5 h-5 text-gray-400 absolute right-3 cursor-pointer"
              onClick={handleCloseModal}
            />
          </div>
          <div className="flex justify-center">
            <div>
              <img
                src={data.productImage}
                alt={data.productName}
                className="w-[150px] h-[150px]"
              />
              <h2 className="text-2xl font-bold break-all">
                {data.productName}
              </h2>
              <p className="text-lg font-bold text-green-600">${data.price}</p>
              <p className="text-gray-700">{data.place}</p>
              <p className="text-gray-700">{data.eventDate}</p>
              <button
                type="submit"
                className="btn mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:border-green-700 focus:ring focus:ring-green-200"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default RedeemTicketModal
