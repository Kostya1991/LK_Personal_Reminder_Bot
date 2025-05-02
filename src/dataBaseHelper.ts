import fs from "fs";
import path from "path";

const DATA_REG_EXP = new RegExp("^([0-9]{2})\\.([0-9]{2})\\.([1-2][0-9]{3})$");

/** Получаем данные из json файла */
const data = fs.readFileSync(path.resolve(__dirname, "..", "assets", "db.json"), {encoding: "utf8"});
const dataObj: Record<string, Array<{date: string; description: string}>> = JSON.parse(data);

/** Обновление данных в JSON файле */
export async function updateDB(
    message: string | undefined,
    userId: string,
): Promise<{message: string; status: boolean}> {
    /** проверка на наличие сообщения */
    if (!message) {
        return {message: "Пустое сообщение!", status: false};
    }

    /** Получаем дату и описание из сообщения пользователя */
    const date = message?.split("|")[0]?.trim() ?? "";
    const description = message?.split("|")[1]?.trim() ?? "";

    /** проверка на наличие в сообщении даты и описания */
    if (!date || !description) {
        return {message: "Не заполнена дата или описание!", status: false};
    }

    /** проверка на корректность заполнения даты */
    if (!DATA_REG_EXP.test(date)) {
        return {message: "Не верный формат даты. Укажите дату в формате: ДД.ММ.ГГГГ", status: false};
    }

    /** Формируем корректную дату */
    const data = new Date(date.split(".").reverse().join("-"));

    /** Формируем данные для записи в json файл */
    const payload = {date: data.toString(), description};

    /** Полуачаем из json по ключу пользователя все события */
    const jsonData = dataObj[userId] ?? [];
    /** Сохраняем новое событие */
    jsonData.push(payload);

    /** Обновляем файл с данными */
    fs.writeFileSync(
        path.resolve(__dirname, "..", "assets", "db.json"),
        JSON.stringify({
            ...dataObj,
            [userId]: jsonData,
        }),
    );

    return Promise.resolve({message: "Данные успешно сохранены", status: true});
}

/** Получить ближайшие события */
export function getUpcomingEvents(): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    Object.keys(dataObj).forEach((key: string) => {
        const data = dataObj[key];

        data.forEach(({date, description}) => {
            if (checkDate(date)) {
                const month = new Date(date).getMonth() + 1;
                const currentMonth = month > 9 ? month : `0${month}`;

                const str = `${new Date(date).getDate()}.${currentMonth}: ${description}`;
                Array.isArray(result[key]) ? result[key].push(str) : (result[key] = [str]);
            }
        });
    });

    return result;
}

function checkDate(dateString: string): boolean {
    /** Получаем день и месяц из даты из базы */
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    /** Получаем день и месяц из текущей даты */
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;

    /** Если месяц из записи и текущий не равны - значит до события еще долго */
    if (month !== currentMonth) {
        return false;
    }

    /** Если текущий день дальше от целевого на день и больше - оповещать не надо */
    if (currentDay - day > 1) {
        return false;
    }

    return true;
}
