import db from "../database/db";
import Joi from "joi";
import controllersAccount from "../controllers/account";

export default class {
    static async add (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    login: Joi.string().min(5).max(30).required(),
                    password: Joi.string().min(8).max(30).required(),
                    code: Joi.string().min(6).max(6).allow(null).empty('').default(null),
                    //captcha_sid: Joi.number().integer().min(1).max(9223372036854775807).allow(null).empty('').default(null),
                    //captcha_key: Joi.string().min(6).max(30).allow(null).empty('').default(null)
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);
                value.browser = ctx.headers['user-agent']; //для запроса в вк

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersAccount.add (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 201000000, msg: 'Ошибка формирования результата'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }

    static async get (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    offset: Joi.number().integer().min(0).max(9223372036854775807).allow(null).empty('').default(0),
                    count: Joi.number().integer().min(0).max(200).allow(null).empty('').default(20)
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);
            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersAccount.get (ctx, value);

                //поправка параметров для API
                result = await Promise.all(result.map(async (account, i) => {
                    if (account.friends_sex === null)
                        account.friends_sex = '';

                    if (account.likes_black_list === null) {
                        account.likes_black_list = '';
                    } else {
                        account.likes_black_list = account.likes_black_list.join('\n')
                    }

                    if (account.likes_stop_words === null) {
                        account.likes_stop_words = '';
                    } else {
                        account.likes_stop_words = account.likes_stop_words.join('\n')
                    }

                    if (account.friends_message === null)
                        account.friends_message = '';

                    if (account.friends_message_subscriber === null)
                        account.friends_message_subscriber = '';

                    return account;
                }));

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 202000000, msg: 'Загрузка аккаунтов'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async delete (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    id: Joi.number().integer().min(1).max(9223372036854775807).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);
            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersAccount.delete (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 203000000, msg: 'Удаление аккаунта'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
}