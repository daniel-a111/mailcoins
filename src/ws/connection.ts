import { WebSocketServer } from "ws";


let wss: any;
const handlers: { [key: string]: Function[] } = {};

let nextSessionId = 1;

const sessions: any = {};
const sessionsToId: any = {};

export const start = () => {

    wss = new WebSocketServer({ port: 8080 });

    wss.on('connection', function connection(ws) {

        sessions[nextSessionId] = ws;
        sessionsToId[ws] = nextSessionId;
        ws.send(nextSessionId++);

        ws.on('error', console.error);

        ws.on('message', function message(data: any) {
            console.log('MESSAGE IN');
            console.log({ data: data.toString() });
            try {
                data = JSON.parse(data.toString());
                let { endpoint } = data;
                let found = false;
                for (let handler of handlers[endpoint] || []) {
                    console.log({ handler });
                    handler(data, ws);
                    found = true;
                }
                if (!found) {
                    console.log(JSON.stringify(data));
                }

            } catch {
                console.log('received: %s', data);
            }
        });

        // ws.on('close', () => {
        //     console.log('CLOSED!');
        // });
        // ws.on('close', function close() {
        //     console.log('disconnected');
        // });
    });
}

export const registerHandler = (endpoint: string, handler: Function) => {

    if (!handlers[endpoint]) {
        handlers[endpoint] = [];
    }
    handlers[endpoint].push(handler);
}

export const registerCloseHandler = (endpoint: string, handler: Function) => {

    if (!handlers[endpoint]) {
        handlers[endpoint] = [];
    }
    handlers[endpoint].push(handler);
}