import db from "../database/db";
import bcrypt from 'bcrypt';
import Joi from "joi";
import controllersAuth from "../controllers/auth";

export default class {
    static async login (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    login: Joi.string().min(5).max(30).required(),
                    password: Joi.string().min(8).max(30).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

                value.ip = ctx.request.ip;
                value.browser = ctx.headers['user-agent'];

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersAuth.login (ctx, value);

                ctx.body = {
                    err: 0,
                    response: {
                        login: result.login,
                        tid: result.id,
                        token: result.token_key
                    }
                };
            } catch (err) {
                throw ({...{err: 10000000, msg: 'Ошибка формирования результата'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
}