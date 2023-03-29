/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import { clearTables, destInsert, notificationInsert, readFlagInsert } from './xDatabase';
import { OperatorServer } from './StubServer';
import supertest = require('supertest');

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type0_session';

// Notification Service APIのユニットテスト
describe('Notification Service API', () => {
    // スタブサーバーの起動
    let operatorServer: OperatorServer = null;
    // テスト実行前の事前処理
    let id = 0;
    beforeAll(async () => {
        operatorServer = new OperatorServer(200);
        await Application.start();
        // テーブルをクリア
        await clearTables();
        // 通知を登録する
        id = await notificationInsert([
            0,
            1000111,
            1111111,
            2222222,
            1000125,
            1000111,
            3,
            false,
            false
        ]);
        await destInsert([
            id,
            null,
            null
        ]);
        await readFlagInsert([
            id,
            10000124,
            'user02'
        ]);
    });

    // テストが全て終了したら実行される事後処理
    afterAll(async () => {
        // テーブルをクリア
        await clearTables();
        // アプリケーションの停止
        Application.stop()
        // スタブサーバーの停止
        await operatorServer.stop();
    });

    describe('既読API PUT: ' + baseURI, () => {
        // 正常系
        test('正常系: 既読操作', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id
                });

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                message: '操作が正常に完了しました'
            }));
            expect(response.status).toBe(200);
        });
        // 異常系
        test('異常系: 既読操作', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id
                });

            // Expect status Bad Request.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({}));
            expect(response.status).toBe(204);
        });
    });
});
describe('Notification Service API', () => {
    // スタブサーバーの起動
    let operatorServer: OperatorServer = null;
    // テスト実行前の事前処理
    let id = 0;
    beforeAll(async () => {
        operatorServer = new OperatorServer(200);
        await Application.start();
        // テーブルをクリア
        await clearTables();
        // 通知を登録する
        id = await notificationInsert([
            0,
            1000111,
            1111111,
            2222222,
            1000125,
            1000111,
            3,
            false,
            false
        ]);
        await destInsert([
            id,
            10000123,
            'user01'
        ]);
    });

    // テストが全て終了したら実行される事後処理
    afterAll(async () => {
        // テーブルをクリア
        await clearTables();
        // アプリケーションの停止
        Application.stop()
        // スタブサーバーの停止
        await operatorServer.stop();
    });

    describe('既読API PUT: ' + baseURI, () => {
        // 正常系
        test('既読権限なし', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=xe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: id
                });

            // Expect status not authority code.
            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 401, message: '対象を操作する権限がありません'
                }));
            expect(response.status).toBe(401);
        });
        test('対象のIDが存在しない', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set('Cookie', [sessionName + '=xe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    id: 5555
                });

            // Expect status Bad request.
            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 400, message: '更新対象が存在しません'
                }));
            expect(response.status).toBe(400);
        });
    });
});
