import modelsPay from '../models/pay';
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const qiwiApi = new QiwiBillPaymentsAPI('eyJ2ZXJzaW9uIjoiUDJQIiwiZGF0YSI6eyJwYXlpbl9tZXJjaGFudF9zaXRlX3VpZCI6InNpdmhnNC0wMCIsInVzZXJfaWQiOiI3OTIzMTE0NDExMCIsInNlY3JldCI6ImJlNDdlOTg3MDY4MzUxMDYxNjhjNzI5OWEwYTc5MjU2YjZmNTZhMzg3MDc1MDZmMmViN2VjNGQzNWUxMTk3ODkifX0=');

//класс для работы с аккаунтами ВК
export default class pay {
    static async status () {
        let arPay = await modelsPay.getByUserWaiting();
        if (!arPay.length)
            return false;

        //работа с аккаунтами
        for (let pay of arPay) {
            let bill = await qiwiApi.getBillInfo(pay.id);

            //ничего не изменилось
            if (bill.status.value === 'WAITING')
                continue;

            if (bill.status.value === 'EXPIRED') {
                await modelsPay.editTransactStatus (pay.id, 'EXPIRED');
            }

            if (bill.status.value === 'PAID') {
                await modelsPay.editTransactStatus (pay.id, 'PAID', bill.status.changedDateTime);

                // Пополнить внутренний счёт
                await modelsPay.updateWallet(pay.user_id, pay.amount);
            }
        }

        return true;
    }
}
