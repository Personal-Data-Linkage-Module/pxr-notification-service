/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import { clearTables, destInsert, notificationInsert, approvalInsert, approvalInsert2, approvalInsert3 } from './xDatabase';
import { OperatorServer, ApprovalServer, ProxyServer } from './StubServer';
import supertest = require('supertest');

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification/approval';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';
// スタブサーバーの起動
const operatorServer = new OperatorServer(3000);
const approvalServer = new ApprovalServer(8888);
const proxyServer = new ProxyServer(3003);

// Notification Service APIのユニットテスト
describe('Notification Service API', () => {
    let id = 0;
    let id2 = 0;
    let id3 = 0;
    let id4 = 0;
    beforeAll(async () => {
        await Application.start();
        // テーブルをクリア
        await clearTables();
        // 通知を登録する
        id = await notificationInsert([
            1,
            10000111,
            11111111,
            22222222,
            10000125,
            10000111,
            3,
            false,
            false
        ]);
        await destInsert([
            id,
            10000123,
            'user01'
        ]);
        await approvalInsert([
            id,
            '2999-04-01 00:00:00'
        ]);

        id2 = await notificationInsert([
            1,
            10000111,
            11111111,
            22222222,
            10000125,
            10000112,
            3,
            false,
            false
        ]);
        await destInsert([
            id2,
            10000123,
            'user01'
        ]);
        await approvalInsert2([
            id2,
            '2999-04-01 00:00:00'
        ]);

        id3 = await notificationInsert([
            1,
            10000111,
            11111111,
            22222222,
            10000125,
            10000112,
            3,
            false,
            false
        ]);
        await destInsert([
            id3,
            10000123,
            'user01'
        ]);
        await approvalInsert3([
            id3,
            '2999-04-01 00:00:00'
        ]);

        id4 = await notificationInsert([
            1,
            10000111,
            11111111,
            22222222,
            10000125,
            10000111,
            3,
            false,
            false
        ]);
        await destInsert([
            id4,
            10000123,
            'user01'
        ]);
        await approvalInsert([
            id4,
            '1900-04-01 00:00:00'
        ]);
    });
    afterAll(async () => {
        // テーブルをクリア
        await clearTables();
        // アプリケーションの停止
        Application.stop()
        // スタブサーバーの停止
        await operatorServer.stop();
        await approvalServer.stop();
    });

    describe('承認API PUT: ' + baseURI, () => {
        afterAll(async () => {
            await proxyServer.stop();
        });
        // 正常系
        test('正常系: 承認操作', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id,
                    status: 2,
                    comment: '否認します'
                });

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({}));
            expect(response.status).toBe(200);
        });
        // 異常系
        test('異常系: 承認操作(プロキシーサービスを介した結果連携先で内部エラー)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id3,
                    status: 1
                });

            // Expect status Internal code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: '連携に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
        // 異常系
        test('異常系: 承認操作(すでに承認済み)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id,
                    status: 2,
                    comment: '否認します'
                });

            // Expect status Bad Request.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '承認操作が完了しています'
            }));
            expect(response.status).toBe(400);
        });
        test('異常系: 承認期限切れ', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id4,
                    status: 2,
                    comment: '否認します'
                });

            // Expect status Bad Request.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400, message: '対象の承認期限が切れています'
            }));
            expect(response.status).toBe(400);
        });
    });
    describe('承認API PUT: ' + baseURI, () => {
        // 異常系
        test('異常系: 承認操作(プロキシーサービスが起動していない)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id2,
                    status: 2,
                    comment: '否認します'
                });

            // Expect status Internal code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: '連携サービスとの接続に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });
});
