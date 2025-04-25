import fs from "fs";
import { Bot, GrammyError, HttpError, InputFile, webhookCallback } from "grammy";

require("dotenv").config();

const ONE_DAY_TIME = 24 * 60 * 60 * 1000;

const data = fs.readFileSync('./assets/db.json', { encoding: "utf8" });
const dataObj = JSON.parse(data);

// Создание экземпляра бота
const bot = new Bot(process.env.BOT_TOKEN!);

/** Добавление меню с командами */
bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота"
  },
  {
    command: "aboutme",
    description: "Обо мне"
  }
]);

// Обработка команды /start.
bot.command("start", async (ctx) => {
  await ctx.reply(`
      Привет <b>${ctx?.from?.first_name} ${ctx?.from?.last_name}.</b> &#128075; \n Я виртуальный помошник, который будет напоминать тебе о важных событиях за день до их наступления &#128276; \n Все, что тебе нужно - это написать мне сообщение формата: <b>"ДД.ММ.ГГГГ - Сообщение"</b>. \n Но будь внимателен, соблюдение формата - очень важное условие, что бы я мог правильно сохранить данные и своевременно напоминать тебе о наступлении события. \n Если ты ошибешься - я сообщу тебе об этом, или же напишу что событие успешно сохранено! \n Поехали &#128663;
    `, {
    parse_mode: "HTML"
  });
});

// Обработка команды /aboutme.
bot.command("aboutme", async (ctx) => {
  await ctx.replyWithPhoto(new InputFile("./assets/avatar.jpg"));
  await ctx.reply(`
    Привет <b>${ctx?.from?.first_name} ${ctx?.from?.last_name}.</b> &#128075; \n Меня зовут Константин, я разработчик данного бота. Если у тебя есть вопросы - ты можешь написать мне в <a href="https://t.me/KonstantinLysov">телеграмм</a>
    `,{ parse_mode: "HTML", link_preview_options: {is_disabled: true}})
});

// Обработка сообщения от пользователя
bot.on("message", (ctx) => {
    const message = ctx.message;

    /** Получаем дату и описание из сообщения пользователя */
    const date = message.text?.split("-")[0]?.trim() ?? "";
    const description = message.text?.split("-")[1]?.trim() ?? "";

    /** Формируем корректную дату */
    const data = new Date(date.split(".").reverse().join("-"));

    /** Формируем данные для записи в json файл */
    const payload = { date: data, description };

    /** Полуачаем из json по ключу пользователя все события */
    const jsonData = dataObj[ctx.from.id] ?? [];
    /** Сохраняем новое событие */
    jsonData.push(payload);

    /** Обновляем файл с данными */
    /** todo: нужно делать асинхронно и отправлять сообщения на успех и если есть ошибка */
    fs.writeFileSync('./assets/db.json', JSON.stringify(
      {
        ...dataObj,
        [ctx.from.id]: jsonData
      }
    ));

    ctx.reply(`Привет ${ctx.from.first_name} ${ctx.from.last_name}`) // тут доработать сообщение об успехе с смайликом
});

/** Обработка ошибок */
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Ошибка в запросе:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Не удалось связаться с Telegram:", e);
  } else {
    console.error("Неизвестная ошибка:", e);
  }
});

/** Интервал, который раз в сутки проверяет календарь и отправляет сообщение пользователю, если есть событие */
// setInterval(async () => {
//   await bot.api.sendMessage(process.env.CHAT_ID!, "Привет!");
// }, ONE_DAY_TIME)

// Запуск бота
bot.start();