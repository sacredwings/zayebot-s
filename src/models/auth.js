import db from "../database/db";
import crypto from "crypto";

export default class {
    static async authorization (user_id, ip, browser) {
        try {
            //создаем hash /нужно поменять на дату
            let hash = new Date().toString();
            hash = crypto.createHash('md5').update(hash).digest("hex");

            let data = {
                token_key: hash,
                user_id: user_id,
                ip: ip,
                browser: browser,
            };

            let result = await db.insert(db.pools.system, `tokens`, data, ['id', 'token_key']);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }
}