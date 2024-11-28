import {HonoApp} from "../../type";
import createApp from "./handler/createApp";

export default function builderRoute(app: HonoApp) {
    createApp(app)
}