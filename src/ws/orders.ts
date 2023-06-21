import { findAvailableRooms } from "../traveltech/slots";
import * as connection from "./connection";


let nextSessionId = 1;

const sessions: any = {};
const sessionsToId: any = {};

const openNewOrderSession = (data: any, ws: any) => {
    console.log('NEW ORDER SESSION');
    // console.log({ data });
    // console.log({ nextSessionId });
    // console.log({ ws });
    sessionsToId[ws] = nextSessionId;
    sessions[nextSessionId] = ws;

    ws.on('message', (data: any) => {

        console.log(data.toString())
        data = JSON.parse(data.toString());
        if (data.method === 'LIST_AVAILABLE') {
            console.log('LIST AVAILABLE ROOMS!');
            console.log({ data });
            listAvailableRooms(data, ws);
        }
        // if (data.method === 'ROOM_ADD') {
        //     console.log('ADD ROOM!');
        //     console.log({ data });
        //     addRoom(data, ws);
        // }
        // else if (data.method === 'ROOM_REMOVE') {
        //     console.log('ADD ROOM!');
        //     console.log({ data });
        //     removeRoom(data, ws);
        // }
    });

    ws.on('close', connectionClose);
    ws.send((nextSessionId++).toString());
}

// const addRoom = async (data: any, ws: any) => {
//     console.log('AAAADDDD RRROOOM');
//     console.log({ data });
//     const roomIdx = data.roomIdx;
//     // const avail = await availableRooms(data.projectId, data.type, data.checkIn, data.checkOut, sessionsToId[ws]);
//     const alloc = await allocateRoom(data.projectId, data.type, data.checkIn, data.checkOut, sessionsToId[ws]);
//     console.log({ alloc });
//     ws.send(JSON.stringify({ method: 'ROOM_ASSIGN', roomIdx, alloc }));
// }

// const removeRoom = (data: any, ws: any) => {

// }

const listAvailableRooms = async (data: any, ws: any) => {
    console.log('AAAADDDD RRROOOM');
    console.log({ data });
    const roomIdx = data.roomIdx;
    // const avail = await availableRooms(data.projectId, data.type, data.checkIn, data.checkOut, sessionsToId[ws]);
    const rooms = await findAvailableRooms(data.projectId, data.type, data.checkIn, data.checkOut);
    console.log({ rooms });
    // console.log({ alloc });
    ws.send(JSON.stringify({ method: data.method, roomIdx, rooms }));
}


const connectionClose = () => {
    console.log('CLOSING!!!!' + nextSessionId);
}

export const initOrdersInterface = () => {
    connection.registerHandler("new_order_session", openNewOrderSession);
    // connection.registerHandler("new_order_session", openNewOrderSession);
}