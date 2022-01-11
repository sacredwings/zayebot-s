import db from "../database/db";

export default class {

    //Получение аккаунтов
    static async addUser (email, password, first_name, last_name=null, phone, ref, vk_user_id=null) {
        try {
            let data = {
                login: email,
                email: email,
                password: password,
                first_name: first_name,
                last_name: last_name,
                phone: phone,
                ref: ref,
                vk_id: vk_user_id
            };

            let result = await db.insert(db.pools.system, `users`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 30000100, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    //Получение аккаунтов
    static async getUser (user_id) {
        try {
            let query = `SELECT * FROM users WHERE id=$1 LIMIT 1`;
            return await db.query(db.pools.system, query, [user_id]);

        } catch (err) {
            throw ({...{err: 30000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    //Получение аккаунтов
    static async reg (email, password, first_name, code) {
        try {

            let data = {
                email: email,
                password: password,
                first_name: first_name,
                code: code
            };

            let result = await db.insert(db.pools.system, `users_no_active`, data, `id`);
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 30000300, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }

    //Получение аккаунтов
    static async getUserNoActiveByCode (code) { //getUserByCode
        try {
            let query = `SELECT * FROM users_no_active WHERE code=$1 LIMIT 1`;
            return await db.query(db.pools.system, query, [code]);

        } catch (err) {
            throw ({...{err: 30000400, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async setByCode (user_id, type, code) { //getUserByCode
        try {
            //let today = new Date();
            //today = today.toISOString().slice(0, 19).replace('T', ' ');

            let data = {
                user_id: user_id,
                type: type,
                code: code,
            };

            let result = await db.insert(db.pools.system, `code`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 30000500, msg: 'Создание кода'}, ...err});
        }
    }
    static async getByCode (type, code) { //getUserByCode
        try {
            /*
            let today = new Date(),
                newToday = new Date();
            newToday.setMinutes(today.getMinutes()+30);
            newToday = newToday.toISOString().slice(0, 19).replace('T', ' ');
            */

            let query = `SELECT * FROM code WHERE type=$1 AND code=$2 LIMIT 1`;
            return await db.query(db.pools.system, query, [type, code]);

        } catch (err) {
            throw ({...{err: 30000600, msg: 'Создание кода'}, ...err});
        }
    }
    static async getUserByEmail (email) {
        try {
            let query = `SELECT * FROM users WHERE email=$1 LIMIT 1`;
            return await db.query(db.pools.system, query, [email]);

        } catch (err) {
            throw ({...{err: 30000700, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }
    static async getUserByEmailOrPhone (email, phone) {
        try {
            let query = `SELECT * FROM users WHERE email=$1 OR phone=$2 LIMIT 1`;
            return await db.query(db.pools.system, query, [email, phone]);

        } catch (err) {
            throw ({...{err: 30000800, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }
    static async getUserByVk (vk_id, email) {
        try {
            let query = `SELECT * FROM users WHERE vk_id=$1 OR email=$2 LIMIT 1`;
            return await db.query(db.pools.system, query, [vk_id, email]);

        } catch (err) {
            throw ({...{err: 30000900, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async setVkId (user_id, vk_id) {
        try {
            let data = {
                vk_id: vk_id
            };
            let arWhere = {
                id: user_id,
            };

            let result = await db.update(db.pools.system, `users`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 30001000, msg: 'Добавление пользователю id'}, ...err});
        }
    }

    static async setPassword (user_id, password) {
        try {

            let data = {
                password: password
            };
            let arWhere = {
                id: user_id,
            };

            let result = await db.update(db.pools.system, `users`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 30001100, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }
    static async setPhone (user_id, phone) {
        try {

            let data = {
                phone: phone
            };
            let arWhere = {
                id: user_id,
            };

            let result = await db.update(db.pools.system, `users`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 30001200, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }
}