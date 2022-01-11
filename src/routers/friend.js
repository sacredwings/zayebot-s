import db from "../database/db";
import Joi from "joi";
import controllersFriend from "../controllers/friend";

export default class {
    static async edit (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    account_id: Joi.number().integer().min(1).max(9223372036854775807).required(),
                    allowed: Joi.number().integer().min(0).max(1).required(),
                    age_use: Joi.number().integer().min(0).max(1).required(),
                    age_from: Joi.number().integer().min(0).max(100).required(),
                    age_to: Joi.number().integer().min(0).max(100).required(),
                    sex: Joi.string().max(1).allow(null).empty('').default(null),
                    message: Joi.string().max(500).allow(null).empty('').default(null),
                    message_subscriber: Joi.string().max(500).allow(null).empty('').default(null)
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

                console.log(value)
                if ((value.sex !== '') && (value.sex !== null) && (value.sex !== 'm') && (value.sex !== 'w'))
                    throw ({});


            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersFriend.edit (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 302000000, msg: 'Редактирование настроек сортировки друзей'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async editBirthday (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    account_id: Joi.number().integer().min(1).max(9223372036854775807).required(),
                    allowed: Joi.number().integer().min(0).max(1).required(),
                    sentence: Joi.array().min(0).max(100).required()
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersFriend.editBirthday (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 302000000, msg: 'Редактирование настроек сортировки друзей'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
}