/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import {
    OperatorServer,
    OperatorServerAbnormalAuth,
    OperatorServerAbnormalUser,
    ProxyServer, ProxyServerBadRequest, ProxyServerAbnormal, TransferServer, CatalogServer, BookManageServer
} from './StubServer';
import supertest = require('supertest');

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';
// スタブサーバーの起動
const transferServer = new TransferServer(4004);
const catalogServer = new CatalogServer();

// Notification Service APIのユニットテスト
describe('Notification Service API', () => {
    beforeAll(async () => {
        await Application.start();
    });
    // テストが全て終了したら実行される事後処理
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop()
        // スタブサーバーの停止
        await transferServer.stop();
        await catalogServer.stop();
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(セッションが無効): ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        let proxyServer: ProxyServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
        });
        afterAll(async () => {
            await operatorServer.stop();
            await proxyServer.stop();
        });
        // 異常系
        test('異常系: セッションが無効', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [sessionName + '=a']) // 存在しないセッションキー
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
                        operatorType: 3,
                        isSendAll: true,
                        operatorId: null,
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 401,
                message: '未ログイン状態でのリクエストはエラーです'
            }));
            expect(response.status).toBe(401);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(宛先オペレーターが存在しない): ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        let proxyServer: ProxyServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
        });
        afterAll(async () => {
            await operatorServer.stop();
            await proxyServer.stop();
        });
        // 異常系
        test('異常系: 宛先が存在しない', async () => {
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
                        operatorType: 0, // この種別を保有するユーザーは存在しない
                        isSendAll: false,
                        operatorId: [111111111],
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'リクエストされたオペレーターは存在しません'
            }));
            expect(response.status).toBe(400);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(セッション情報取得時にオペレーターサービスで内部エラー): ' + baseURI, () => {
        let operatorServer: OperatorServerAbnormalAuth = null;
        let proxyServer: ProxyServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServerAbnormalAuth(3000);
            proxyServer = new ProxyServer(3003);
        });
        afterAll(async () => {
            await operatorServer.stop();
            await proxyServer.stop();
        });
        // 異常系
        test('異常系: オペレーターサービスにて内部エラー', async () => {
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
                        operatorType: 3,
                        isSendAll: true,
                        operatorId: null,
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: 'セッション情報の取得に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(ユーザー情報取得時にオペレーターサービスにて内部エラー): ' + baseURI, () => {
        let operatorServer: OperatorServerAbnormalUser = null;
        let proxyServer: ProxyServer = null;
        let bookManageServer: BookManageServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServerAbnormalUser(3000);
            proxyServer = new ProxyServer(3003);
            bookManageServer = new BookManageServer(200);
        });
        afterAll(async () => {
            await operatorServer.stop();
            await proxyServer.stop();
            await bookManageServer.stop();
        });
        // 異常系
        test('異常系: オペレーターサービスにて内部エラー', async () => {
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
                        operatorType: 3,
                        isSendAll: false,
                        operatorId: null,
                        userId: ['sa01']
                    },
                    from: {
                        applicationCode: 1000109,
                        workflowCode: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: 'オペレーターの取得に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(オペレーターサービスが未起動): ' + baseURI, () => {
        let proxyServer: ProxyServer = null;
        beforeAll(async () => {
            proxyServer = new ProxyServer(3003);
        });
        afterAll(async () => {
            await proxyServer.stop();
        });
        // 異常系
        test('異常系: オペレーターサービスが起動していない', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    session: encodeURIComponent(JSON.stringify({
                        sessionId: '81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645',
                        operatorId: 10000126,
                        type: 2,
                        loginId: 'user04',
                        name: '{"aa":"aa"}',
                        roles: [
                            {
                                _value: '1000109',
                                _ver: '1'
                            }
                        ],
                        block: {
                            _value: 1000111,
                            _ver: 1
                        },
                        actor: {
                            _value: 1000075,
                            _ver: 1
                        }
                    }))
                })
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
                        operatorType: 3,
                        isSendAll: false,
                        operatorId: [1],
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: 'オペレーターサービスとの接続に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(プロキシーサービスからのレスポンスが400): ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        let proxyServer: ProxyServerBadRequest = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServerBadRequest(3003);
        });
        afterAll(async () => {
            await operatorServer.stop();
            await proxyServer.stop();
        });
        // 異常系
        test('異常系: プロキシーサービスを経由した先でBad Requestエラー', async () => {
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
                        blockCode: 1000112,
                        operatorType: 3,
                        isSendAll: true,
                        operatorId: null,
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: '連携に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(プロキシーサービスからのレスポンスが500): ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        let proxyServer: ProxyServerAbnormal = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServerAbnormal(3003);
        });
        afterAll(async () => {
            await operatorServer.stop();
            await proxyServer.stop();
        });
        // 異常系
        test('異常系: プロキシーサービスを経由した先で未定義エラー', async () => {
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
                        blockCode: 1000112,
                        operatorType: 3,
                        isSendAll: true,
                        operatorId: null,
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: '連携に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST(プロキシーサービスが未起動)): ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(200);
        });
        afterAll(async () => {
            await operatorServer.stop();
        });
        // 異常系
        test('異常系: プロキシーサービスが未起動', async () => {
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
                        blockCode: 1000112,
                        operatorType: 3,
                        isSendAll: true,
                        operatorId: null,
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 500,
                message: '連携サービスとの接続に失敗しました'
            }));
            expect(response.status).toBe(500);
        });
    });
});
