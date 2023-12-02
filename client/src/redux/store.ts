import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { concertReducer } from "../features/concert/concertSlice";

export const store = configureStore({
  reducer: {
    concert: concertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
