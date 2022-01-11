import Koa from 'koa'
import bodyParser from 'koa-bodyparser';
import cookie from 'koa-cookie';
import cors from '@koa/cors';

//подключение базы
import dbConf from './database/dbConf';
import db from './database/db';
db.pools = db.creating(dbConf);

//фоновое выполнение заданий
import processes from "./system/processes";
processes.vk();

//api
import routers from "./routers";
const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(cookie());
app.use(routers.routes());

//запуск сервера
app.listen(3021);