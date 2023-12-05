import { useCallback, useEffect } from "react";
import ConcertCard from "../components/ConcertCard";
import ReactLoading from "react-loading";
import {
  concertActions,
  selectConcertState,
} from "../features/concert/concertSlice";
import { useAppSelector } from "../redux/hooks";
import { store } from "../redux/store";
import ConcertModal from "../components/ConcertModal";
import Modal from "../components/Modal";

const Index = () => {
  const concertState = useAppSelector(selectConcertState);
  const {
    visibleItems,
    totalItems,
    loading,
    loadmore,
    selectedConcert,
    concertLists,
    alertModal,
  } = concertState;

  const getConcertList = async () => {
    const response = await fetch(import.meta.env.VITE_API_URL + "/product/all");
    if (response.ok) {
      const data = await response.json();
      store.dispatch(concertActions.setConcertList(data));
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (visibleItems < totalItems) {
        store.dispatch(concertActions.setLoadmore(true));
        setTimeout(() => {
          const newVisibleItems = Math.min(visibleItems + 9, totalItems);
          store.dispatch(concertActions.setVisibleItems(newVisibleItems));
          store.dispatch(concertActions.setLoadmore(false));
        }, 1000);
      }
    }
  };

  const memorizedHandleScroll = useCallback(handleScroll, [
    totalItems,
    visibleItems,
  ]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).id === "staticModal") {
        store.dispatch(
          concertActions.setAlertModal({
            hidden: true,
            text: "",
          })
        );
      }
    };
    if (!alertModal.hidden) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [alertModal.hidden]);

  useEffect(() => {
    getConcertList();
    return () => {};
  }, []);
  useEffect(() => {
    store.dispatch(concertActions.setTotalItems(concertLists.length));
    return () => {};
  }, [concertLists]);

  useEffect(() => {
    window.addEventListener("scroll", memorizedHandleScroll);
    return () => {
      window.removeEventListener("scroll", memorizedHandleScroll);
    };
  }, [visibleItems, totalItems, memorizedHandleScroll]);

  return (
    <>
      {loading && (
        <section className="fixed top-0 left-0 right-0 z-50 flex h-full items-center justify-center bg-black bg-opacity-80">
          <div className="text-white text-2xl text-center flex flex-col">
            <div className="w-full justify-center">
              <ReactLoading
                type={"bubbles"}
                color="#5B21B6"
                height={20}
                width={100}
                className="mx-auto relative -top-20"
              />
            </div>
            <p className="my-2">Thanks for waiting!</p>
            <p>You're in a queue, and we'll be with you shortly.</p>
          </div>
        </section>
      )}
      {!alertModal.hidden && (
        <Modal className="flex flex-col p-8 gap-5 w-fit">
          <p className="text-center">{alertModal.text}</p>
        </Modal>
      )}
      <nav className="bg-violet-800 h-20 shadow-lg flex items-center sticky top-0">
        <section className="container">
          <p className="text-3xl text-white font-bold tracking-widest">
            ShobTeePraJum
          </p>
        </section>
      </nav>

      <main className="container">
        {!selectedConcert.hidden && <ConcertModal />}
        <section className="grid grid-cols-3 gap-5 py-5">
          {concertLists.slice(0, visibleItems).map((data, index) => (
            <ConcertCard data={data} key={index} />
          ))}
        </section>
        {loadmore && (
          <div className="flex items-center justify-center w-full">
            <ReactLoading
              type={"bubbles"}
              color="#5B21B6"
              height={20}
              width={100}
            />
          </div>
        )}
      </main>
    </>
  );
};

export default Index;
