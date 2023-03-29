/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import { OperatorServer, ProxyServer, TransferServer, CatalogServer, CatalogServer2 } from './StubServer';
import { clearTables } from './xDatabase';
import supertest = require('supertest');
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type3_session';
// スタブサーバーの起動
let operatorServer: OperatorServer = null;
let proxyServer: ProxyServer = null;
let catalogServer: CatalogServer = null;
let transferServer: TransferServer = null;

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
        if (transferServer) {
            transferServer.server.close();
            transferServer = null;
        }
    });
    // テストが全て終了したら実行される事後処理
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop()
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST: ' + baseURI, () => {
        // 正常系
        test('正常系: 承認要求タイプ', async () => {
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
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします',
                    attribute: {
                        property: 'a'
                    },
                    category: {
                        _value: 1,
                        _ver: null
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 3,
                        isSendAll: true
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '7',
                type: 1,
                title: '承認リクエスト',
                content: 'テスト: 承認をリクエストします',
                attribute: {
                    property: 'a'
                },
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000126,
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
                    operatorType: 3,
                    isSendAll: true
                }
            }));
            expect(response.status).toBe(200);
        });
        test('正常系: 通知タイプ', async () => {
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
                    destination: {
                        blockCode: 1000111,
                        operatorType: 3,
                        isSendAll: false,
                        operatorId: [10000124, 10000125],
                        userId: null
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '8',
                type: 0,
                title: '通知リクエスト',
                content: 'テスト',
                attribute: {},
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000126,
                    actor: {
                        _value: 1000075,
                        _ver: 1
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: false,
                destination: {
                    blockCode: 1000111,
                    operatorType: 3,
                    isSendAll: false,
                    userId: ['user02', 'user03'],
                    operatorId: [
                        10000124,
                        10000125
                    ]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('正常系: 承認要求タイプ(転送処理)', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            transferServer = new TransferServer(4004);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    session: encodeURIComponent(JSON.stringify({
                        sessionId: '81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645',
                        operatorId: 10000126,
                        type: 2,
                        loginId: 'user04',
                        name: '{"aa":"aa"}',
                        roles: [
                            {
                                _value: 1000109,
                                _ver: 1
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
                    })),
                    accept: 'application/json'
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
                        blockCode: 1000112,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000124],
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));
            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '9',
                type: 1,
                title: '承認リクエスト',
                content: 'テスト: 承認をリクエストします',
                attribute: {},
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000126,
                    actor: {
                        _value: 1000075,
                        _ver: 1
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: true,
                approval: {
                    expirationAt: response.body.approval.expirationAt
                },
                destination: {
                    blockCode: 1000112,
                    operatorType: 0,
                    isSendAll: false
                }
            }));
            expect(response.status).toBe(200);
        });
        test('正常系: 通知タイプ(転送処理)', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            transferServer = new TransferServer(4004);
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
                    destination: {
                        blockCode: 1000112,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000124],
                        userId: null
                    }
                }));
            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '10',
                type: 0,
                title: '通知リクエスト',
                content: 'テスト',
                attribute: {},
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000126,
                    actor: {
                        _value: 1000075,
                        _ver: 1
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: true,
                destination: {
                    blockCode: 1000112,
                    operatorType: 0,
                    isSendAll: false
                }
            }));
            expect(response.status).toBe(200);
        });
        test('正常系: 承認要求タイプ(actor: null)', async () => {
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
                .set('Cookie', [sessionName + '=4f8b51784d37afc15c90e01d2b5e79d685e7ce1beb2181cb618e5a8ca637e214'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします',
                    attribute: {
                        property: 'a'
                    },
                    category: {
                        _value: 1,
                        _ver: null
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 3,
                        isSendAll: true
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            // Expect status Success code.
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '11',
                type: 1,
                title: '承認リクエスト',
                content: 'テスト: 承認をリクエストします',
                attribute: {
                    property: 'a'
                },
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000129,
                    actor: {
                        _value: null,
                        _ver: null
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: false,
                approval: { expirationAt: response.body.approval.expirationAt },
                destination: {
                    blockCode: 1000111,
                    operatorType: 3,
                    isSendAll: true
                }
            }));
            expect(response.status).toBe(200);
        });
        test('PXR-IDの指定による個別送信', async () => {
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
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        pxrId: ['taro.test.org']
                    }
                }));

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '12',
                type: 0,
                title: '通知リクエスト',
                content: 'テスト',
                attribute: {},
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000126,
                    actor: {
                        _value: 1000075,
                        _ver: 1
                    }
                },
                sendAt: response.body.sendAt,
                is_transfer: false,
                destination: {
                    blockCode: 1000111,
                    operatorType: 0,
                    isSendAll: false,
                    userId: ['user01'],
                    operatorId: [10000123]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('異常：Cookie使用, オペレータサービス応答400', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(400);
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
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        pxrId: ['taro.test.org']
                    }
                }));

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_EXISTS_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答500', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(500);
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
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        pxrId: ['taro.test.org']
                    }
                }));

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // スタブサーバー起動
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
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        pxrId: ['taro.test.org']
                    }
                }));

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：セッション(転送処理エラー応答200以外)', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer();
            transferServer = new TransferServer(4004, 400);
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
                    destination: {
                        blockCode: 1000112,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000124],
                        userId: null
                    }
                }));
            // Expect status Success code.
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_LINKAGE);
        });
        test('異常：セッション(Proxyサービス未起動)', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
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
                    destination: {
                        blockCode: 1000112,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000124],
                        userId: null
                    }
                }));
            // Expect status Success code.
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_LINKAGE_SERVICE);
        });
        test('アクターカタログが取得できない', async () => {
            // スタブサーバー起動
            operatorServer = new OperatorServer(200);
            proxyServer = new ProxyServer(3003);
            catalogServer = new CatalogServer2()
            transferServer = new TransferServer(4004);
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
                        isSendAll: true
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: '13',
                type: 1,
                title: '承認リクエスト',
                content: 'テスト: 承認をリクエストします',
                attribute: {},
                category: {
                    _value: 1,
                    _ver: 1
                },
                from: {
                    blockCode: 1000111,
                    operatorId: 10000126,
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
                    operatorType: 3,
                    isSendAll: true
                }
            }));
            expect(response.status).toBe(200);
        });
    });
});
