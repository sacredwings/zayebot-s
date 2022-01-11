// класс для биллинга купленных модулей
import db from "../database/db";
import modelsModule from '../models/module';
import modelsPay from '../models/pay';

// TODO: Получение списка модулей из БД
const modules_name = {
	1: ['likes', 1],
	2: ['likes_vk_post', 3],
	3: ['likes_vk_friend', 3],
	4: ['likes_search', 3],
	5: ['friends', 3],
	6: ['birthday', 3]
};

// Список номеров модулей
const modules = Object.keys(modules_name).map(x => x);

// Размер пачки для прохода за один раз
const batch = 500;

// Условия для выборки: включенные модули и оплачены больше суток назад
// На выходе список аккаунтов. У каждого аккаунта может быть включено больше одного модуля
let conditions = [];
for (let key in modules_name) {
	conditions.push(`(` + modules_name[key][0] + `_allowed=true AND ((` + modules_name[key][0] + `_last < NOW() - INTERVAL '1 DAY') OR ` + modules_name[key][0] + `_last IS NULL))`);
}

// Список полей, указывающих на необходимость взимания платы
const field_list = Object.keys(modules_name).map(x => '((' + modules_name[x][0] + `_last < NOW() - INTERVAL '1 DAY') OR ` + modules_name[x][0] + `_last IS NULL) AND ` + modules_name[x][0] + `_allowed AS ` + modules_name[x][0]);

const query = `SELECT user_id,account_id,` + field_list.join(',') + ` FROM bill WHERE ` + conditions.join(' OR ') + ` LIMIT ` + batch;

// Признак активности модуля
let billing_working = false;

export default class bill {
	static async loop () {
		try {
			// Если процесс еще работает, то отбой запуска по расписанию
			if (billing_working) return;
			billing_working = true;

			while (true) {
				// Получить список включенных модулей с датой продления старше чем сутки
				let rows = await db.query(db.pools.system, query);

				if (rows) {
					// Заглушка для пустого списка
					if (rows.length == 0) {
						billing_working = false;
						return;
					}

					for (let i in rows) {
						let row = rows[i];
						let modules_cost = 0;

						// Составляем список модулей для продления и суммарную стоимость
						let modules_prolongate = [];
						for (let f in modules) {
							let fieldName = modules[f];
							if (row[modules_name[fieldName][0]]) {
								modules_prolongate.push(fieldName);
								modules_cost += modules_name[fieldName][1];
							}
						}

						// Загрузить состояние кошелька
						// TODO: Получение состояний кошельков группы записей
						let wallet = await modelsPay.getWallet(row.user_id);
						if (wallet && wallet.active) {
							if (wallet.amount >= modules_cost) {
								// Добавить записи оплаты
								await modelsModule.buyModules(row.user_id, row.account_id, modules_prolongate);
							} else {
								// Не хватило денег на счету, отключаем все модули
								await modelsModule.disableModules(row.user_id);
							}
						}
					}
				} else {
					// Возникла ошибка, отбой обработки
					billing_working = false;
					return;
				}
			}
		} catch (err) {
			billing_working = false;
			throw ({err: 200000200, msg: 'Биллинг оплаты модулей'});
		}
	}
}
