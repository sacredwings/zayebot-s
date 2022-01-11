//класс для работы с аккаунтами ВК
import db from "../database/db";
import modelsAccount from "../models/account";

export default class reset_day_data {
    static async status () {
        let date = new Date();
        date = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;

        let arAccounts = await this.get(date);
        if (arAccounts.length)
            return false;

        await modelsAccount.resetData();

        await this.add(date);
    }

    static async get (date) {
        try {
            let query = `SELECT * FROM reset_day_data WHERE reset_day=$1`;
            return await db.query(db.pools.system, query, [date]);
        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }

    static async add (date) {
        try {
            let data = {
                reset_day: date,
            };

            let result = await db.insert(db.pools.system, `reset_day_data`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

}
