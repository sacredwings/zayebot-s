import db from "../database/db";
import Joi from "joi";
import controllersProfile from "../controllers/profile";
import axios from "axios";

export default class {
    static async getUser (ctx, next) {
        let value;
        try {
            try {
                let result = await controllersProfile.getUser (ctx);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30100000, msg: 'Ошибка формирования результата'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async reg (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    first_name: Joi.string().min(3).max(30).required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(8).max(30).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersProfile.reg (value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30200000, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async regActivate (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    code: Joi.string().min(32).max(32).required(),
                    ref: Joi.string().min(6).max(30).allow(null).empty('').default(null),
                    phone: Joi.number().integer().min(70000000000).max(79999999999).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersProfile.regActivate (value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30300000, msg: 'Активация нового пользователя'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async reset (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    email: Joi.string().email().required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersProfile.reset (value);

                console.log(result)

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30400000, msg: 'Отправка кода на e-mail'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async resetActivate (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    code: Joi.string().min(32).max(32).required(),
                    password: Joi.string().min(8).max(30).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersProfile.resetActivate (value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30500000, msg: 'Сброс пароля'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async setPassword (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    password: Joi.string().min(8).max(32).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersProfile.setPassword (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30600000, msg: 'Изменение пароля'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async setPhone (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    phone: Joi.number().integer().min(70000000000).max(79999999999).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersProfile.setPhone (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 30700000, msg: 'Изменение телефона'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }
    static async oauthVK (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    code: Joi.string().min(10).max(30).required(),
                    ref: Joi.string().min(6).max(30).allow(null).empty('').default(null),
                    phone: Joi.number().integer().min(70000000000).max(79999999999).allow(null).empty('').default(null),
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
                let result = await controllersProfile.oauthVK (value);

                ctx.body = {
                    err: 0,
                    response: {
                        login: result.login,
                        tid: result.id,
                        token: result.token_key
                    }
                };
            } catch (err) {
                throw ({...{err: 30800000, msg: 'Изменение пароля'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }
    }

}