import { server } from "../../..";
import {HonoApp, upgradeWebSocket} from "../../../type";
import {ServerWebSocket} from "bun";

// Initialize log queue

export default (app: HonoApp) => {
    app.get(
        '/:userId',
        upgradeWebSocket((c) => {
            const userId = c.req.param('userId');
            return {
                onOpen(event, ws) {
                    const rawWs = ws.raw as ServerWebSocket;
                    rawWs.subscribe(userId);
                    console.log(`User ${userId} connected.`);
                },
                onMessage(event, ws) {
                    console.log(`Message from : ${event.data}`);
                    ws.send("Message from")
                },
                onClose(_, ws) {
                    const rawWs = ws.raw as ServerWebSocket;
                    rawWs.unsubscribe(userId);
                },
            };
        })
    );
}
