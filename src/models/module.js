import db from "../database/db";
import modelsPay from './pay';

const modules_name = {
	1: ['likes', 1],
	2: ['likes_vk_post', 3],
	3: ['likes_vk_friend', 3],
	4: ['likes_search', 3],
	5: ['friends', 3],
	6: ['birthday', 3]
};

export default class {
	static getModuleFields() {
		return Object.keys(modules_name).map(x => modules_name[x][0] + '_allowed');
	}

	static async getState (user_id, account_id, modules) {
		try {
			let fields = modules.map((item, index) => modules_name[item][0] + '_allowed');

			let query = `SELECT ` + fields.join(',') + ` FROM bill WHERE user_id=$1 AND account_id=$2`;

			let rows = await db.query(db.pools.system, query, [user_id, account_id]);

			if (rows) {
				let row = rows[0];

				let res_fields = {};
				for (let f in modules) {
					let fieldName = fields[f];
					res_fields[modules[f]] = row[fieldName];
				}

				return res_fields;
			} else
				throw ({err: 200000200, msg: 'Аккаунт не найден'});
		} catch (err) {
			throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
		}
	}

	static async buyModules (user_id, account_id, modules) {
		try {
			await db.query(db.pools.system, 'BEGIN');

			let total = 0;

			for (let i in modules) {
				let data = {
					user_id: user_id,
					account_id: account_id,
					module_id: modules[i],
					amount: modules_name[modules[i]][1]
				};

				let result = await db.insert(db.pools.system, `transact_intern`, data, ['id']);
				if (!result) {
					await db.query(db.pools.system, 'ROLLBACK');
					throw ({err: 200000200, msg: 'Покупка модулей'});
				}

				total += data.amount;
			}

			// Отметить дату последней оплаты
			let data = {};
			for (let i in modules)
				data[modules_name[modules[i]][0] + '_last'] = 'NOW()';

			let result = await db.update(db.pools.system, `bill`, data, {account_id: account_id}, 'id');
			if (!result) {
				await db.query(db.pools.system, 'ROLLBACK');
				throw ({err: 200000201, msg: 'Покупка модулей'});
			}

			// Списать со счёта
			result = await modelsPay.updateWallet(user_id, -total);

			if (!result) {
				await db.query(db.pools.system, 'ROLLBACK');
				throw ({err: 200000200, msg: 'Покупка модулей'});
			}

			await db.query(db.pools.system, 'COMMIT');
		} catch (err) {
			throw ({...{err: 200000200, msg: 'Покупка модулей'}, ...err});
		}
	}

	// Подсчитать стоимость модулей
	static getCost (modules) {
		return modules.reduce((accum, item) => accum + modules_name[item][1], 0);
	}

	// Проверка состояния и покупка модулей
	static async checkBuyModules(user_id, account_id, modules) {
		if (modules.length > 0) {
			// Получение состояний модулей
			let module_states = await this.getState(
				user_id,
				account_id,
				modules
			);

			// Составляем список модулей для активации
			let modules_want_enable = modules.filter(x => !module_states[x]);

			if (modules_want_enable.length > 0) {
				// Узнать о последнем платеже
				let module_payments = await this.getNotPaid(account_id, modules_want_enable);

				// Требуется включить, поскольку не оплачены
				let modules_need_enable = modules_want_enable.filter(x => module_payments.includes(x));

				// Сколько стоит включение?
				let modules_cost = this.getCost(modules_need_enable);

				// Если нужна активация
				if (modules_cost > 0) {
					let wallet = await modelsPay.getWallet(user_id);
					if (wallet) {
						if (wallet.active) {
							if (wallet.amount < modules_cost)
								throw ({err: 200010000, msg: 'Недостаточно средств для включения всех модулей'});

							// Добавить записи оплаты
							await this.buyModules(user_id, account_id, modules_need_enable);
						} else
							throw ({err: 200010000, msg: 'Кошелёк заблокирован'});
					} else {
						throw ({err: 200010000, msg: 'Нет кошелька'});
					}
				}
			}
		}
	}

	// Список неоплаченных модулей
	// С момента покупки прошло больше суток
	static async getNotPaid(account_id, modules) {
		try {
			// (оплачено давно или никогда) И (модуль_включен)
			const field_list = Object.keys(modules_name).map(x => '((' + modules_name[x][0] + `_last < NOW() - INTERVAL '1 DAY') OR ` +
				modules_name[x][0] + `_last IS NULL) AS ` + modules_name[x][0]);

			const query = `SELECT id,user_id,` + field_list.join(',') + ` FROM bill WHERE account_id=$1`;

			let rows = await db.query(db.pools.system, query, [account_id]);

			let res_fields = [];
			if (rows)
				for (let i in rows)
					for (let f in modules) {
						let fieldName = modules[f];
						if (rows[i][modules_name[fieldName][0]])
							res_fields.push(fieldName);
					}

			return res_fields;
		} catch (err) {
			throw ({...{err: 200000200, msg: 'Оплаченные модули'}, ...err});
		}
	}

	static async disableModules (user_id) {
		try {
			// Отметить дату последней оплаты
			let data = {};
			let names = Object.keys(modules_name);

			for (let key in names)
				data[modules_name[names[key]][0] + '_allowed'] = false;

			let result = await db.update(db.pools.system, `bill`, data, {user_id: user_id}, 'id');

			if (result)
				return result[0];
		} catch (err) {
			throw ({...{err: 200000203, msg: 'Отключение модулей'}, ...err});
		}
	}

	static async getTransactions (user_id) {
		try {
			let query = `SELECT
	t.amount,TO_CHAR(t.create_date, 'DD.MM.YYYY HH24:MI') AS create_date,
	m.name AS module,
	a.soc_user_id,CONCAT(a.first_name, ' ', a.last_name) AS name
FROM transact_intern AS t
LEFT JOIN accounts AS a ON a.id=t.account_id
LEFT JOIN modules AS m ON m.id=t.module_id
WHERE t.user_id=$1
ORDER BY t.create_date DESC
LIMIT 100`;

			return await db.query(db.pools.system, query, [user_id]);
		} catch (err) {
			throw ({...{err: 200000203, msg: 'Список транзакций'}, ...err});
		}
	}
}
