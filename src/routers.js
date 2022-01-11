import Router from 'koa-router'

//классы api
import authorization from './controllers/authorization'
import classAuth from './routers/auth'
import classAccount from './routers/account'
import classProfile from './routers/profile'
import classLike from './routers/like'
import classFriend from './routers/friend'
import classPay from './routers/pay'

//МАРШРУТЫ
const routerAuth = new Router({prefix: '/auth'});
routerAuth.post('/login', classAuth.login);

const routerAccount = new Router({prefix: '/account'});
routerAccount.post('/add', classAccount.add);
routerAccount.post('/get', classAccount.get);
routerAccount.post('/delete', classAccount.delete);

const routerProfile = new Router({prefix: '/profile'});
routerProfile.post('/getUser', classProfile.getUser);
routerProfile.post('/reg', classProfile.reg);
routerProfile.post('/oauthVK', classProfile.oauthVK);
routerProfile.post('/regActivate', classProfile.regActivate);
routerProfile.post('/reset', classProfile.reset);
routerProfile.post('/resetActivate', classProfile.resetActivate);
routerProfile.post('/setPassword', classProfile.setPassword);
routerProfile.post('/setPhone', classProfile.setPhone);

const routerLike = new Router({prefix: '/like'});
routerLike.post('/edit', classLike.edit);

const routerFriend = new Router({prefix: '/friend'});
routerFriend.post('/edit', classFriend.edit);
routerFriend.post('/editBirthday', classFriend.editBirthday);


const routerPay = new Router({prefix: '/pay'});
routerPay.post('/get', classPay.getWallet);
routerPay.get('/transacts', classPay.transacts);
routerPay.get('/history', classPay.history);
routerPay.post('/prepaid', classPay.prepaid);
routerPay.post('/add', classPay.add);
routerPay.post('/hook', classPay.hook);

//объединеный, общий маршрут
const router = new Router();
router.use(authorization); //авторизацуия
router.use(
    '/api',
    routerAuth.routes(),
    routerAccount.routes(),
    routerProfile.routes(),
    routerLike.routes(),
    routerFriend.routes(),
    routerPay.routes()
);
export default router;