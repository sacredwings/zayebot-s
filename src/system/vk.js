import axios from 'axios';
import modelsAccount from '../models/account';
import modelsControlRepeatDay from '../system/control_repeat_day';


//класс для работы с аккаунтами ВК
export default class vk {
    static async likes() {

        //загрузка аккаунтов из базы
        let arAccounts = await modelsAccount.getLikes(1000); //установлен лимит
        if (!arAccounts.length) //если нет /выход
            return false;

        //перебор аккаунтов
        for (let account of arAccounts) {

            //нет токена - пропускаем
            if (!account.soc_token) continue;
            //ошибка аккаунта - пропускаем
            if (account.soc_error_code) continue;

            console.log(account)

            //обнуление количества лайков - для посчета количества поставленных лайков за цикл
            //let count = 0;

            /*
            //разрешено лайкать
            if (!account.likes_allowed)
                continue;

             */

            //лайков больше чем установлено ограничение /перключаемся на следующий аккаунт в цикле
            if (account.likes_counts_day >= 100)
                continue;

            //загрузка лайков
            let getLikeVk = await vk.getLikeVk(account.soc_token, account.browser, account);

            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
            console.log(getLikeVk)

            let likeObject = [];
            likeObject = likeObject.concat(await vk.getLikeObjectVkNewsfeedGet(account.soc_token, account.browser, getLikeVk, account));
            likeObject = likeObject.concat(await vk.getLikeObjectVkNewsfeedGetRecommended(account.soc_token, account.browser, getLikeVk, account));
            likeObject = likeObject.concat(await vk.getLikeObjectVkFriendsGetSuggestions(account.soc_token, account.browser, getLikeVk, account));

            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
            console.log('объекты для лайков')
            console.log(likeObject)


            await vk.addLikeVk(account.soc_token, account.browser, account.id, likeObject)

        }

        return true;
    }

    static async addLikeVk(soc_token, browser, account_id, arLikeObject) {
        //нет объектов для лайков
        if ((!arLikeObject) || (!arLikeObject.length))
            return false;

        console.log('! симуляция лайков !')
        //+ 1 секунды от последнего однозначно
        let time = 1000;
        let arTimeInfo = [];
        arLikeObject.forEach(function(item, i, arr) {

            //объект для лайка
            let item_id = item.post_id; //по умолчанию id поста

            if ((item.type === 'post') && (!item.post_id))
                item_id = item.id;

            if (item.type === 'photo')
                item_id = item.photos.items[0].id; //id самого фото / находится в массиве объектов поста

            let source_id = item.source_id;

            if ((item.type === 'post') && (!item.source_id))
                source_id = item.owner_id;

            //+ до 5 секунд
            time += 5000;

            time = getRandomIntInclusive(time, time+15000)

            //для информации
            arTimeInfo[arTimeInfo.length] = time

            setTimeout(async () => {

                console.log(new Date())


                let url = `https://api.vk.com/method/likes.add?type=${item.type}&owner_id=${source_id}&item_id=${item_id}`
                url += `&access_token=${soc_token}&v=5.103`;
                url = encodeURI(url); //кодируем в url
                console.log(url)

                let wallGetById = await axios({
                    method: 'get',
                    url: url,
                    headers: {'User-Agent': browser}
                });

                //сохраняем результаты количества лайков
                await modelsAccount.setLikesCount(account_id, 1);

            }, time);
        });

        return true;
    }

