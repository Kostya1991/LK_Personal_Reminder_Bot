import {bot} from "./bot";
import {getUpcomingEvents} from "./dataBaseHelper";

export async function sendUserEvents(): Promise<void> {
    const events = await getUpcomingEvents();
    const keys = Object.keys(events);

    if (!keys.length) {
        return;
    }

    keys.forEach((key: string) => {
        const arrEvents = events[key];

        arrEvents.forEach(async (event: string) => {
            await bot.api.sendMessage(key, event);
        });
    });
}
