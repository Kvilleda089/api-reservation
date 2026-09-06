import { GetAllReservationHandler } from "./get-all-reservation.handler";
import { GetReservationByClientIdHandler } from "./get-reservation-by-clientId.handler";
import { GetReservationCheckoutAvailableHandler } from "./get-reservation-checkout-available.handler";



export const ReservationQueryHandlers = [
    GetReservationCheckoutAvailableHandler,
    GetAllReservationHandler,
    GetReservationByClientIdHandler,
]