    //установка лайка /execute
    static async getLikeObjectVkFriendsGetSuggestions(soc_token, browser, getLikeVk, account) {

        let resultLikeObject = [];

        //лайков больше чем установлено ограничение /выходим из цикла
        if (account.likes_counts_day >= 200)
            return resultLikeObject;

        //обработка массива лайков friends_getSuggestions
        if ((getLikeVk.friends_getSuggestions) && (getLikeVk.friends_getSuggestions.length)) {

            //объекты есть /проверяем
            for (let likeGroupObject of getLikeVk.friends_getSuggestions) {

                //вместо объекта false
                if (!likeGroupObject) continue;

                //перебор массива в нутри объекта / стена в нутри пользователя
                for (let likeObject of likeGroupObject.items) {
                    if (likeObject.type !== 'post')
                        continue;

                    //человек, но запрещен
                    if ((likeObject.source_id > 0) && (!account.likes_vk_post_people))
                        continue;

                    //группа или страница, но запрещена
                    if ((likeObject.source_id < 0) && (!account.likes_vk_post_groups))
                        continue;

                    //поиск совпадений для стоп слов
                    if ((likeObject.type === 'post') && (stopWord(likeObject.text, account.likes_stop_words)))
                        continue;

                    console.log('Проверки пройдены - проверяю возможность поставить лайк');

                    resultLikeObject[resultLikeObject.length] = likeObject

                    //лайков больше чем установлено ограничение /выходим из цикла
                    if (account.likes_counts_day >= 100)
                        break;

                }
            }
        }

        //объектов для лайков нет
        if (!resultLikeObject.length)
            return resultLikeObject;

        return resultLikeObject;
    }

    //установка лайка /execute
    static async getLikeObjectVkNewsfeedGet(soc_token, browser, getLikeVk, account) {

        let resultLikeObject = [];

        //лайков больше чем установлено ограничение /выходим false
        if (account.likes_counts_day >= 200)
            return resultLikeObject;

        //обработка массива лайков newsfeed_get
        if ((getLikeVk.newsfeed_get) && (getLikeVk.newsfeed_get.items.length)) {

            //объекты есть /проверяем
            for (let likeObject of getLikeVk.newsfeed_get.items) {


                //пост без репоста /репост включен - переключаем цикл +1
                if ((likeObject.type === 'post') && (!likeObject.copy_history) && (!account.likes_filters_post))
                    continue;

                //репост /репост не включен - переключаем цикл +1
                if ((likeObject.type === 'post') && (likeObject.copy_history) && (!account.likes_repost))
                    continue;

                //поиск совпадений автора поста с массивом черного списка
                if (contains(likeObject.source_id, account.likes_black_list))
                    continue;

                //поиск совпадений для стоп слов
                if ((likeObject.type === 'post') && (stopWord(likeObject.text, account.likes_stop_words)))
                    continue;

                console.log('Проверки пройдены - проверяю возможность поставить лайк');
                console.log(likeObject)

                //лайк уже стоит / PHOTO /проверка только первого объекта
                if ((likeObject.type === 'photo') && (likeObject.photos.items[0].likes.user_likes))
                    continue;

                //лайк уже стоит или нельзя поставить / POST
                if ((likeObject.type === 'post') && (likeObject.likes.user_likes) && (!likeObject.likes.can_like))
                    continue;

                console.log('Лайк поставить можно');

                resultLikeObject[resultLikeObject.length] = likeObject

                //лайков больше чем установлено ограничение /выходим из цикла
                if (account.likes_counts_day >= 100)
                    break;
            }
        }

        //объектов для лайков нет
        if (!resultLikeObject.length)
            return resultLikeObject;

        return resultLikeObject;
    }

    //установка лайка /execute
    static async getLikeObjectVkNewsfeedGetRecommended(soc_token, browser, getLikeVk, account) {

        let resultLikeObject = [];

        //лайков больше чем установлено ограничение /выходим из цикла
        if (account.likes_counts_day >= 200)
            return resultLikeObject;

        //обработка массива лайков newsfeed_getRecommended
        if ((getLikeVk.newsfeed_getRecommended) && (getLikeVk.newsfeed_getRecommended.items.length)) {

            //объекты есть /проверяем
            for (let likeObject of getLikeVk.newsfeed_getRecommended.items) {

                //это не пост
                if (likeObject.type !== 'post')
                    continue;

                //человек, но запрещен
                if ((likeObject.source_id > 0) && (!account.likes_vk_post_people))
                    continue;

                //группа или страница, но запрещена
                if ((likeObject.source_id < 0) && (!account.likes_vk_post_groups))
                    continue;

                console.log('Проверки пройдены - проверяю возможность поставить лайк');

                resultLikeObject[resultLikeObject.length] = likeObject

                //лайков больше чем установлено ограничение /выходим из цикла
                if (account.likes_counts_day >= 100)
                    break;
            }
        }

        //объектов для лайков нет
        if (!resultLikeObject.length)
            return resultLikeObject;

        return resultLikeObject;
    }

