import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";

export interface ConcertDataType {
  productId: number;
  productName: string;
  place: string;
  eventDate: string;
  price: number;
  productImage: string
}

interface ConcertState {
  concertLists: ConcertDataType[];
  selectedConcert: {
    item: ConcertDataType | undefined;
    amount: number;
    hidden: boolean;
    paid: boolean;
    email: string;
  };
  visibleItems: number;
  totalItems: number;
  loading: boolean;
  loadmore: boolean;
  alertModal: {
    hidden: boolean;
    text: string;
  };
}

const initialState: ConcertState = {
  concertLists: [],
  selectedConcert: {
    item: undefined,
    amount: 1,
    hidden: false,
    paid: false,
    email: "",
  },
  visibleItems: 9,
  totalItems: 0,
  loading: false,
  loadmore: false,
  alertModal: {
    hidden: true,
    text: "",
  },
};

export const concertSlice = createSlice({
  name: "COUNTER_SLICE",
  initialState,
  reducers: {
    setSelectedConcert: (state, action) => {
      state.selectedConcert = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadmore: (state, action) => {
      state.loadmore = action.payload;
    },
    setVisibleItems: (state, action) => {
      state.visibleItems = action.payload;
    },
    setTotalItems: (state, action) => {
      state.totalItems = action.payload;
    },
    setAmountTicketConcert: (state, action) => {
      let amountTicket = state.selectedConcert.amount;

      switch (action.payload.type) {
        case "plus":
          amountTicket += action.payload.value;
          break;
        case "minus":
          amountTicket -= action.payload.value;
          break;
        default:
          amountTicket = 0;
          break;
      }
      state.selectedConcert.amount = amountTicket;
    },
    setConcertList: (state, action) => {
      state.concertLists = action.payload;
    },
    setAlertModal: (state, action) => {
      state.alertModal = action.payload;
    },
  },
});

export const concertActions = concertSlice.actions;

export const concertReducer = concertSlice.reducer;

export const selectConcertState = (state: RootState) => state.concert;
