import Joi from "joi";
import controllersPay from "../controllers/pay";

export default class {
    static async add (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    account_id: Joi.number().integer().min(1).max(9223372036854775807).required(),
                    tariff: Joi.number().integer().min(1).max(2).required(),
                    month: Joi.number().integer().min(1).max(3).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersPay.add (value);

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

    static async getWallet (ctx, next) {
        try {
            try {
                let result = await controllersPay.getWallet(ctx.auth.user_id);

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

    static async prepaid (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    sum: Joi.number().integer().min(1).max(50000).required()
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

                // Указать ID пользователя
                value.user_id = ctx.auth.user_id;
            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersPay.prepaid (value);

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

    // WebHook уведомление о платеже от Qiwi
    static async hook (ctx, next) {
        try {
            let result = await controllersPay.acceptPayment (
                ctx.request.headers['x-api-signature-sha256'],
                ctx.request.body);

            if (result)
                ctx.body = 'OK';
            else
                ctx.response.status = 401;
        } catch (err) {
            ctx.body = {msg: err.message};
        }
    }

    static async transacts (ctx, next) {
        try {
            try {
                let result = await controllersPay.getTransactions(ctx.auth.user_id);

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

    static async history (ctx, next) {
        try {
            try {
                let result = await controllersPay.getIncoming(ctx.auth.user_id);

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
}