import fs from "fs";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {UserEvent} from "./models/UserEvent";

const DATA_REG_EXP = new RegExp("^([0-9]{2})\\.([0-9]{2})\\.([1-2][0-9]{3})$");

const PATH = process.env.LOCAL_ENV === "true" ? path.resolve(__dirname, "..", "assets", "db.json") : "/data/db.json";

/** Получаем данные из json файла */
const DATA = fs.readFileSync(PATH, {encoding: "utf8"});
const DATA_OBJ: Record<string, UserEvent[]> = JSON.parse(DATA);

/** Получение списка событий */
export function getList(userId: string): Array<string> {
    const userList = DATA_OBJ[userId] ?? [];

    if (!userList.length) {
        return ["В календаре нет событий"];
    }

    return userList.map((item) => `${item.date} - ${item.description}`);
}

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
    const once = message?.split("|")[2]?.trim() ?? "";

    /** проверка на наличие в сообщении даты и описания */
    if (!date || !description) {
        return {message: "Не заполнена дата или описание!", status: false};
    }

    /** проверка на корректность заполнения даты */
    if (!DATA_REG_EXP.test(date)) {
        return {message: "Не верный формат даты. Укажите дату в формате: ДД.ММ.ГГГГ", status: false};
    }

    /** Формируем данные для записи в json файл */
    const payload: UserEvent = {
        id: uuidv4(),
        date,
        description,
        once: once ? Number(once) === 1 : false,
    };

    /** Полуачаем из json по ключу пользователя все события */
    const jsonData = DATA_OBJ[userId] ?? [];
    /** Сохраняем новое событие */
    jsonData.push(payload);

    /** Обновляем файл с данными */
    fs.writeFileSync(
        PATH,
        JSON.stringify({
            ...DATA_OBJ,
            [userId]: jsonData,
        }),
    );

    return Promise.resolve({message: "Данные успешно сохранены", status: true});
}

/** Удалить событие из базы */
export async function deleteEventFromDB(userId: string, id: string): Promise<boolean> {
    /** если какой-то айдишник не передан - удалять запись не требуется */
    if (!id || !userId) {
        return false;
    }

    /** Полуачаем из json по ключу пользователя все события */
    const jsonData = DATA_OBJ[userId] ?? [];

    const updateData = jsonData.filter((item) => item.id !== id);

    /** Обновляем файл с данными */
    fs.writeFileSync(
        PATH,
        JSON.stringify({
            ...DATA_OBJ,
            [userId]: updateData,
        }),
    );

    return true;
}

/** Получить ближайшие события */
export async function getUpcomingEvents(): Promise<Record<string, string[]>> {
    const result: Record<string, string[]> = {};

    Object.keys(DATA_OBJ).forEach((key: string) => {
        const data = DATA_OBJ[key];

        data.forEach(({date, description, once, id}) => {
            if (checkDate(date)) {
                const str = `${date}: ${description}`;
                Array.isArray(result[key]) ? result[key].push(str) : (result[key] = [str]);

                /** Если событие разовое - нужно удалить его из базы */
                if (once) {
                    deleteEventFromDB(key, id);
                }
            }
        });
    });

    return result;
}

function checkDate(dateString: string): boolean {
    /** Получаем день и месяц из даты из базы */
    const [day, month] = dateString.split(".");

    /** Получаем текущую дату + 1 день */
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const actualMonth = currentDate.getMonth() + 1;
    const actualDay = currentDate.getDate();

    /** Если дни и месяцы не равны - значит до события больше одного дня */
    if (Number(day) !== actualDay || Number(month) !== actualMonth) {
        return false;
    }

    return true;
}
