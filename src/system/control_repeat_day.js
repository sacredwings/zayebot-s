//класс для работы с аккаунтами ВК
import db from "../database/db";
import modelsAccount from "../models/account";

export default class control_repeat_day {

    static async getBirthday (account_id, date) {
        try {
            let query = `SELECT * FROM control_repeat_day WHERE account_id=$1 AND day=$2 AND type=1`;
            return await db.query(db.pools.system, query, [account_id, date]);
        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }

    static async addBirthday (account_id, date) {
        try {
            let data = {
                account_id: account_id,
                day: date,
                type: 1
            };

            let result = await db.insert(db.pools.system, `control_repeat_day`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

}
