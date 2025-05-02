import {bot} from "./bot";
import {updateDB} from "./dataBaseHelper";

export function initMessage() {
    // Обработка сообщения от пользователя
    bot.on("message", async (ctx) => {
        const userMessage = ctx.message;

        const {message, status} = await updateDB(userMessage.text, ctx.chat.id.toString());

        if (!status) {
            ctx.reply(`Ошибка &#128163;: ${message}`, {parse_mode: "HTML"});
            return;
        }

        ctx.reply(`${message} &#128165;`, {parse_mode: "HTML"});
    });
}
