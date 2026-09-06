import { GetAllClientHandler } from "./handler/get-all-client.handler";
import { GetOneClientHandler } from "./handler/get-one-client.handler";



export const ClientQuery = [
    GetAllClientHandler,
    GetOneClientHandler
]