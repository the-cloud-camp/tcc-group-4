import { useCallback, useEffect } from "react";
import concertData from "../data/mock-concert-data.json";
import ConcertCard from "../components/ConcertCard";
import ReactLoading from "react-loading";
import {
  concertActions,
  selectConcertState,
} from "../features/concert/concertSlice";
import { useAppSelector } from "../redux/hooks";
import { store } from "../redux/store";
import ConcertModal from "../components/ConcertModal";

const Index = () => {
  const concertState = useAppSelector(selectConcertState);
  const { visibleItems, totalItems, loading, selectedConcert } = concertState;

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (visibleItems < totalItems) {
        store.dispatch(concertActions.setLoading(true));
        setTimeout(() => {
          const newVisibleItems = Math.min(visibleItems + 9, totalItems);
          store.dispatch(concertActions.setVisibleItems(newVisibleItems));
          store.dispatch(concertActions.setLoading(false));
        }, 1000);
      }
    }
  };

  const memorizedHandleScroll = useCallback(handleScroll, [
    totalItems,
    visibleItems,
  ]);

  useEffect(() => {
    store.dispatch(concertActions.setTotalItems(concertData.length));
    return () => {};
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", memorizedHandleScroll);
    return () => {
      window.removeEventListener("scroll", memorizedHandleScroll);
    };
  }, [visibleItems, totalItems, memorizedHandleScroll]);

  return (
    <>
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
          {concertData.slice(0, visibleItems).map((data, index) => (
            <ConcertCard data={data} key={index} />
          ))}
        </section>
        {loading && (
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
