/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Client, QueryResult } from 'pg';
/* eslint-enable */

/**
 * データベース操作クラス
 */
export default class DatabaseUtility {
    /**
     * コネクション
     */
    private client: Client = null;

    /**
     * 接続設定
     */
    private configure: any = null;

    /**
     * コンストラクタ
     */
    public constructor () {
        // DB接続設定を設定
        this.client = new Client({
            host: 'localhost',
            port: 5432,
            database: 'pxr_pod',
            user: 'pxr_notification_user',
            password: 'pxr_password',
            statement_timeout: 60000
        });
    }

    /**
     * スキーマ名取得
     */
    public getSchemaName (): string {
        return 'pxr_notification';
    }

    /**
     * 接続
     * @param callback
     */
    public async connect (callback?: (err: Error) => void) {
        // データベースに接続
        if (!callback) {
            try {
                // コールバックが未設定の場合は、Promiseな関数をコールする
                await this.client.connect();
            } catch (err) {
                // エラーが発生したら、オブジェクト名を変更して改めてスローする
                err.name = 'postgreError';
                throw err;
            }
        } else {
            this.client.connect(callback);
        }
    }

    /**
     * 切断
     */
    public async close () {
        if (this.client) {
            this.client.on('drain', this.client.end.bind(this.client));
        }
    }

    /**
     * クエリ実行
     * @param query
     * @param parameters
     * @param callback
     */
    public async query (query: string, parameters: any[] = [], callback?: (err: Error, result: QueryResult<any>) => void): Promise<QueryResult<any>> {
        if (!callback) {
            if (this.client) {
                try {
                    // コールバックが未設定の場合は、Promiseな関数をコールする
                    return await this.client.query(query, parameters);
                } catch (err) {
                    // エラーが発生したら、オブジェクト名を変更して改めてスローする
                    err.name = 'postgreError';
                    throw err;
                }
            }
        } else {
            if (this.client) {
                this.client.query(query, parameters, callback);
            }
        }
        return null;
    }
}


/**
 * データベースに引数の内容で通知を登録する
 * @param params: [type, from_block_catalog_code, from_application_catalog_code, from_workflow_catalog_code, from_operator_id, to_block_catalog_code, to_operator_type, is_send_all, is_transfer]
 */
export async function notificationInsert (params: (string | number | boolean)[]): Promise<number> {
    const database = new DatabaseUtility();
    const query = `
        INSERT INTO ${database.getSchemaName()}.notification (
            type,
            from_block_catalog_code,
            from_application_catalog_code,
            from_workflow_catalog_code,
            from_operator_id,
            to_block_catalog_code,
            to_operator_type,
            is_send_all,
            is_transfer,
            title,
            content,
            attributes,
            send_at,
            is_disabled,
            created_by,
            created_at,
            updated_by,
            updated_at,
            category_catalog_code,
            category_catalog_version,
            from_actor_code,
            from_actor_version
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            'Test', 'Test notice record', null, now(), false, 'tester', now(), 'tester', now(), 1, 1, 1, 1
        )
        RETURNING id
    `;
    await database.connect();
    const result = await database.query(query, params);
    await database.close();
    return parseInt(result.rows[0].id);
}

/**
 * データベースに引数の内容で宛先を登録する
 * @param params: [notification_id, destination_operator_id, destination_user_id]
 */
export async function destInsert (params: (string | number | boolean)[]): Promise<number> {
    const database = new DatabaseUtility();
    const query = `
    INSERT INTO ${database.getSchemaName()}.notification_destination (
        notification_id,
        destination_operator_id,
        destination_user_id,
        actor_code,
        actor_version,
        is_disabled,
        created_by,
        created_at,
        updated_by,
        updated_at
    ) VALUES (
        $1, $2, $3, 1, 1,
        false, 'tester', now(), 'tester', now()
    ) RETURNING id
    `;
    await database.connect();
    const result = await database.query(query, params);
    await database.close();
    return parseInt(result.rows[0].id);
}

export async function readFlagInsert (params: (string | number | boolean)[]): Promise<number> {
    const database = new DatabaseUtility();
    const query = `
    INSERT INTO ${database.getSchemaName()}.readflag_management (
        notification_id,
        operator_id,
        user_id,
        created_by,
        updated_by
    ) VALUES (
        $1, $2, $3, 'tester', 'tester'
    ) RETURNING ID
    `;
    await database.connect();
    const result = await database.query(query, params);
    await database.close();
    return parseInt(result.rows[0].id);
}

/**
 * データベースに引数の内容で承認管理を登録する
 * @param params: [notification_id, expire_at]
 */
export async function approvalInsert (params: (string | number | boolean)[]): Promise<number> {
    const database = new DatabaseUtility();
    const query = `
        INSERT INTO ${database.getSchemaName()}.approval_managed (
            notification_id,
            approver_operator_id,
            status,
            approval_at,
            notice_block_code,
            notice_url,
            expiration_at,
            is_disabled,
            created_by,
            created_at,
            updated_by,
            updated_at
        ) VALUES (
            $1, null, 0, null, '1000110', '/', $2,
            false, 'tester', now(), 'tester', now()
        ) RETURNING id
    `;
    await database.connect();
    const result = await database.query(query, params);
    await database.close();
    return parseInt(result.rows[0].id);
}

export async function approvalInsert2 (params: (string | number | boolean)[]): Promise<number> {
    const database = new DatabaseUtility();
    const query = `
        INSERT INTO ${database.getSchemaName()}.approval_managed (
            notification_id,
            approver_operator_id,
            status,
            approval_at,
            notice_block_code,
            notice_url,
            expiration_at,
            is_disabled,
            created_by,
            created_at,
            updated_by,
            updated_at
        ) VALUES (
            $1, null, 0, null, '1000110', '/', $2,
            false, 'tester', now(), 'tester', now()
        ) RETURNING id
    `;
    await database.connect();
    const result = await database.query(query, params);
    await database.close();
    return parseInt(result.rows[0].id);
}

export async function approvalInsert3 (params: (string | number | boolean)[]): Promise<number> {
    const database = new DatabaseUtility();
    const query = `
        INSERT INTO ${database.getSchemaName()}.approval_managed (
            notification_id,
            approver_operator_id,
            status,
            approval_at,
            notice_block_code,
            notice_url,
            expiration_at,
            is_disabled,
            created_by,
            created_at,
            updated_by,
            updated_at
        ) VALUES (
            $1, null, 0, null, '1000110', '/approval/result/save?code=code', $2,
            false, 'tester', now(), 'tester', now()
        ) RETURNING id
    `;
    await database.connect();
    const result = await database.query(query, params);
    await database.close();
    return parseInt(result.rows[0].id);
}

/**
 * データベースの内容を空にする
 */
export async function clearTables () {
    const database = new DatabaseUtility();
    await database.connect();
    await database.query(
        `
        TRUNCATE
            pxr_notification.notification,
            pxr_notification.notification_destination,
            pxr_notification.approval_managed,
            pxr_notification.readflag_management;
        SELECT
            setval('pxr_notification.approval_managed_id_seq', 1),
            setval('pxr_notification.notification_id_seq', 6),
            setval('pxr_notification.notification_destination_id_seq', 1),
            setval('pxr_notification.readflag_management_id_seq', 1);
        `, []);
    await database.close();
}
