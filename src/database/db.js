import { Pool } from 'pg';

export default class {

    static creating ( conf ) {
        let pools;
        try {
            pools = {
                system: new Pool(conf.pools.system)
            };
            return pools;
        } catch (err) {
            throw ({err: 101, msg: 'pool create'});
        }
    }

    static async query ( pool, sql, value = null ) {
        try {
            let result = await pool.query( sql, value );
            return result.rows;
        } catch (err) {
            if (!err.err) console.log(err);
            throw ({err: 110, msg: 'Ошибка выполнения запроса'});
        }
    }

    static async insert ( pool, tableName, arData, arReturn = null ) {
        try {
            //обнуление и типизация
            let field = []; //названия полей
            let fieldValue = []; //шаблон
            let value = []; //значаения полей
            let i = 1; //первое значение

            //из массива в sql строку
            if (typeof arReturn === "array")
                arReturn = arReturn.join(',');

            //из ассоциативного массива по массивам
            for(let key in arData){
                field.push(key);
                fieldValue.push(`$${i}`);
                value.push(arData[key]);
                i++;
            }

            //в стоку для SQL
            field = field.join(',');
            fieldValue = fieldValue.join(',');

            //шаблон
            let sql = `INSERT INTO ${tableName} (${field}) VALUES (${fieldValue})`;
            if (arReturn)
                sql += ` RETURNING ${arReturn}`;

            //выполнение
            let result = await pool.query(sql, value);
            return result.rows;

        } catch (err) {
            if (!err.err) console.log(err);
            throw ({err: 120, msg: 'Ошибка выполнения запроса'});
        }
    }

    static async update (pool, tableName, arData, arWhere = null, arReturn = null ) {
        try {
            let field = []; //названия полей
            let where = []; //названия полей
            let number = []; //номера
            let value = []; //значаения полей
            let i = 1; //первое значение

            //из массива в sql строку
            if (typeof arReturn === "array")
                arReturn = arReturn.join(',');

            //из ассоциативного массива по массивам
            for(let key in arData){
                field.push(`${key}=$${i}`);
                number.push(`$${i}`);
                value.push(arData[key]);
                i++;
            }

            //из ассоциативного массива по массивам
            for(let key in arWhere){
                where.push(`${key}=$${i}`);
                number.push(`$${i}`);
                value.push(arWhere[key]);
                i++;
            }

            //в стоку для SQL
            field = field.join(', ');
            where = where.join(' AND ');
            number = number.join(',');

            //шаблон
            let sql = `UPDATE ${tableName} SET ${field}  `;

            if (arWhere)
                sql += ` WHERE ${where}`;

            if (arReturn)
                sql += ` RETURNING ${arReturn}`;

            //выполнение
            let result = await pool.query( sql, value );
            return result.rows;
        } catch (err) {
            if (!err.err) console.log(err);
            throw ({err: 130, msg: 'Ошибка выполнения запроса'});
        }
    }

}