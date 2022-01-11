import vk from './vk';
import pay from './pay';
import bill from './bill';
import reset_day from './reset_day';

export default class {
    static vk () {

        let sec = 1000;
        let min = 60*1000;
        let hour = 60*60*1000;

        //лайки друзей
        setTimeout(async () => {
            await vk.likes()
            setInterval(() => vk.likes(), hour*2)
        }, sec*3);

        //добавления в друзья
        setTimeout(async () => {
            await vk.friends()
            setInterval(() => vk.friends(), hour*2);
        }, min*30);


        //поздравления с днем рождения
        setTimeout(async () => {
            await vk.birthday()
            setInterval(() => vk.birthday(), hour);
        }, min*60);

        //--------------------------------------------------------------------------------------------------------------
        setTimeout(() => pay.status(), 300000);

        setTimeout(() => bill.loop(), 3000);
        setInterval(() => bill.loop(), 300000);

        //сброс лайков и друзей /проверка каждый час
        setTimeout(() => reset_day.status(), 3000);
        setInterval(() => reset_day.status(), hour);
    }
}