import db from "../database/db";
import modelsModule from './module';

export default class {

    //Добавление аккаунта
    static async add (user_id, browser, login, password, soc_user_id, soc_token, first_name, last_name, img, img_ava) {
        try {
            let data = {
                user_id: user_id,
                browser: browser,
                login: login,
                password: password,
                soc_user_id: soc_user_id,
                soc_token: soc_token,
                first_name: first_name,
                last_name: last_name,
                img: img,
                img_ava: img_ava
            };
            let result = await db.insert(db.pools.system, `accounts`, data, 'id');

            if (result) {
                await db.insert(db.pools.system, `bill`, {user_id: user_id, account_id: result[0].id});

                return result[0];
            }

            return false;
        } catch (err) {
            throw ({...{err: 200000100, msg: 'Добавление аккаунта'}, ...err});
        }
    }

    //Получение аккаунтов
    static async get (user_id, value) {
        try {
            let query = `SELECT accounts.*,` + modelsModule.getModuleFields().join(',') + ` FROM accounts LEFT JOIN bill ON bill.account_id=accounts.id WHERE accounts.user_id=$1 LIMIT $2 OFFSET $3`;
            return await db.query(db.pools.system, query, [user_id, value.count, value.offset]);

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    //Получение аккаунтов
    static async getLikes (limit) {
        try {
            let query = `SELECT * FROM accounts LEFT JOIN bill ON bill.account_id=accounts.id LIMIT $1`;
            return await db.query(db.pools.system, query, [limit]);

        } catch (err) {
            throw ({...{err: 200000300, msg: 'Загрузка всех аккаунтов'}, ...err});
        }
    }

    //Получение аккаунтов / поздравление в тегущее время
    static async getBirthday (hour, day, limit) {
        try {
            let query = `SELECT * FROM accounts LEFT JOIN bill ON bill.account_id=accounts.id 
WHERE bill.birthday_allowed=true AND accounts.birthday_hour=$1 AND accounts.birthday_sentence IS NOT NULL AND accounts.id NOT IN (SELECT account_id FROM control_repeat_day WHERE type=1 AND account_id=accounts.id AND day=$2) LIMIT $3`;
            return await db.query(db.pools.system, query, [hour, day, limit]);

        } catch (err) {
            throw ({...{err: 200000400, msg: 'Загрузка всех аккаунтов'}, ...err});
        }
    }

    //Получение аккаунтов
    static async getFriends (limit) {
        try {
            let query = `SELECT * FROM accounts LEFT JOIN bill ON bill.account_id=accounts.id WHERE bill.friends_allowed=true LIMIT $1`;
            return await db.query(db.pools.system, query, [limit]);

        } catch (err) {
            throw ({...{err: 200000500, msg: 'Загрузка всех аккаунтов'}, ...err});
        }
    }

    /*
    //Получение аккаунтов
    static async getLikesConfig (account_id) {
        try {
            let query = `SELECT * FROM likes WHERE id=$1`;
            return await db.query(db.pools.system, query, [account_id]);

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }
    */

    //Получение аккаунтов
    static async setLikesCount (account_id, count) {
        try {
            let query = `UPDATE accounts SET likes_counts_day = likes_counts_day + $1, likes_counts_total = likes_counts_total + $2 WHERE id = $3`;
            return await db.query(db.pools.system, query, [count, count, account_id]);

        } catch (err) {
            throw ({...{err: 200000600, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }

    //Получение аккаунтов
    static async setErr (account_id, code) {
        try {
            let data = {
                soc_error_code: code,
            };

            let arWhere = {
                id: account_id
            };

            let result = await db.update(db.pools.system, `accounts`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 200000700, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }

    //Получение аккаунтов
    static async delete (user_id, account_id) {
        try {
            let query = `DELETE FROM accounts WHERE id = $1 AND user_id = $2`;
            return await db.query(db.pools.system, query, [account_id, user_id]);

        } catch (err) {
            throw ({...{err: 200000800, msg: 'Удаление аккаунта'}, ...err});
        }
    }
    /*
    //Поиск аккаунта
    static async getByLogin (user_id, login) {
        try {
            let query = `SELECT * FROM accounts WHERE user_id=$1 and login=$2`;
            let result = await db.query(db.pools.system, query, [user_id, login]);
            if (result.length)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 200000300, msg: 'Добавление аккаунта'}, ...err});
        }
    }*/

    static async resetData () {
        try {
            let data = {
                likes_counts_day: 0,
                friends_counts_day: 0
            };

            let arWhere = null;

            let result = await db.update(db.pools.system, `accounts`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 200000900, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }
}