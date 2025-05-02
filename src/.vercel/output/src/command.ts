import {InputFile} from "grammy";
import {bot} from "./bot";

export function initCommand() {
    // Обработка команды /start.
    bot.command("start", async (ctx) => {
        await ctx.reply(
            `
      Привет <b>${ctx?.from?.first_name} ${ctx?.from?.last_name}.</b> &#128075; \n Я виртуальный помошник, который будет напоминать тебе о важных событиях за день до их наступления &#128276; \n Все, что тебе нужно - это написать мне сообщение формата: <b>"ДД.ММ.ГГГГ | Сообщение"</b>. \n Но будь внимателен, соблюдение формата - очень важное условие, что бы я мог правильно сохранить данные и своевременно напоминать тебе о наступлении события. \n Если ты ошибешься - я сообщу тебе об этом, или же напишу что событие успешно сохранено! \n Поехали &#128663;
    `,
            {
                parse_mode: "HTML",
            },
        );
    });

    // Обработка команды /aboutme.
    bot.command("aboutme", async (ctx) => {
        await ctx.replyWithPhoto(new InputFile("../assets/avatar.jpg"));
        await ctx.reply(
            `
    Привет <b>${ctx?.from?.first_name} ${ctx?.from?.last_name}.</b> &#128075; \n Меня зовут Константин, я разработчик данного бота. Если у тебя есть вопросы - ты можешь написать мне в <a href="https://t.me/KonstantinLysov">телеграмм</a>
    `,
            {parse_mode: "HTML", link_preview_options: {is_disabled: true}},
        );
    });
}
