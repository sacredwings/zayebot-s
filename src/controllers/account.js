import modelsAccount from '../models/account'
import modelsProfile from '../models/profile'
import modelsLike from '../models/like'
import modelsFriend from '../models/friend'

import axios from "axios";

export default class {

    //Добавление аккаунта
    static async add (ctx, value) {
        try {
            /*
            let profile = await modelsProfile.getUser(ctx.auth.user_id, value.login);
            if ((!profile.length) || (!profile[0].phone))
                throw ({...{err: 200010020, msg: 'Требуется указать телефон'}});
*/
            let account = await modelsAccount.get(ctx.auth.user_id, value.login);
            /*
            if (account)
                return false;
*/
            //замена спец символа
            //value.password = value.password.replace("#", "%23");

            value.password = encodeURIComponent(value.password);

            let url = `https://oauth.vk.com/token?grant_type=password&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH&username=${value.login}&password=${value.password}&2fa_supported=1`;
            url = encodeURI(url);

            //обратное кодирование символа "%"
            url = url.replace("%25", "%");

            //если есть код, то добавляем к запросу
            if (value.code)
                url += `&code=${value.code}`;

            //если есть captcha, то добавляем к запросу
            if (value.captcha_sid)
                url += `&captcha_sid=${value.captcha_sid}&captcha_key=${value.captcha_key}`;

            let resToken;
            try {
                resToken = await axios({
                    method: 'get',
                    url: url,
                    headers: {'User-Agent': value.browser}
                });
            } catch (err) {
                //нужно проверить код ошибки
                console.log(err);
                if (!err.response)
                    throw ({err: 200010001, msg: 'Ошибка ВК: в ответе нет - response'});

                if (!err.response.status)
                    throw ({err: 200010002, msg: 'Ошибка ВК: в ответе нет - status'});

                if (err.response.status !== 401)
                    throw ({err: 200010003, msg: 'Ошибка ВК: в ответе status не = 401'});

                if (!err.response.data)
                    throw ({err: 200010004, msg: 'Ошибка ВК: в ответе нет - data'});

                if ((err.response.data.error === 'need_validation') && (err.response.data.validation_type === '2fa_sms'))
                    throw ({err: 200010005, msg: 'Вам отправлен проверочный код в СМС'});

                if (err.response.data.error === 'invalid_client')
                    throw ({err: 200010006, msg: 'Логин или пароль введен не верно'});

                if (err.response.data.error === 'need_captcha')
                    throw ({err: 200010007, msg: 'Требуется "captcha"'});

                if ((err.response.data.error === 'invalid_request') && (err.response.data.error_type === 'wrong_otp'))
                    throw ({err: 200010008, msg: 'Не верный код из СМС'});

                throw ({err: 200010009, msg: 'Неизвестная ошибка ВК'});
            }

            if ((!resToken.data.access_token) || (!resToken.data.user_id))
                throw ({err: 200010010, msg: 'В ответе ВК нет необходимых полей'});


            let resUser;
            try {
                let url = `https://api.vk.com/method/users.get?user_id=${resToken.data.user_id}`;
                url += `&fields=photo_max,photo_400_orig`;
                url += `&access_token=${resToken.data.access_token}&v=5.52`;
                resUser = await axios({
                    method: 'get',
                    url: url,
                    headers: {'User-Agent': value.browser}
                });
            } catch (err) {
                throw ({err: 200010011, msg: 'ВК: ошибка в методе users.get'});
            }
            console.log(resUser.data)
            resUser = resUser.data.response[0];

            console.log(resUser)
            //создание аккаунта
            let resAccount = await modelsAccount.add(ctx.auth.user_id, value.browser, value.login, value.password, resToken.data.user_id, resToken.data.access_token, resUser.first_name, resUser.last_name, resUser.photo_400_orig, resUser.photo_max);
            if (!resAccount)
                throw ({err: 200010020, msg: 'Аккаунт не создан'});

            //создание настроек лайков
            //await modelsLike.add(ctx.auth.user_id, resAccount.id);

            //создание настроек друзей - теперь в самом аккаунте
            //await modelsFriend.add(ctx.auth.user_id, resAccount.id);

            return true;

        } catch (err) {
            throw ({...{err: 200010000, msg: 'Добавление аккаунта'}, ...err});
        }
    }

    static async get (ctx, value) {
        try {
            let arAccounts = await modelsAccount.get(ctx.auth.user_id, value);
            if (!arAccounts.length)
                return [];

            /*
            let result = await Promise.all (arAccounts.map(async (item, i)=>{
                item.likes = await modelsLike.get(ctx.auth.user_id, item.id);
                return item;
            }));
            */

            return arAccounts;

        } catch (err) {
            throw ({...{err: 200020000, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async delete (ctx, value) {
        try {
            console.log(ctx.auth.user_id)
            console.log(value.id)
            let arAccounts = await modelsAccount.delete(ctx.auth.user_id, value.id);
            console.log('1111')
            if (!arAccounts.length)
                return [];

            return arAccounts;

        } catch (err) {
            throw ({...{err: 200030000, msg: 'Удаление аккаунта'}, ...err});
        }
    }
}