    //загрузка всех элементов для лайков /execute
    static async getLikeVk(soc_token, browser, account) {

        let code = [];
        console.log(code)

        //-----------------------------------------------------
        //друзья, подписчики /настройки подходят
        if (((account.likes_source_ids_friends) || (account.likes_source_ids_groups) || (account.likes_source_ids_pages) || (account.likes_source_ids_following)) && //источники
            ((account.likes_filters_post) || (account.likes_filters_photo) || (account.likes_repost)) &&
            (account.likes_allowed)) { //фильтры

            console.log('друзья, подписчики')

            //количество постов
            let count = 40;

            //формируем настройки в строку для запроса
            let sourceIds = vk.VkNewsfeedGetSourceIds(account); //формирование источника
            let filters = vk.VkNewsfeedGetFilters(account); //формирование фильтра

            code[code.length] = `var newsfeed_get = API.newsfeed.get({"source_ids":"${sourceIds}", "filters":"${filters}", "count":"${count}"});`;
        } else
            code[code.length] = `var newsfeed_get = null;`;

        //-----------------------------------------------------
        //рекомендации ВК /настройки подходят
        if (((account.likes_vk_post_people) || (account.likes_vk_post_groups)) &&
            (account.likes_vk_post_allowed)) { //фильтры /источник один

            console.log('рекомендации ВК')

            //количество постов
            let count = 40;

            code[code.length] = `var newsfeed_getRecommended = API.newsfeed.getRecommended({"count":"${count}"});`;
        } else
            code[code.length] = `var newsfeed_getRecommended = null;`;

        //-----------------------------------------------------
        //рекомендованные друзья ВК /настройки подходят
        if (((account.likes_vk_friend_people) || (account.likes_vk_friend_groups)) &&
            (account.likes_vk_friend_allowed)) { //фильтры /источник один

            console.log('рекомендуемые друзья ВК')

            //количество постов
            let countPeople = 20;
            let count = 5;


            code[code.length] = `var friends_get = API.friends.getSuggestions({"count": ${countPeople}});`
            code[code.length] = `var i = 0;`;
            code[code.length] = `var friends_arr = friends_get.items@.id;`;
            code[code.length] = `var friends_getSuggestions = [];`;
                
            code[code.length] = `while (friends_arr[i] != null) {`;
            code[code.length] = `i = i+1;`;
            code[code.length] = `friends_getSuggestions = friends_getSuggestions + [API.wall.get({"owner_id": friends_arr[i], "count": ${count}})];`;
            code[code.length] = `};`;
            code[code.length] = `var friends_getSuggestionsUsersCount = friends_get.count;`;

            /*
            code[code.length] = `var friends_get = API.friends.getSuggestions({"count": ${countPeople}});
            var i = 0;
            friends_get = friends_get.items@.id;
            var friends_getSuggestions = [];
            
            while (friends_get[i] != null) {
            
            friends_getSuggestions = friends_getSuggestions + [API.wall.get({"owner_id": friends_get[i], "count": ${count}})];
            i = i + 1;
            code[code.length] = };`;*/
        } else {
            code[code.length] = `var friends_getSuggestions = null;`;
            code[code.length] = `var friends_getSuggestionsUsersCount = null;`;
        }


        //объединение в один запрос
        code[code.length] = `return {"newsfeed_get":newsfeed_get,"newsfeed_getRecommended":newsfeed_getRecommended,"friends_getSuggestions":friends_getSuggestions,"friends_getSuggestionsUsersCount":friends_getSuggestionsUsersCount};`;

        console.log(code)

        code = code.join(' '); //в строку
        console.log(code)
        code = encodeURIComponent(code);
        console.log(code)
        //code = encodeURI(code); //кодируем в url
        //обратное кодирование символа "%"
        //code = code.replace("%25", "%");

        let url = `https://api.vk.com/method/execute?code=${code}&access_token=${soc_token}&v=5.103`;
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        if (!result.data.response)
            return false;

        return result.data.response;
    }

