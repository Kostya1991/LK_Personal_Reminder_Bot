require("dotenv").config();
import {bot} from "./bot";
import {initCommand} from "./command";
import {initErrorHandler} from "./error";
import {initMessage} from "./message";
import {sendUserEvents} from "./sendUserEvents";

const ONE_DAY_TIME = 24 * 60 * 60 * 1000;

/** Инициализация обработки команд */
initCommand();
/** Инициализация обработки сообщения от пользователя */
initMessage();
/** Инициализация обработки ошибок */
initErrorHandler();

/** Интервал, который раз в сутки проверяет календарь и отправляет сообщение пользователю, если есть событие */
setInterval(() => sendUserEvents(), ONE_DAY_TIME);

// Запуск бота
bot.start();
