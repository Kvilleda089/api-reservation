import { GetAllReservationDepositHandler } from "./get-all-reservation-deposit.handler";
import { GetOneReservationDepositHandler } from "./get-one-reservation-deposit-byId.handler";



export const ReservationDepositsHandlers = [
    GetAllReservationDepositHandler,
    GetOneReservationDepositHandler,
]