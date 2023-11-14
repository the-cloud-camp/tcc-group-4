import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

interface ConcertDataType {
  name: string;
  place: string;
  date: string;
}

interface ConcertCardProps {
  data: ConcertDataType;
}
const ConcertCard = ({ data }: ConcertCardProps) => {
  return (
    <section className="p-4 bg-white rounded shadow flex flex-col gap-4">
      <div className="overflow-hidden rounded">
        <img
          src="https://placehold.co/600x400/EEE/31343C"
          alt={`${data.name}-image`}
        />
      </div>
      <div>
        <h2 className=" text-lg font-medium text-violet-800">{data.name}</h2>
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5" />
          <p className="text-sm truncate">{data.place}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5" />
          <p className="text-sm truncate">
            {new Date(data.date).toLocaleString("default", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <button className=" bg-violet-800 w-full text-white p-3 rounded">
        Buy Ticket
      </button>
    </section>
  );
};

export default ConcertCard;
