/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Application from '../index';
import supertest = require('supertest');
import { OperatorServer, CatalogServer, CatalogServer2 } from './StubServer';

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type3_session';

describe('Notification Service API', () => {
    beforeAll(async () => {
        await Application.start();
    });
    afterAll(async () => {
        Application.stop();
    });

    // オペレーターサービス関連
    describe('追加API POST: ' + baseURI, () => {
        test('オペレーター情報なし', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
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
                        blockCode: 1000111,
                        operatorType: 3,
                        isSendAll: true
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify(
                    { status: 401, message: '未ログイン状態でのリクエストはエラーです' }
                ));
            expect(response.status).toBe(401);
        });
        test('オペレーターサービスへの接続に失敗', async () => {
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

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 500, message: 'オペレーターサービスとの接続に失敗しました'
                }));
            expect(response.status).toBe(500);
        });
    });

    // カタログサービス関連
    describe('追加API POST: ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        let catalogServer: CatalogServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(3000);
            catalogServer = new CatalogServer();
        });
        afterAll(async () => {
            await operatorServer.stop();
            await catalogServer.stop();
        });
        test('ネームスペースが期待外(カテゴリー)', async () => {
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
                        _value: 1000111,
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

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 400, message: 'リクエストされたカタログは、カテゴリのものではありません（コード: 1000111）'
                }));
            expect(response.status).toBe(400);
        });
        test('カタログが取得できない(ブロック)', async () => {
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
                        blockCode: 3,
                        operatorType: 3,
                        isSendAll: true
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 400, message: 'リクエストされたカタログは、ブロックのものではありません（コード: 3）'
                }));
            expect(response.status).toBe(400);
        });
        test('ネームスペースが期待外(ブロック)', async () => {
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
                        blockCode: 1,
                        operatorType: 3,
                        isSendAll: true
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/'
                    }
                }));

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 400, message: 'リクエストされたカタログは、ブロックのものではありません（コード: 1）'
                }));
            expect(response.status).toBe(400);
        });
        test('ステータスコード(500)エラー', async () => {
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
                        _value: 2,
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

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 500, message: 'カタログサービスの内部エラーが発生しました'
                }));
            expect(response.status).toBe(500);
        });
        test('ステータスコード(404)エラー', async () => {
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
                        _value: 3,
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

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 400, message: 'リクエストされたカタログは、カテゴリのものではありません（コード: 3）'
                }));
            expect(response.status).toBe(400);
        });
    });

    // カタログサービス関連
    describe('追加API POST: ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        let catalogServer: CatalogServer2 = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(3000);
            catalogServer = new CatalogServer2();
        });
        afterAll(async () => {
            await operatorServer.stop();
            await catalogServer.stop();
        });
    });
    describe('追加API POST: ' + baseURI, () => {
        let operatorServer: OperatorServer = null;
        beforeAll(async () => {
            operatorServer = new OperatorServer(3000);
        });
        afterAll(async () => {
            await operatorServer.stop();
        });
        test('カタログサービスへの接続に失敗', async () => {
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
                        _value: 1000111,
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

            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 500, message: 'カタログサービスとの接続に失敗しました'
                }));
            expect(response.status).toBe(500);
        });
    });

    // 操作権限なし関連
    describe('既読/承認 API POST: ' + baseURI, () => {});
});
