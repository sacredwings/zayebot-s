import db from "../database/db";
import bcrypt from "bcrypt";
import modelsAuth from "../models/auth";

export default class auth {
    static async login (ctx, value) {
        try {
            let user = await db.query(db.pools.system, `SELECT * FROM users WHERE login='${ctx.request.body.login}'`);

            if (!user.length)
                throw ({err: 101000001, msg: 'Неверный логин'});

            user = user[0];

            let match = await bcrypt.compare(value.password, user.password);

            //пороли не совпадают
            if (!match)
                throw ({err: 101000002, msg: 'Неверный пароль'});

            let token = await modelsAuth.authorization(user.id, value.ip, value.browser);
            if (!token)
                throw ({err: 101000003, msg: 'Токен не создан'});

            return {...token, ...{login: user.login}};


        } catch (err) {
            throw ({...{err: 101000000, msg: 'Авторизация'}, ...err});
        }
    }
}