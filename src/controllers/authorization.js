import db from '../database/db';

export default async function (ctx, next) {

    console.log("Проверяю авторизацию");
    console.log(ctx.path);

    const privileges = {
        '/api/auth/login': {auth: 0},
        '/api/account/add': {auth: 1},
        '/api/account/get': {auth: 1},
        '/api/account/delete': {auth: 1},
        '/api/profile/getUser': {auth: 1},
        '/api/profile/reg': {auth: 0},
        '/api/profile/regActivate': {auth: 0},
        '/api/profile/oauthVK': {auth: 0},
        '/api/profile/reset': {auth: 0},
        '/api/profile/resetActivate': {auth: 0},
        '/api/profile/setPassword': {auth: 1},
        '/api/profile/setPhone': {auth: 1},
        '/api/like/edit': {auth: 1},
        '/api/friend/edit': {auth: 1},
        '/api/friend/editBirthday': {auth: 1},


        '/api/pay/add': {auth: 1},
        '/api/pay/hook': {auth: 0},
        '/api/pay/get': {auth: 1},
        '/api/pay/history': {auth: 1},
        '/api/pay/transacts': {auth: 1},
        '/api/pay/prepaid': {auth: 1}
    };

    if ((!privileges[ctx.path]) || (!privileges[ctx.path].auth)) {
        return next();
    }

    if ((!ctx.cookie) || ((!ctx.cookie.tid) || (!ctx.cookie.token))) {
        //ctx.response.status = 401;
        ctx.body = {err: 401};
        return;
    }

    //let user = await dbFunctions.query(db.system, `SELECT * FROM users`);
    let token = await db.query(db.pools.system, `SELECT * FROM tokens WHERE id=$1`, [ctx.cookie.tid]);

    if ((!token.length) || (token[0].token_key !== ctx.cookie.token)) {
        //ctx.response.status = 401;
        ctx.body = {err: 401};
        return;
    }

    ctx.auth = {
        user_id: token[0].user_id
    };

    return next();

}
