/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from './AppError';
import { Connection, createConnection, getConnectionManager } from 'typeorm';
import ApprovalManaged from '../repositories/postgres/ApprovalManaged';
import Notification from '../repositories/postgres/Notification';
import NotificationDestination from '../repositories/postgres/NotificationDestination';
import ReadFlagManagement from '../repositories/postgres/ReadFlagManagement';
import Config from './Config';
/* eslint-enable */

const config = Config.ReadConfig('./config/ormconfig.json');

// エンティティを設定
config['entities'] = [
    ApprovalManaged,
    Notification,
    NotificationDestination,
    ReadFlagManagement
];

/**
 * コネクションの生成
 */
export async function connectDatabase (): Promise<Connection> {
    let connection = null;
    try {
        // データベースに接続
        connection = await createConnection(config);
    } catch (err) {
        if (err.name === 'AlreadyHasActiveConnectionError') {
            // すでにコネクションが張られている場合には、流用する
            connection = getConnectionManager().get('postgres');
        } else {
            throw err;
        }
    }
    // 接続したコネクションを返却
    return connection;
}
