import modelsPay from '../models/pay';
import modelsModule from "../models/module";
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const QIWI_SECRET_KEY = 'eyJ2ZXJzaW9uIjoiUDJQIiwiZGF0YSI6eyJwYXlpbl9tZXJjaGFudF9zaXRlX3VpZCI6InNpdmhnNC0wMCIsInVzZXJfaWQiOiI3OTIzMTE0NDExMCIsInNlY3JldCI6ImJlNDdlOTg3MDY4MzUxMDYxNjhjNzI5OWEwYTc5MjU2YjZmNTZhMzg3MDc1MDZmMmViN2VjNGQzNWUxMTk3ODkifX0='
const qiwiApi = new QiwiBillPaymentsAPI(QIWI_SECRET_KEY);

export default class {

    static async add (value) {
        try {
            let price = 1;
            let comment = 'Оплата минимального пакета сервиса - ZayeBot';
            if (value.tariff === 2) {
                price = 2;
                comment = 'Оплата максимального пакета сервиса - ZayeBot';
            }

            let newToday = new Date();
            //newToday.setMinutes(newToday.getMinutes() + 5);
            newToday.setDate(newToday.getDate() + 30);

            let newTodayQIWI = newToday.toISOString();
            //let newTodaySQL = newToday.toISOString().slice(0, 19).replace('T', ' '); //

            //let today = new Date(),
                //newToday = new Date();
            //newToday.setMinutes(today.getMinutes()+30);

            let arBilledPayment = await modelsPay.getByAccount(value.account_id, value.tariff, value.month);
            if (arBilledPayment.length === 0) {

                let billedPayment = await modelsPay.addByAccount(value.account_id, price, value.tariff, value.month);
                const billId = billedPayment.id;

                const fields = {
                    amount: price,
                    currency: 'RUB',
                    comment: comment,
                    account: `${value.account_id}`,
                    expirationDateTime: newTodayQIWI
                };

                let qiwqResult = await qiwiApi.createBill( billId, fields );

                let creationDateTime = new Date(qiwqResult.creationDateTime);
                let expirationDateTime = new Date(qiwqResult.expirationDateTime);
                creationDateTime = creationDateTime.toISOString().slice(0, 19).replace('T', ' ');
                expirationDateTime = expirationDateTime.toISOString().slice(0, 19).replace('T', ' ');

                //добавляем запись
                await modelsPay.editByAccount(billId, qiwqResult.payUrl, qiwqResult.status.value, creationDateTime, expirationDateTime);

                return qiwqResult.payUrl;
            }

            return arBilledPayment[0].pay_url;

        } catch (err) {
            throw ({...{err: 200020000, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async prepaid (value) {
        try {
            let comment = 'Пополнение счёта сервиса ZayeBot';

            let newToday = new Date();
            newToday.setDate(newToday.getDate() + 30);

            let newTodayQIWI = newToday.toISOString();

            let arBilledPayment = await modelsPay.getByUser(value.user_id, value.sum);
            if (arBilledPayment.length === 0) {
                let billedPayment = await modelsPay.addByUser(value.user_id, value.sum);
                const billId = billedPayment.id;

                const fields = {
                    amount: value.sum,
                    currency: 'RUB',
                    comment: comment,
                    customFields: {
                        account: `${value.user_id}`
                    },
                    expirationDateTime: newTodayQIWI
                };

                let qiwiResult = await qiwiApi.createBill( billId, fields );

                let creationDateTime = new Date(qiwiResult.creationDateTime);
                let expirationDateTime = new Date(qiwiResult.expirationDateTime);
                creationDateTime = creationDateTime.toISOString().slice(0, 19).replace('T', ' ');
                expirationDateTime = expirationDateTime.toISOString().slice(0, 19).replace('T', ' ');

                //добавляем запись
                await modelsPay.editByUser(billId, qiwiResult.payUrl, qiwiResult.status.value, creationDateTime, expirationDateTime);

                return qiwiResult.payUrl;
            }

            return arBilledPayment[0].pay_url;
        } catch (err) {
            throw ({...{err: 200020000, msg: 'Загрузка аккаунтов'}, ...err});
        }
    }

    static async acceptPayment (signature, fields) {
        try {
            let bill = fields.bill;
            let payment = fields['payment/refund/capture'];

            if (!(bill || payment))
                return false;

            let correct = qiwiApi.checkNotificationSignature(signature, fields, QIWI_SECRET_KEY);
            if (!correct)
                return false;

            if (bill) {
                let arBilledPayment = await modelsPay.getByUser(bill.customFields.account, bill.amount);
                if (arBilledPayment.length === 0)
                    return false;

                // Пополнить внутренний счёт
                if (bill.status.value === 'PAID') {
                    await modelsPay.editTransactStatus(bill.billId, bill.status.value, bill.status.changedDateTime);
                    await modelsPay.updateWallet(bill.customFields.account, bill.amount);
                }
            }

            if (payment) {
                if (payment.status.value === 'SUCCESS') {
                    if (payment.type === 'PAYMENT') {
                        await modelsPay.addTransactionFull(payment.customFields.account, payment.billId, payment.amount, payment.status.createdDateTime);
                        await modelsPay.updateWallet(payment.customFields.account, payment.amount);
                    }
                }
            }

            return true;
        } catch (err) {
            throw ({...{err: 200020000, msg: 'Прием платежей'}, ...err});
        }
    }

    static async getWallet (user_id) {
        try {
            let result = {};

            let wallet = await modelsPay.getWallet(user_id);

            if (wallet) {
                result.wallet = wallet.amount;
                if (!wallet.active)
                    result.inactive = true;
            }

            return result;
        } catch (err) {
            throw ({...{err: 200020000, msg: 'Состояние кошелька'}, ...err});
        }
    }

    static async getTransactions (user_id) {
        try {
            let result = await modelsModule.getTransactions(user_id);

            return result;
        } catch (err) {
            throw ({...{err: 200020000, msg: 'Загрузка списка оплат'}, ...err});
        }
    }

    static async getIncoming (user_id) {
        try {
            let result = await modelsPay.getIncoming(user_id);

            return result;
        } catch (err) {
            throw ({...{err: 200020000, msg: 'Загрузка списка пополнений'}, ...err});
        }
    }
}