    //------------------------------------------------------------------------------------------------------------------
    //ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    //формирование источника
    static VkNewsfeedGetSourceIds (account) {
        //формирование массива
        let arr = [];

        if (account.likes_source_ids_friends)
            arr[arr.length] = `friends`;
        if (account.likes_source_ids_groups)
            arr[arr.length] = `groups`;
        if (account.likes_source_ids_pages)
            arr[arr.length] = `pages`;
        if (account.likes_source_ids_following)
            arr[arr.length] = `following`;

        //нет параметров
        if (!arr.length)
            return false;

        //ответ для запроса
        return arr.join(',');
    }

    //формирование фильтра
    static VkNewsfeedGetFilters (account) {
        //формирование массива
        let arr = [];

        if ((account.likes_filters_post) || (account.likes_repost))
            arr[arr.length] = `post`;
        if (account.likes_filters_photo)
            arr[arr.length] = `photo`;

        //нет параметров
        if (!arr.length)
            return false;

        //ответ для запроса
        return arr.join(',');
    }

    //==================================================================================================================
    static async friends () {

        let arAccounts = await modelsAccount.getFriends(1000);
        if (!arAccounts.length)
            return false;


        //работа с аккаунтами
        for (let account of arAccounts) {


            console.log(account)

            let arFriends = await vk.friends_getRequests(account.soc_token, account.browser);
            if (!arFriends) continue;

            console.log(arFriends)

            for (let friend of arFriends) {

                console.log(friend)

                let resultAddUser = await vk.friends_sort(account.soc_token, account.browser, friend, account.friends_sex, account.friends_age_use, account.friends_age_from, account.friends_age_to);

                //добавление или отклонение заявки в друзья
                if (resultAddUser === 1){
                    await vk.friends_add(account.soc_token, account.browser, friend.user_id);

                    if (account.friends_message)
                        await vk.friends_send(account.soc_token, account.browser, friend.user_id, account.friends_message);
                } else {
                    await vk.friends_delete(account.soc_token, account.browser, friend.user_id);

                    if (account.friends_message_subscriber)
                        await vk.friends_send(account.soc_token, account.browser, friend.user_id, account.friends_message_subscriber);
                }


            }

            //console.log(arFriends)
        }

    }

    static async friends_add (token, browser, user_id) {
        let follow = 0;
        let url = `https://api.vk.com/method/friends.add?user_id=${user_id}&follow=${follow}&access_token=${token}&v=5.103`;
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        console.log(result.data)
        if ((result.data) && (result.data.response))
            return true;

        return false;

    }

    static async friends_delete (token, browser, user_id) {
        let url = `https://api.vk.com/method/friends.delete?user_id=${user_id}&access_token=${token}&v=5.103`;
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        console.log(result.data)
        if ((result.data) && (result.data.response))
            return true;

        return false;

    }

    static async friends_send (token, browser, user_id, message) {
        let seconds = Math.floor(Date.now() / 1000);
        message = encodeURI(message);
        let url = `https://api.vk.com/method/messages.send?user_id=${user_id}&message=${message}&random_id=${seconds}&access_token=${token}&v=5.103`;
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        console.log(result.data)
        if ((result.data) && (result.data.response))
            return true;

        return false;
    }

    static async friends_getRequests (token, browser) {
        let count = 3; //добавить пользователей за раз
        let url = `https://api.vk.com/method/friends.getRequests?extended=1&need_mutual=0&out=0&suggested=0&count=${count}&access_token=${token}&v=5.103`;
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        if ((result.data) && (result.data.response) && (result.data.response.items) && (result.data.response.items.length))
            return result.data.response.items;

        return false;

    }

