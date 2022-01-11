import db from "../database/db";
import Joi from "joi";

export default class {

    /*
    static async add (user_id, account_id) {
        try {
            let data = {
                user_id: user_id,
                account_id: account_id
            };
            let result = await db.insert(db.pools.system, `friends`, data, `id`);
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 300000100, msg: 'Конфиг друзей не создан'}, ...err});
        }
    }*/




    static async edit (user_id, account_id, allowed, age_use, age_from, age_to, sex, message, message_subscriber) {
        try {
            await db.query(db.pools.system, 'BEGIN');

            let data = {
                friends_allowed: allowed
            }

            let result = await db.update(db.pools.system, `bill`, data, {account_id: account_id}, 'id');
            if (!result) {
                await db.query(db.pools.system, 'ROLLBACK');
                throw ({err: 200000201, msg: 'Включение модулей'});
            }

            data = {
                friends_age_use: age_use,
                friends_age_from: age_from,
                friends_age_to: age_to,
                friends_sex: sex,
                friends_message: message,
                friends_message_subscriber: message_subscriber
            };

            let arWhere = {
                user_id: user_id,
                id: account_id
            };

            console.log(data)
            console.log(arWhere)

            result = await db.update(db.pools.system, `accounts`,  data, arWhere, 'id');
            if (!result) {
                await db.query(db.pools.system, 'ROLLBACK');
                throw ({err: 200000201, msg: 'Настройка'});
            }

            await db.query(db.pools.system, 'COMMIT');

            return true;
        } catch (err) {
            throw ({...{err: 300000200, msg: 'Редактирование настроек сортировки друзей'}, ...err});
        }
    }

    static async editBirthday (user_id, account_id, allowed, sentence) {
        try {
            await db.query(db.pools.system, 'BEGIN');

            let data = {
                birthday_allowed: allowed
            }

            let result = await db.update(db.pools.system, `bill`, data, {account_id: account_id}, 'id');
            if (!result) {
                await db.query(db.pools.system, 'ROLLBACK');
                throw ({err: 200000201, msg: 'Включение модулей'});
            }

            data = {
                birthday_sentence: sentence,
            };

            let arWhere = {
                user_id: user_id,
                id: account_id
            };

            console.log(data)
            console.log(arWhere)

            result = await db.update(db.pools.system, `accounts`,  data, arWhere, 'id');
            if (!result) {
                await db.query(db.pools.system, 'ROLLBACK');
                throw ({err: 200000201, msg: 'Настройка'});
            }

            await db.query(db.pools.system, 'COMMIT');

            return true;
        } catch (err) {
            throw ({...{err: 300000200, msg: 'Редактирование настроек сортировки друзей'}, ...err});
        }
    }
}