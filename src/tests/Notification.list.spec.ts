/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import { clearTables, destInsert, notificationInsert, approvalInsert, readFlagInsert } from './xDatabase';
import { OperatorServer } from './StubServer';
import supertest = require('supertest');

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';
// スタブサーバーの起動
const operatorServer = new OperatorServer(200);

// Notification Service APIのユニットテスト
describe('Notification Service API', () => {
    beforeAll(async () => {
        await Application.start();
        // テーブルをクリア
        await clearTables();
        // 通知を登録する
        const id1 = await notificationInsert([
            1,
            1000111,
            1111111,
            2222222,
            1000125,
            1000111,
            3,
            true,
            false
        ]);
        await destInsert([id1, null, null]);
        await approvalInsert([id1, '2020-04-01']);
        const id2 = await notificationInsert([
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
        await destInsert([id2, 10000123, 'user01']);
    });
    afterAll(async () => {
        // テーブルをクリア
        await clearTables();
        // アプリケーションの停止
        Application.stop()
        // スタブサーバーの停止
        await operatorServer.stop();
    });

    describe('取得API GET: ' + baseURI, () => {
        test('取得: 0件データ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: true,
                    is_unread: true,
                    type: 0,
                    num: 1,
                    to: '2040-04-01',
                    from: '2010-04-01'
                });

            // Expect status no content.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({}));
            expect(response.status).toBe(204);
        });
        test('取得: 0件データ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: true,
                    is_unread: true,
                    type: 1,
                    num: 1,
                    to: '2040-04-01',
                    from: '2010-04-01'
                });

            // Expect status no content.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({}));
            expect(response.status).toBe(204);
        });
        test('取得: 0件データ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: false,
                    is_unread: false,
                    type: 0,
                    num: 0,
                    to: '2040-04-01',
                    from: '2010-04-01'
                });

            // Expect status no content.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({}));
            expect(response.status).toBe(204);
        });
        test('取得: 自身が送信した通知タイプ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=f4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: true,
                    is_approval: false,
                    is_unread: false,
                    type: 0,
                    num: 0
                });

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([{
                id: 8,
                type: 0,
                title: 'Test',
                content: 'Test notice record',
                attribute: null,
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 1000125,
                    actor: {
                        _value: 1,
                        _ver: 1
                    }
                },
                destination: {
                    blockCode: 1000111,
                    operatorType: 3,
                    isSendAll: false,
                    operatorId: ['10000123'],
                    userId: ['user01'],
                    actor: {
                        _value: 1,
                        _ver: 1
                    }
                },
                sendAt: response.body[0].sendAt,
                is_transfer: false
            }]));
            expect(response.status).toBe(200);
        });
        test('取得: 自身が送信した承認要求タイプ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=f4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: true,
                    is_approval: false,
                    is_unread: false,
                    type: 1,
                    num: 0,
                    from: '2019-04-01'
                });

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([
                {
                    id: 7,
                    type: 1,
                    title: 'Test',
                    content: 'Test notice record',
                    attribute: null,
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    from: {
                        blockCode: 1000111,
                        operatorId: 1000125,
                        actor: {
                            _value: 1,
                            _ver: 1
                        }
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 3,
                        isSendAll: true,
                        operatorId: null,
                        userId: null,
                        actor: {
                            _value: 1,
                            _ver: 1
                        }
                    },
                    approval: {
                        operatorId: null,
                        status: 0,
                        approvalAt: null,
                        expirationAt: response.body[0].approval.expirationAt
                    },
                    sendAt: response.body[0].sendAt,
                    is_transfer: false
                }
            ]));
            expect(response.status).toBe(200);
        });
        test('取得: 自身が受信した通知タイプ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: false,
                    is_unread: false,
                    type: 0,
                    num: 0,
                    to: '2030-04-01'
                });

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([{
                id: 8,
                type: 0,
                title: 'Test',
                content: 'Test notice record',
                attribute: null,
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 1000125,
                    actor: {
                        _value: 1,
                        _ver: 1
                    }
                },
                readAt: null,
                sendAt: response.body[0].sendAt,
                is_transfer: false
            }]));
            expect(response.status).toBe(200);
        });
        test('取得: 自身が受信した承認要求タイプ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: false,
                    is_unread: false,
                    type: 1,
                    num: 1
                });

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([{
                id: 7,
                type: 1,
                title: 'Test',
                content: 'Test notice record',
                attribute: null,
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 1000125,
                    actor: {
                        _value: 1,
                        _ver: 1
                    }
                },
                approval: {
                    operatorId: null,
                    status: 0,
                    approvalAt: null,
                    expirationAt: '2020-04-01T00:00:00.000+0900'
                },
                readAt: null,
                sendAt: response.body[0].sendAt,
                is_transfer: false
            }]));
            expect(response.status).toBe(200);
        });
        test('取得: is_send=false, is_approval=false, type=0 の全件', async () => {
            // 既読通知データの作成
            const id3 = await notificationInsert([
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
            await destInsert([id3, 10000123, 'user01']);
            // id= 9に対して取得するオペレーターで既読処理
            await readFlagInsert([9, 10000123, 'user01']);
            // id= 8に対して別のオペレーターで既読処理
            await destInsert([8, 10000124, 'user02']);
            await readFlagInsert([8, 10000124, 'user02']);
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: false,
                    is_unread: false,
                    type: 0,
                    num: 0
                });
            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([{
                id: 9,
                type: 0,
                title: 'Test',
                content: 'Test notice record',
                attribute: null,
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 1000125,
                    actor: {
                        _value: 1,
                        _ver: 1
                    }
                },
                readAt: response.body[0].readAt,
                sendAt: response.body[0].sendAt,
                is_transfer: false
            }, {
                    id: 8,
                    type: 0,
                    title: 'Test',
                    content: 'Test notice record',
                    attribute: null,
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    from: {
                        blockCode: 1000111,
                        operatorId: 1000125,
                        actor: {
                            _value: 1,
                            _ver: 1
                        }
                    },
                    readAt: null,
                    sendAt: response.body[1].sendAt,
                    is_transfer: false
                }]));
            expect(response.status).toBe(200);
        });
        test('取得: is_send=false, is_approval=false, type=0 の未読のみ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set('Cookie', [sessionName + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    is_send: false,
                    is_approval: false,
                    is_unread: true,
                    type: 0,
                    num: 0
                });
            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([{
                id: 8,
                type: 0,
                title: 'Test',
                content: 'Test notice record',
                attribute: null,
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 1000125,
                    actor: {
                        _value: 1,
                        _ver: 1
                    }
                },
                readAt: null,
                sendAt: response.body[0].sendAt,
                is_transfer: false
            }]));
            expect(response.status).toBe(200);
        });
    });
});