    static async friends_sort (token, browser, friend, sex, age_use, age_from, age_to) {

        let arResult = [];

        let q = `${friend.first_name} ${friend.last_name}`;

        //удаленные и забаненые игнорируем
        if (friend.deactivated)
            return false;

        let url = `https://api.vk.com/method/users.search?q=${q}&count=1000`;

        if (age_use)
            url += `&age_from=${age_from}&age_to=${age_to}`;

        if (sex === 'm')
            url += `&sex=2`;

        if (sex === 'w')
            url += `&sex=1`;

        url += `&access_token=${token}&v=5.103`;
        url = encodeURI(url);
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser},
        });

        if ((!result.data) || (!result.data.response))
            return false;

        for (let result of result.data.response.items) {
            //console.log(`ищу  ${friend.user_id} = ${result.id}`)
            if (friend.user_id !== result.id) continue;

            console.log(`ура, есть такой ${friend.user_id} = ${result.id}`)
            return 1 //добавить в друзья

        }

        return 0 //перевести в подписчики
    }

    //==================================================================================================================
    static async birthday () {

        let date = new Date();
        date.setUTCHours(date.getUTCHours()+7) // часовой пояс нужно вставить из профиля
        let hour = date.getUTCHours(); //текущий час
        let day = date.getUTCDate();
        let month = date.getUTCMonth()+1;

        date = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;

        //загрузка аккаунтов из базы
        let arAccounts = await modelsAccount.getBirthday(hour, date, 1000); //установлен лимит
        if (!arAccounts.length) //если нет /выход
            return false;

        //перебор аккаунтов
        for (let account of arAccounts) {

            //нет токена - пропускаем
            if (!account.soc_token) continue;
            //ошибка аккаунта - пропускаем
            if (account.soc_error_code) continue;

            if (!account.birthday_sentence) continue; //нет фраз для поздравлений
            account.birthday_sentence = JSON.parse(account.birthday_sentence) //парсим в массив

            let arFriends = await vk.friends_get(account.soc_token, account.browser, account.soc_user_id);
            if ((!arFriends) || (!arFriends.length)) //нет друзей у чела
                continue

            for (let friend of arFriends) {
                if (!friend.bdate) continue //нет даты, пропускаем
                //console.log(friend.bdate)
                let bdate = friend.bdate.split('.')
                if (bdate.length < 2) continue //нет ни даты не месяца, пропускаем

                //дату VK переводим в цифру
                bdate[0] = Number(bdate[0])
                bdate[1] = Number(bdate[1])

                //день и месяц совпадают
                if ((day !== bdate[0]) || (month !== bdate[1])) continue //день или месяц не совпадает

                console.log(friend)

                await vk.friends_send(account.soc_token, account.browser, friend.id, account.birthday_sentence[getRandomIntInclusive(0, account.birthday_sentence.length-1)]);

                //await vk.friends_send(account.soc_token, account.browser, friend.user_id, account.friends_message_subscriber);


            }

            await modelsControlRepeatDay.addBirthday(account.id, date); //установлен лимит
        }


        /*
        let date = new Date();
        date = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;

        let arAccounts = await this.get(user_id, date);
        if (arAccounts.length)
            return false;

        await modelsAccount.resetData();

        await this.add(date);*/
    }

    static async friends_get (token, browser, account_id) {
        let count = 5000; //добавить пользователей за раз
        let url = `https://api.vk.com/method/friends.get?user_id=${account_id}&count=${count}&fields=bdate&access_token=${token}&v=5.103`;
        console.log(url)

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        if ((result.data) && (result.data.response) && (result.data.response.items) && (result.data.response.items.length))
            return result.data.response.items;

        return false;

    }
}

//быстрый поиск элемента в массиве
function contains(elem, arr) {
    //если в базе ничего нет
    if (arr === null) return false;

    //из базы выгружается в строке
    return arr.indexOf(String (elem)) !== -1;
}

//обработка поиска стоп слова
function stopWord (post, arStopWord) {

    if ((arStopWord === null) ||  (arStopWord.length === 0))
        return false;

    //уменьшение регистра
    post = post.toLowerCase();

    //обработка
    for (let word of arStopWord) {
        if (post.indexOf(word) !== -1)
            return true
    }

    return false
}


