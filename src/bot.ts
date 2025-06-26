require("dotenv").config();

import {Bot} from "grammy";

if (!process.env.BOT_TOKEN) {
    throw Error("Не обнаружен токен бота");
}

// Создание экземпляра бота
const bot = new Bot(process.env.BOT_TOKEN);

/** Добавление меню с командами */
bot.api.setMyCommands([
    {
        command: "start",
        description: "Запуск бота",
    },
    {
        command: "aboutme",
        description: "Обо мне",
    },
    {
        command: "list",
        description: "Посмотреть календарь",
    },
]);

export {bot};
