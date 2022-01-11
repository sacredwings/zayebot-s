import modelsLike from '../models/like';
import modelsModule from '../models/module';

export default class {

    //Добавление аккаунта
    static async edit (ctx, value) {
        try {
            //подготовка черного списка для записи в базу
            if ((value.black_list.length === 0) || (value.black_list[0] === ''))
                value.black_list = null;
            else
                value.black_list = JSON.stringify(value.black_list);

            //подготовка стоп слов для записи в базу
            if ((value.stop_words.length === 0) || (value.stop_words[0] === ''))
                value.stop_words = null;
            else
                value.stop_words = JSON.stringify(value.stop_words);

            let user_id = ctx.auth.user_id;

            let modules = [];

            if (value.allowed)
                modules.push(1);

            if (value.vk_post_allowed)
                modules.push(2);

            if (value.vk_friend_allowed)
                modules.push(3);

            if (modules.length > 0)
                await modelsModule.checkBuyModules(user_id, value.account_id, modules);

            let account = await modelsLike.edit(
                user_id,
                value.account_id,

                value.allowed,
                value.source_ids_friends,
                value.source_ids_groups,
                value.source_ids_pages,
                value.source_ids_following,
                value.filters_post,
                value.filters_photo,
                value.repost,

                value.vk_post_allowed,
                value.vk_post_people,
                value.vk_post_groups,

                value.vk_friend_allowed,
                value.vk_friend_people,
                value.vk_friend_groups,

                value.black_list,
                value.stop_words
            );

            return true;

        } catch (err) {
            throw ({...{err: 200010000, msg: 'Добавление аккаунта'}, ...err});
        }
    }

    /*
    static async get (ctx, value) {
        try {
            let result = await modelsAccount.get(ctx.auth.user_id, value);

            return result;

        } catch (err) {
            throw ({...{err: 200020000, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }*/
}