/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import { OperatorServer, ProxyServer, TransferServer, CatalogServer } from './StubServer';
import { clearTables } from './xDatabase';
import supertest = require('supertest');
import { StubBookManageServer } from './StubBookManageServer';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification/transfer';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';
// スタブサーバーの起動
let operatorServer: OperatorServer = null;
let proxyServer: ProxyServer = null;
let catalogServer: CatalogServer = null;
let bookManageServer: StubBookManageServer = null;

// Notification Service APIのユニットテスト
describe('Notification Service API', () => {
    beforeAll(async () => {
        await Application.start();
        await clearTables();
    });
    afterEach(async () => {
        if (operatorServer) {
            operatorServer.server.close();
            operatorServer = null;
        }
        if (proxyServer) {
            proxyServer.server.close();
            proxyServer = null;
        }
        if (catalogServer) {
            catalogServer.server.close();
            catalogServer = null;
        }
        if (bookManageServer) {
            bookManageServer.server.close();
            bookManageServer = null;
        }
    });
    // テストが全て終了したら実行される事後処理
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop()
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST: ' + baseURI, () => {
        // 異常系
        test('異常系: 不正なリクエスト', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            bookManageServer = new StubBookManageServer(200);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .send({}); // 空は不正である

            // Expect status Service unable
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'リクエストが空です'
            }));
            expect(response.status).toBe(400);
        });

        // 正常系
        test('正常系: Block間転送処理呼び出し', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            bookManageServer = new StubBookManageServer(200);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [sessionName + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします',
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000124],
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '7',
                type: 1,
                title: '承認リクエスト',
                content: 'テスト: 承認をリクエストします',
                attribute: {},
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111, operatorId: 10000126,
                    actor: {
                        _value: 1000075,
                        _ver: 1
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: false,
                approval: { expirationAt: response.body.approval.expirationAt },
                destination: {
                    blockCode: 1000111,
                    operatorType: 0,
                    isSendAll: false,
                    userId: ['user02'],
                    operatorId: [10000124]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('正常系: 通知タイプ', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            bookManageServer = new StubBookManageServer(200);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [sessionName + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send(JSON.stringify({
                    type: 0,
                    title: '通知リクエスト',
                    content: 'テスト',
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    attribute: {
                        traderActorCode: 1000075
                    },
                    from: {
                        applicationCode: 1000004,
                        workflowCode: null
                    },
                    destination: {
                        blockCode: 1000112,
                        operatorType: 3,
                        isSendAll: false,
                        operatorId: null,
                        userId: ['user01']
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '8',
                type: 0,
                title: '通知リクエスト',
                content: 'テスト',
                attribute: {
                    traderActorCode: 1000075
                },
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111, operatorId: 10000126,
                    actor: {
                        _value: 1000075,
                        _ver: 1
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: false,
                destination: {
                    blockCode: 1000112,
                    operatorType: 3,
                    isSendAll: false,
                    userId: ['user01'],
                    operatorId: [10000123]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('異常：セッション(Book管理サービスエラー応答200以外)', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            bookManageServer = new StubBookManageServer(400);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [sessionName + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send(JSON.stringify({
                    type: 0,
                    title: '通知リクエスト',
                    content: 'テスト',
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    from: {
                        applicationCode: 1000004,
                        workflowCode: null
                    },
                    destination: {
                        blockCode: 1000112,
                        operatorType: 3,
                        isSendAll: false,
                        operatorId: null,
                        userId: ['user01']
                    }
                }));

            // Expect status Success code.
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_BOOK);
        });
        test('異常：セッション(Book管理サービス未起動)', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [sessionName + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send(JSON.stringify({
                    type: 0,
                    title: '通知リクエスト',
                    content: 'テスト',
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    from: {
                        applicationCode: 1000004,
                        workflowCode: null
                    },
                    destination: {
                        blockCode: 1000112,
                        operatorType: 3,
                        isSendAll: false,
                        operatorId: null,
                        userId: ['user01']
                    }
                }));

            // Expect status Success code.
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_BOOK_MANAGE);
        });
    });
});
