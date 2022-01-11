import db from "../database/db";
import Joi from "joi";
import controllersLike from "../controllers/like";

//value.split('\n')

export default class {
    static async edit (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    account_id: Joi.number().integer().min(1).max(9223372036854775807).required(),

                    allowed: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    source_ids_friends: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    source_ids_groups: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    source_ids_pages: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    source_ids_following: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    filters_post: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    filters_photo: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    repost: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),

                    vk_post_allowed: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    vk_post_people: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    vk_post_groups: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),

                    vk_friend_allowed: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    vk_friend_people: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),
                    vk_friend_groups: Joi.number().integer().min(0).max(1).allow(null).empty('').default(0),

                    black_list: Joi.array().min(0).max(100).required(),
                    stop_words: Joi.array().min(0).max(100).required(),
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);

            } catch (err) {
                console.log(err)
                throw ({err: 412, msg: 'Неверные параметры'});
            }
            try {
                let result = await controllersLike.edit (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 302000000, msg: 'Ошибка редактирования настроек лайков'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }

    /*
    static async get (ctx, next) {
        let value;
        try {
            try {
                //схема
                const schema = {
                    account_id: Joi.string().min(0).max(9223372036854775807).required()
                };

                //вход и проверка параметров по схеме
                value = await Joi.validate(ctx.request.body, schema);
            } catch (err) {
                throw ({...{err: 412, msg: 'Неверные параметры'}, ...err});
            }
            try {
                let result = await controllersLike.get (ctx, value);

                ctx.body = {
                    err: 0,
                    response: result
                };
            } catch (err) {
                throw ({...{err: 303000000, msg: 'Загрузка лайков'}, ...err});
            }
        } catch (err) {
            ctx.body = err;
        }

    }*/
}