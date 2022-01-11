import db from "../database/db";
import Joi from "joi";

export default class {

    /*
    static async add (user_id, account_id) {
        try {
            let data = {
                user_id: user_id,
                account_id: account_id
            };
            let result = await db.insert(db.pools.system, `likes`, data, `id`);
            if (result)
                return result[0];

            return false;
        } catch (err) {
            throw ({...{err: 300000100, msg: 'Конфиг лайков не создан'}, ...err});
        }
    }
    */

    static async edit (user_id, account_id, allowed, source_ids_friends, source_ids_groups, source_ids_pages, source_ids_following, filters_post, filters_photo, repost, vk_post_allowed, vk_post_people, vk_post_groups, vk_friend_allowed, vk_friend_people, vk_friend_groups, black_list, stop_words) {
        try {
            await db.query(db.pools.system, 'BEGIN');

            let data = {
                likes_allowed: allowed,
                likes_vk_post_allowed: vk_post_allowed,
                likes_vk_friend_allowed: vk_friend_allowed
            };

            let result = await db.update(db.pools.system, `bill`, data, {account_id: account_id}, 'id');
            if (!result) {
                await db.query(db.pools.system, 'ROLLBACK');
                throw ({err: 200000201, msg: 'Включение модулей'});
            }

            data = {
                likes_source_ids_friends: source_ids_friends,
                likes_source_ids_groups: source_ids_groups,
                likes_source_ids_pages: source_ids_pages,
                likes_source_ids_following: source_ids_following,
                likes_filters_post: filters_post,
                likes_filters_photo: filters_photo,
                likes_repost: repost,
                likes_vk_post_people: vk_post_people,
                likes_vk_post_groups: vk_post_groups,
                likes_vk_friend_people: vk_friend_people,
                likes_vk_friend_groups: vk_friend_groups,
                likes_black_list: black_list,
                likes_stop_words: stop_words
            };

            let arWhere = {
                user_id: user_id,
                id: account_id
            };

            result = await db.update(db.pools.system, `accounts`,  data, arWhere, 'id');
            if (!result) {
                await db.query(db.pools.system, 'ROLLBACK');
                throw ({err: 200000201, msg: 'Настройка'});
            }

            await db.query(db.pools.system, 'COMMIT');

            return true;
        } catch (err) {
            throw ({...{err: 300000200, msg: 'Конфиг лайков не отредактирован'}, ...err});
        }
    }

    static async get (user_id, account_id) {
        try {
            let query = `SELECT * FROM likes WHERE user_id=$1 AND account_id=$2`;
            return await db.query(db.pools.system, query, [user_id, account_id]);
        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка конфига лайков'}, ...err});
        }
    }

}