/*
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
    //проверка на возможность поставить лайк
    static async likes_add (token, browser, arObject) {

        if ((!arObject.likes.user_likes) && (arObject.likes.can_like)) {
            console.log( 'Лайк не ставил - поставить могу' );

            let url = `https://api.vk.com/method/likes.add?type=${arObject.type}&owner_id=${arObject.source_id}&item_id=${arObject.post_id}&access_token=${token}&v=5.103`;

            //запрос новостей
            let result = await axios({
                method: 'get',
                url: url,
                headers: {'User-Agent': browser}
            });

            console.log( result.data ); // server response
        }
    }
    //------------------------------------------------------------------------------------------------------------------
    //загрузка новостей из ВК
    static async newsfeed_get (token, browser, account) {
        console.log(`загрузка новостей - ${account}`);

        //количество постов
        let count = 10;

        //формируем настройки в строку для запроса
        let sourceIds = vk.VkNewsfeedGetSourceIds(account); //формирование источника
        let filters = vk.VkNewsfeedGetFilters(account); //формирование фильтра

        //запрос
        let url = `https://api.vk.com/method/newsfeed.get?source_ids=${sourceIds}&filters=${filters}&count=${count}&access_token=${token}&v=5.103`;
        console.log(url);

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        //результат запроса
        console.log(result.data);

        //найдены посты
        if ((result.data.response) && (result.data.response.items.length))
            return result.data.response;

        //сохраняем ошибку запроса
        if (result.data.error)
            await modelsAccount.setErr(account.id, result.data.error.error_code);

        return false;
    }



    //формирование источника
    static VkNewsfeedGetSourceIds (account) {
        //формирование массива
        let arr = [];

        if (account.likes_source_ids_friends)
            arr[arr.length] = `friends`;
        if (account.likes_source_ids_groups)
            arr[arr.length] = `groups`;
        if (account.likes_source_ids_pages)
            arr[arr.length] = `pages`;
        if (account.likes_source_ids_following)
            arr[arr.length] = `following`;

        //нет параметров
        if (!arr.length)
            return false;

        //ответ для запроса
        return arr.join(',');
    }

    //формирование фильтра
    static VkNewsfeedGetFilters (account) {
        //формирование массива
        let arr = [];

        if ((account.likes_filters_post) || (account.likes_repost))
            arr[arr.length] = `post`;
        if (account.likes_filters_photo)
            arr[arr.length] = `photo`;

        //нет параметров
        if (!arr.length)
            return false;

        //ответ для запроса
        return arr.join(',');
    }

    //------------------------------------------------------------------------------------------------------------------
    //НОВОСТИ - РЕКОМЕНДАЦИИ

    //загрузка новостей из ВК
    static async newsfeed_getRecommended (token, browser, account) {
        console.log(`загрузка новостей - рекомендации ${account}`);

        //количество постов
        let count = 10;

        //запрос
        let url = `https://api.vk.com/method/newsfeed.getRecommended?count=${count}&access_token=${token}&v=5.103`;
        console.log(url);

        //запрос новостей
        let result = await axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': browser}
        });

        //результат запроса
        console.log(result.data);

        //найдены посты
        if ((result.data.response) && (result.data.response.items.length))
            return result.data.response;

        //сохраняем ошибку запроса
        if (result.data.error)
            await modelsAccount.setErr(account.id, result.data.error.error_code);

        return false;
    }



}

//быстрый поиск элемента в массиве
function contains(elem, arr) {
    //если в базе ничего нет
    if (arr === null) return false;

    //из базы выгружается в строке
    return arr.indexOf(String (elem)) !== -1;
}

//обработка поиска стоп слова
function stopWord (post, arStopWord) {

    if ((arStopWord === null) ||  (arStopWord.length === 0))
        return false;

    //уменьшение регистра
    post = post.toLowerCase();

    //обработка
    for (let word of arStopWord) {
        if (post.indexOf(word) !== -1)
            return true
    }

    return false
}
*/

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}