import modelsProfile from '../models/profile';
import crypto from "crypto";
import {createTransport} from 'nodemailer';
import bcrypt from "bcrypt";
import axios from "axios";
import modelsAuth from "../models/auth";
import modelsPay from '../models/pay';

export default class {

    static async getUser (ctx) {
        try {
            let arAccounts = await modelsProfile.getUser(ctx.auth.user_id);
            if (!arAccounts.length)
                return false;

            let result = {
                login: arAccounts[0].login,
                has_phone: arAccounts[0].phone !== null
            };

            let wallet = await modelsPay.getWallet(ctx.auth.user_id);

            if (wallet) {
                result.wallet = wallet.amount;
                if (!wallet.active)
                    result.inactive = true;
            }

            return result;
        } catch (err) {
            throw ({...{err: 30010000, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async reg (value) {
        try {
            //создаем hash /нужно поменять на дату
            let hash = new Date().toString();
            hash = crypto.createHash('md5').update(hash).digest("hex");

            //создание хеш пароля
            const saltRounds = 10;
            let passwordSalt = await bcrypt.genSalt(saltRounds);
            value.password = await bcrypt.hash(value.password, passwordSalt);

            //почту в нижний регистр
            value.email = value.email.toLowerCase();

            let arUsers = await modelsProfile.getUserByEmail(value.email);
            if (arUsers.length)
                throw ({err: 30020001, msg: 'Такой email уже зарегистрирован'});

            let arAccounts = await modelsProfile.reg(value.email, value.password, value.first_name, hash);

            const accountMail = {
                host: 'smtp.yandex.ru', //smtp.mail.ru
                port: 465, //465
                secure: true, // use SSL
                auth: {
                    user: 'reg@zayebot.ru',
                    pass: 'zayebot1247'
                }
            };
            //коннект
            const transporter = createTransport(accountMail);

            //отправка
            return transporter.sendMail({
                from: accountMail.auth.user,
                to: value.email,
                subject: 'ZayeBot - Код активации нового пользователя',
                html: `Для активации пользователя, перейдите по ссылке - <a href="https://zayebot.ru/reg-active/${hash}">https://zayebot.ru/reg-active/${hash}</a>`
            });

            return arAccounts;

        } catch (err) {
            throw ({...{err: 30020000, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }

    static async regActivate (value) {
        try {
            let arUsersCode = await modelsProfile.getUserNoActiveByCode(value.code);
            if (!arUsersCode.length)
                throw ({err: 30030001, msg: 'Заявки не существует'});

            let arUsers = await modelsProfile.getUserByEmailOrPhone(arUsersCode[0].email, value.phone);
            if (arUsers.length)
                throw ({err: 30030002, msg: 'Пользователь уже активирован'});

            let profile = await modelsProfile.addUser(arUsersCode[0].email, arUsersCode[0].password, arUsersCode[0].first_name, null, value.phone, value.ref);

            // создать кошелек
            await modelsPay.addWallet(profile.id);

            //здесь создание пользователя
            return true;

        } catch (err) {
            throw ({...{err: 30030000, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }
    static async reset (value) {
        try {
            //создаем hash /нужно поменять на дату
            let hash = new Date().toString();
            hash = crypto.createHash('md5').update(hash).digest("hex");

            let arUsers = await modelsProfile.getUserByEmail(value.email);
            console.log(arUsers)
            if (!arUsers.length)
                throw ({err: 30040001, msg: 'Такой email не зарегистрирован'});

            await modelsProfile.setByCode(arUsers[0].id, 1, hash);

            const accountMail = {
                host: 'smtp.yandex.ru', //smtp.mail.ru
                port: 465, //465
                secure: true, // use SSL
                auth: {
                    user: 'reg@zayebot.ru',
                    pass: 'zayebot1247'
                }
            };
            //коннект
            const transporter = createTransport(accountMail);

            //отправка
            transporter.sendMail({
                from: accountMail.auth.user,
                to: value.email,
                subject: 'ZayeBot - Код для востановления доступа к аккаунту',
                html: `Для востановления доступа к аккаунту, перейдите по ссылке - <a href="https://zayebot.ru/reset-active/${hash}">https://zayebot.ru/reset-active/${hash}</a>`
            });

            return true;

        } catch (err) {
            throw ({...{err: 30040000, msg: 'Отправка кода на e-mail'}, ...err});
        }
    }
    static async resetActivate (value) {
        try {
            let code = await modelsProfile.getByCode(1, value.code);
            if (!code.length)
                throw ({err: 30050001, msg: 'Такого кода не существует, попробуйте востановить пароль еще раз'});

            //создание хеш пароля
            const saltRounds = 10;
            let passwordSalt = await bcrypt.genSalt(saltRounds);
            value.password = await bcrypt.hash(value.password, passwordSalt);

            await modelsProfile.setPassword(code[0].user_id, value.password);

            return true;

        } catch (err) {
            throw ({...{err: 30050000, msg: 'Отправка кода на e-mail'}, ...err});
        }
    }
    static async setPassword (ctx, value) {
        try {

            //создание хеш пароля
            const saltRounds = 10;
            let passwordSalt = await bcrypt.genSalt(saltRounds);
            value.password = await bcrypt.hash(value.password, passwordSalt);

            await modelsProfile.setPassword(ctx.auth.user_id, value.password);

            //здесь создание пользователя
            return true;

        } catch (err) {
            throw ({...{err: 30060000, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }
    static async setPhone (ctx, value) {
        try {
            await modelsProfile.setPhone(ctx.auth.user_id, value.phone);

            //здесь создание пользователя
            return true;

        } catch (err) {
            throw ({...{err: 30070000, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }

    static async oauthVK (value) {
        try {
            let profile;
            let url = `https://oauth.vk.com/access_token?client_id=7407409&client_secret=zh5yRE43lBERO5MfkFH4&redirect_uri=https://zayebot.ru/oauth-vk&code=${value.code}`;

            let infoVk;
            try {
                infoVk = await axios({
                    method: 'get',
                    url: url,
                    headers: {'User-Agent': value.browser}
                });
            } catch (err) {
                throw ({...{err: 30080001, msg: 'VK возвращает ошибку'}});
            }

            console.log(infoVk);

            if ((!infoVk.data) || (!infoVk.data.user_id) || (!infoVk.data.email) || (!infoVk.data.access_token))
                throw ({err: 30080002, msg: 'Не полный ответ от VK'});

            //почта ВК в нижний регистр
            infoVk.data.email = infoVk.data.email.toLowerCase();

            //поиск профиля в боте
            let arProfile = await modelsProfile.getUserByVk(infoVk.data.user_id, infoVk.data.email);

            //профиля нет /нужно создать
            if (!arProfile.length) {
                console.log('профиля нет /нужно создать');

                //генерация пароля
                let password = getRandomInt(10000000, 99999999);
                const saltRounds = 10;
                let passwordSalt = await bcrypt.genSalt(saltRounds);
                password = await bcrypt.hash(`${password}`, passwordSalt);

                let vkUser;
                try {
                    let url = `https://api.vk.com/method/users.get?user_id=${infoVk.data.user_id}`;
                    url += `&access_token=${infoVk.data.access_token}&v=5.52`;
                    vkUser = await axios({
                        method: 'get',
                        url: url,
                        headers: {'User-Agent': value.browser}
                    });
                } catch (err) {
                    throw ({err: 30080004, msg: 'ВК: ошибка в методе users.get'});
                }

                if ((!vkUser.data.response.length) || (!vkUser.data.response[0].first_name) && (!vkUser.data.response[0].last_name))
                    throw ({err: 30080005, msg: 'ВК: ошибка в методе users.get'});

                profile = await modelsProfile.addUser(infoVk.data.email, password, vkUser.data.response[0].first_name, vkUser.data.response[0].last_name, null, value.ref, infoVk.data.user_id);

                // создать кошелек
                await modelsPay.addWallet(profile.id);
            }

            //профиль не привязан /нужно привязать по почте
            if ((arProfile.length) && (!arProfile[0].vk_id) && (arProfile[0].email)) {
                console.log('профиль есть /нужно привязать id');

                profile = await modelsProfile.setVkId(arProfile[0].id, infoVk.data.user_id);
            }

            //профиль привязан /нужна авторизация
            if ((arProfile.length) && (arProfile[0].vk_id)) {
                console.log('профиль есть /авторизирую');
                profile = arProfile[0];
            }

            let token = await modelsAuth.authorization(profile.id, value.ip, value.browser);
            if (!token)
                throw ({err: 30080006, msg: 'Токен не создан'});

            return {...token, ...{login: infoVk.data.email}};

        } catch (err) {
            throw ({...{err: 30080000, msg: 'Создание запроса на регистрацию нового пользователя'}, ...err});
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}