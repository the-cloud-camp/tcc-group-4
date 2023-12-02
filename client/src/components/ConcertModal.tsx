import { useEffect } from "react";
import {
  concertActions,
  selectConcertState,
} from "../features/concert/concertSlice";
import { useAppSelector } from "../redux/hooks";
import { store } from "../redux/store";
import {
  CalendarDaysIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/20/solid";

const ConcertModal = () => {
  const concertState = useAppSelector(selectConcertState);
  const { selectedConcert } = concertState;

  const handleConfirm = () => {
    alert(`Send Dato to Server
    ${JSON.stringify(selectedConcert)}`);
    store.dispatch(
      concertActions.setSelectedConcert({
        ...selectedConcert,
        item: undefined,
        hidden: true,
      })
    );
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).id === "modal-container") {
        store.dispatch(
          concertActions.setSelectedConcert({
            ...selectedConcert,
            item: undefined,
            hidden: true,
          })
        );
      }
    };

    if (!selectedConcert.hidden) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [selectedConcert]);

  return (
    selectedConcert.item && (
      <section
        id="modal-container"
        className="fixed top-0 left-0 right-0 z-50 flex h-full items-center justify-center bg-black bg-opacity-20"
      >
        <form
          className="w-fit rounded-lg bg-white p-4 relative"
          onSubmit={handleConfirm}
        >
          <XMarkIcon
            className="w-5 h-5 text-gray-400 absolute right-3"
            onClick={() =>
              store.dispatch(
                concertActions.setSelectedConcert({
                  ...selectedConcert,
                  item: undefined,
                  hidden: true,
                })
              )
            }
          />
          <div className="flex gap-4">
            <div className="overflow-hidden rounded w-40">
              <img
                src="https://placehold.co/600x400/EEE/31343C"
                alt={`${selectedConcert.item.name}-image`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className=" text-lg font-medium text-violet-800">
                {selectedConcert.item.name}
              </h2>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <p className="text-sm truncate">{selectedConcert.item.place}</p>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5" />
                <p className="text-sm truncate">
                  {new Date(selectedConcert.item.date).toLocaleString(
                    "default",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircleIcon
                  className={`w-5 h-5  ${
                    selectedConcert.amount <= 1
                      ? "text-gray-300"
                      : "text-violet-800 cursor-pointer"
                  }`}
                  onClick={() =>
                    selectedConcert.amount > 1 &&
                    store.dispatch(
                      concertActions.setAmountTicketConcert({
                        type: "minus",
                        value: 1,
                      })
                    )
                  }
                />
                <input
                  className="border-2 border-gray-500 rounded-lg px-4 text-center w-20"
                  value={selectedConcert.amount}
                />
                <PlusCircleIcon
                  className="w-5 h-5 text-violet-800 cursor-pointer"
                  onClick={() =>
                    store.dispatch(
                      concertActions.setAmountTicketConcert({
                        type: "plus",
                        value: 1,
                      })
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end items-end ">
              <p className="bg-violet-800 py-1 px-4 rounded-full text-white font-medium select-none">
                Total: {5 * selectedConcert.amount}
              </p>
            </div>
          </div>
          <hr className="w-full my-4" />
          <h1 className="text-center py-4">Payment</h1>
          <hr className="w-full my-4" />
          <h1>Email Address</h1>

          <input
            type="email"
            className=" border-[1px] w-full rounded px-4 py-2 my-2"
            required
            onChange={(e) =>
              store.dispatch(
                concertActions.setSelectedConcert({
                  ...selectedConcert,
                  email: e.target.value,
                })
              )
            }
          />
          <button className=" bg-violet-800 w-full text-white p-3 rounded">
            Confirm
          </button>
        </form>
      </section>
    )
  );
};

export default ConcertModal;
