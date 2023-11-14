import { useState, useEffect } from "react";
import concertData from "../data/mock-concert-data.json";
import ConcertCard from "../components/ConcertCard";
import ReactLoading from "react-loading";

const Index = () => {
  const [visibleItems, setVisibleItems] = useState(9);
  const [totalItems, setTotalItems] = useState(concertData.length);
  const [loading, setLoading] = useState(false);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (visibleItems < totalItems) {
        setLoading(true);
        setTimeout(() => {
          const newVisibleItems = Math.min(visibleItems + 9, totalItems);
          setVisibleItems(newVisibleItems);
          setLoading(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [visibleItems, totalItems]);

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
