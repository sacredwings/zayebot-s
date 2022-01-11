import db from "../database/db";

export default class {

    //Получение аккаунтов
    static async getByAccount (account_id, tariff, month) {
        try {
            let query = `SELECT * FROM qiwi_billed_payment WHERE account_id=$1 AND tariff=$2 AND month=$3 AND status=$4 LIMIT 1`;
            return await db.query(db.pools.system, query, [account_id, tariff, month, 'WAITING']);

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    //Поиск не оплаченых счетов - в ОЖИДАНИИ
    static async getByAccountWaiting (account_id, price) {
        try {
            let query = `SELECT * FROM qiwi_billed_payment WHERE status=$1`;
            return await db.query(db.pools.system, query, ['WAITING']);

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка счетов WAITING'}, ...err});
        }
    }

    //Поиск не оплаченых счетов - в ОЖИДАНИИ
    static async editQiwiStatus (id, status, paid_date = null) {
        try {
            let data = {
                status: status,
                paid_date: paid_date
            };

            let arWhere = {
                id: id
            };

            let result = await db.update(db.pools.system, `qiwi_billed_payment`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Изменение статуса у счета'}, ...err});
        }
    }

    //Получение аккаунтов
    static async addByAccount (account_id, price, tariff, month) {
        try {
            let data = {
                account_id: account_id,
                price: price,
                tariff: tariff,
                month: month
            };

            let result = await db.insert(db.pools.system, `qiwi_billed_payment`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }
    static async editByAccount (id, pay_url, status, creation_date_time, expiration_date_time) {
        try {
            let data = {
                pay_url: pay_url,
                status: status,
                creation_date_time: creation_date_time,
                expiration_date_time: expiration_date_time
            };

            let arWhere = {
                id: id
            };

            let result = await db.update(db.pools.system, `qiwi_billed_payment`,  data, arWhere, 'id');
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    //Последняя дата оплаты аккаунта
    static async getLastPaymentDate (account_id) {
        try {
            try {
                let query = `SELECT * FROM pay WHERE account_id=$1 AND paid_to_date>NOW() ORDER BY paid_to_date DESC`;
                return await db.query(db.pools.system, query, [account_id]);

            } catch (err) {
                throw ({...{err: 200000200, msg: 'Загрузка счетов WAITING'}, ...err});
            }

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Сохраняю транзакцию'}, ...err});
        }
    }
    //Оплата аккаунта
    static async setPayment (account_id, bill_id, tariff, paid_to_date) {
        try {
            let data = {
                account_id: account_id,
                bill_id: bill_id,
                tariff: tariff,
                paid_to_date: paid_to_date
            };

            let result = await db.insert(db.pools.system, `pay`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Сохраняю транзакцию'}, ...err});
        }
    }

    /* Платежи */

    // Последняя неоплаченная транзакция с указанной суммой
    static async getByUser (user_id, sum) {
        try {
            let query = `SELECT * FROM transact_income WHERE user_id=$1 AND amount=$2 AND status=$3 LIMIT 1`;
            return await db.query(db.pools.system, query, [user_id, sum, 'WAITING']);

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    // Добавление исполненной транзакции
    static async addTransaction (user_id, billId, amount, createdDate) {
        try {
            let data = {
                user_id: user_id,
                bill: billId,
                amount: amount,
                paid_date: createdDate,
                creation_date_time: createdDate,
                expiration_date_time: createdDate,
                create_date: createdDate,
                pay_url: '',
                status: 'PAID'
            };

            await db.insert(db.pools.system, `transact_income`, data);

            return true;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Сохраняю транзакцию'}, ...err});
        }
    }

    static async addByUser (user_id, sum) {
        try {
            let data = {
                user_id: user_id,
                amount: sum
            };

            let result = await db.insert(db.pools.system, `transact_income`, data, `id`);
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async editByUser (id, pay_url, status, creation_date_time, expiration_date_time) {
        try {
            let data = {
                pay_url: pay_url,
                status: status,
                creation_date_time: creation_date_time,
                expiration_date_time: expiration_date_time
            };

            let arWhere = {
                id: id
            };

            let result = await db.update(db.pools.system, `transact_income`, data, arWhere, 'id');
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    //Поиск не оплаченых счетов - в ОЖИДАНИИ
    static async getByUserWaiting () {
        try {
            let query = `SELECT * FROM transact_income WHERE status=$1`;
            return await db.query(db.pools.system, query, ['WAITING']);

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Загрузка счетов WAITING'}, ...err});
        }
    }

    // Изменение транзакции
    static async editTransactStatus (id, status, paid_date = null) {
        try {
            let data = {
                bill: id,
                status: status,
                paid_date: paid_date
            };

            let arWhere = {
                id: id
            };

            let result = await db.update(db.pools.system, `transact_income`, data, arWhere, 'id');
            if (result)
                return result[0];

            return false;

        } catch (err) {
            throw ({...{err: 200000200, msg: 'Изменение статуса у счета'}, ...err});
        }
    }

    // Добавление кошелька
    static async addWallet (user_id) {
        try {
            let data = {
                user_id: user_id,
                amount: 0
            };

            let result = await db.insert(db.pools.system, `wallet`, data, `user_id`);
            if (result)
                return result[0];
        } catch (err) {
            throw ({...{err: 200000200, msg: 'Добавление кошелька'}, ...err});
        }
    }

    // Получить значение кошелька
    static async getWallet (user_id) {
        try {
            let query = `SELECT * FROM wallet WHERE user_id=$1`;

            let result = await db.query(db.pools.system, query, [user_id]);

            if (result)
                return result[0];
        } catch (err) {
            throw ({...{err: 200000200, msg: 'Получение кошелька'}, ...err});
        }
    }

    // Обновление кошелька
    static async updateWallet (user_id, amount) {
        try {
            let query = `UPDATE wallet SET amount=amount+$1 WHERE user_id=$2`;
            await db.query(db.pools.system, query, [amount, user_id]);

            return true;
        } catch (err) {
            throw ({...{err: 200000200, msg: 'Изменение счёта кошелька'}, ...err});
        }
    }

    static async getIncoming (user_id) {
        try {
            let query = `SELECT t.amount,t.status,
    TO_CHAR(t.create_date, 'DD.MM.YYYY HH24:MI') AS create_date,
    TO_CHAR(t.paid_date, 'DD.MM.YYYY HH24:MI') AS paid_date,
    (CASE WHEN t.status='WAITING' THEN t.pay_url ELSE '' END) AS pay_url
FROM transact_income AS t
WHERE t.user_id=$1
ORDER BY t.create_date DESC
LIMIT 100`;

            return await db.query(db.pools.system, query, [user_id]);
        } catch (err) {
            console.log('ERR', err);
            throw ({...{err: 200000203, msg: 'Список транзакций'}, ...err});
        }
    }
}