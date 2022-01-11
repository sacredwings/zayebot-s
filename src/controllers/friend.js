import modelsFriend from '../models/friend';
import modelsModule from '../models/module';

export default class {

    //Добавление аккаунта
    static async edit (ctx, value) {
        try {
            let user_id = ctx.auth.user_id;

            let modules = [];

            if (value.allowed)
                modules.push(5);

            if (modules.length > 0)
                await modelsModule.checkBuyModules(user_id, value.account_id, modules);

            let account = await modelsFriend.edit(user_id, value.account_id, value.allowed, value.age_use, value.age_from, value.age_to, value.sex, value.message, value.message_subscriber);
            console.log(account)

            return true;

        } catch (err) {
            throw ({...{err: 200010000, msg: 'Редактирование настроек сортировки друзей'}, ...err});
        }
    }

    //Добавление аккаунта
    static async editBirthday (ctx, value) {
        try {
            let user_id = ctx.auth.user_id;

            //подготовка фраз поздравлений
            if ((value.sentence.length === 0) || (value.sentence[0] === ''))
                value.sentence = null;
            else
                value.sentence = JSON.stringify(value.sentence);

            let modules = [];

            if (value.allowed)
                modules.push(6);

            if (modules.length > 0)
                await modelsModule.checkBuyModules(user_id, value.account_id, modules);

            //в json обратно
            value.sentence = JSON.stringify(value.sentence);

            let account = await modelsFriend.editBirthday(user_id, value.account_id, value.allowed, value.sentence);
            return true;

        } catch (err) {
            throw ({...{err: 200010000, msg: 'Редактирование настроек сортировки друзей'}, ...err});
        }
    }
}