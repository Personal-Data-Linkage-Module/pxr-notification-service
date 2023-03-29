/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';

// テスト対象のインスタンス化と起動
const expressApp = Application.express.app;

// Unitテスト対象のURL（ベース）
const baseURI = '/notification';

// テスト時に使用するセッション情報
const Name: string = 'operator_type2_session';

// Notification Service APIのユニットテスト
describe('Notification Service API', () => {
    beforeAll(async () => {
        await Application.start();
    });
    // テストがすべて終了したら実行される事後処理
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop()
    });

    // POSTメソッドのAPIテスト
    describe('追加API POST: ' + baseURI, () => {
        // リクエストボディがJSONではない
        test('JSONではないデータ', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send('');

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'リクエストが空です' }));
            expect(response.status).toBe(400);
        });

        // リクエストボディが空のJSON
        test('空のJSON', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send({}); // 空を送る

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'リクエストが空です' }));
            expect(response.status).toBe(400);
        });

        // リクエストする値として、期待しない値
        test('リクエスト: 規定しない値(operatorType != 0, 2, 3)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    // attributeは存在しなくても、問題ない
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 5, // 期待値は(0|2|3)となっている為、エラー
                        isSendAll: false,
                        operatorId: null,
                        userId: [
                            'user01_test',
                            'user02_test'
                        ]
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'オペレーター種別は期待する数値ではありません'
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値として、期待しない値
        test('リクエスト: 規定しない値(operatorType != 0, 2, 3)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    // attributeは存在しなくても、問題ない
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 1, // 期待値は(0|2|3)となっている為、エラー
                        isSendAll: false,
                        operatorId: null,
                        userId: [
                            'user01_test',
                            'user02_test'
                        ]
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'オペレーター種別は期待する数値ではありません'
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値として、期待しない値
        test('リクエスト: 規定しない値(type)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 2, // 種別が0 or 1ではないとエラー
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    attribute: null,
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000125],
                        userId: ['user_id']
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '通知種別は期待する数値ではありません'
            }));
            expect(response.status).toBe(400);
        });

        // 同時指定
        test('リクエスト: 規定しない値(type)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    attribute: null,
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000125],
                        userId: ['user_id']
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body))
                .toBe(JSON.stringify({
                    status: 400, message: 'オペレーターIDと利用者IDを同時に指定することはできません'
                }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(基本情報)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send({
                    type: 0 // リクエスト種別が正しくても、必要な値が無いことでエラー
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'title', value: null, message: 'この値は必須値です' },
                    { property: 'content', value: null, message: 'この値は必須値です' },
                    { property: 'category', value: null, message: 'この値は必須値です' },
                    { property: 'destination', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(個別の宛先情報)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [], // 個別送信の場合は、どちらかが必須値
                        userId: [] // 個別送信の場合は、どちらかが必須値
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400, message: '個別送信の場合、宛先となるオペレーターIDまたは利用者IDが必要です'
            }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(noticeBlockCode)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
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
                        noticeBlockCode: null,  // 通知BlockCodeは必須
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [{
                    property: 'noticeBlockCode',
                    value: null,
                    message: 'この値は必須値です'
                }]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(noticeUrl)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000125],
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: null, // 通知URLは必須
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [{
                    property: 'noticeUrl',
                    value: null,
                    message: 'この値は必須値です'
                }]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(approval)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000125],
                        userId: null
                    } // type=1(承認要求)の場合は、approvalオブジェクトが必須
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400, message: '指定された通知URLが、URLのパス表現としては不正です'
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(論理値)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: 0, // (false|true)という論理値を期待。エラー
                        operatorId: null,
                        userId: [
                            'user01_test',
                            'user02_test'
                        ]
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [{
                    property: 'isSendAll',
                    value: null,
                    message: '真偽値ではありません'
                }]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(日付)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 0,
                        isSendAll: false,
                        operatorId: [10000125],
                        userId: null
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: 'http://localhost:8888/',
                        expirationAt: '2020/04/01aaaaaaaaaaa 00:00:00.000+0900' // フォーマットエラー
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [{
                    property: 'expirationAt',
                    value: '2020/04/01aaaaaaaaaaa 00:00:00.000+0900',
                    message: '日付型ではありません'
                }]
            }));
            expect(response.status).toBe(400);
        });

        // 個人宛の通知に関わらず、PXR-IDを指定
        test('リクエスト: 個人宛ではないのにPXR-IDを指定', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .send(JSON.stringify({
                    type: 1,
                    title: '承認リクエスト',
                    content: 'テスト: 承認をリクエストします。',
                    attribute: {
                        testKey: 'testValue'
                    },
                    category: {
                        _value: 1,
                        _ver: 1
                    },
                    destination: {
                        blockCode: 1000111,
                        operatorType: 2,
                        isSendAll: false,
                        pxrId: ['taro.test.org']
                    },
                    approval: {
                        noticeBlockCode: 1000110,
                        noticeUrl: '/',
                        expirationAt: '2020-04-01T00:00:00.000+0900'
                    }
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400, message: '個人オペレーター以外を宛先とした場合、PXR-IDによる個別宛先の指定はできません'
            }));
            expect(response.status).toBe(400);
        });
    });

    // PUTメソッドのAPIテスト
    describe('承認API PUT: ' + baseURI + '/approval', () => {
        // リクエストボディがJSONではない
        test('JSONではないデータ', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send('');

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'リクエストが空です' }));
            expect(response.status).toBe(400);
        });

        // リクエストボディが空のJSON
        test('空のJSON', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send(JSON.stringify({}));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'リクエストが空です' }));
            expect(response.status).toBe(400);
        });

        // リクエストする値として、期待しない値
        test('リクエスト: 規定しない値(status != 1, 2)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send(JSON.stringify({
                    id: 1,
                    status: 0 // (1|2)を期待している為、エラー
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'ステータス番号としては期待していない数値です' }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(id)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send(JSON.stringify({
                    // idプロパティが存在しない為、エラー
                    status: 1
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'id', value: null, message: 'この値は必須値です' } ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(数値)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send(JSON.stringify({
                    id: '1', // 数値へ変換できるので、ここはスルー
                    status: 'string' // 数値を期待している為、変換できずにエラー
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'status', value: 'string', message: '数値ではありません' } ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(コメント)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send(JSON.stringify({
                    id: '1',
                    status: 1,
                    comment: [{}] // コメントは文字列のみを許容する
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'comment', value: [{}], message: '文字列ではありません' } ]
            }));
            expect(response.status).toBe(400);
        });

        // 条件変動
        test('リクエスト: 特定条件下での必須値(否認時のコメント', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + '/approval')
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16'])
                .send(JSON.stringify({
                    id: '1',
                    status: 2 // , // 否認
                    // comment: '' // コメントがなくエラー
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: '否認操作時にコメントがないことは期待していません' }));
            expect(response.status).toBe(400);
        });
    });

    // PUTメソッドのAPIテスト
    describe('通知既読API PUT: ' + baseURI, () => {
        // リクエストボディがJSONではない
        test('JSONではないデータ', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send('');

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'リクエストが空です' }));
            expect(response.status).toBe(400);
        });

        // リクエストボディが空のJSON
        test('空のJSON', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send({}); // 空を送る

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'リクエストが空です' }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(数値)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send(JSON.stringify({
                    id: 'string' // 変換できずにエラー
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'id', value: 'string', message: '数値ではありません' } ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない(id)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI)
                .set({
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645'])
                .send(JSON.stringify({
                    id: '' // この場合は、エラーとなる
                }));

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'id', value: null, message: '数値ではありません' } ]
            }));
            expect(response.status).toBe(400);
        });
    });

    // GETメソッドのAPIテスト
    describe('一覧取得API GET: ' + baseURI, () => {
        // リクエストパラメーターが空
        test('空のパラメーター', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set({
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .query({
                    // パラメーターは空
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'isSend', value: null, message: 'この値は必須値です' },
                    { property: 'isUnread', value: null, message: 'この値は必須値です' },
                    { property: 'isApproval', value: null, message: 'この値は必須値です' },
                    { property: 'num', value: null, message: 'この値は必須値です' },
                    { property: 'type', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストオブジェクトに、必須な値が存在していない
        test('リクエスト: 必須値が存在しない', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set({
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .query({
                    is_send: true,
                    is_unread: true,
                    is_approval: true,
                    type: 1,
                    from: '2019-10-01',
                    to: '2019-12-31'
                    // numは必須値
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'num', value: null, message: 'この値は必須値です' } ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値として、期待として値
        test('リクエスト: 規定しない値(type != 0, 1)', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set({
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .query({
                    is_send: true,
                    is_unread: true,
                    is_approval: true,
                    type: 2, // (0|1)を許可している為、エラー
                    // to, fromは必須値ではない
                    num: 0
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '通知種別は期待する数値ではありません'
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(数値)', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set({
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .query({
                    is_send: true,
                    is_unread: true,
                    is_approval: true,
                    type: '0', // 文字列から変換できるのでOK
                    from: '2019-10-01',
                    to: '2019-12-31',
                    num: 'string' // 変換できずエラー
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ { property: 'num', value: 'string', message: '数値ではありません' } ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(論理値)', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set({
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .query({
                    is_send: 'true', // 文字列から変換できるのでOK
                    is_unread: 'false', // 文字列から変換できるのでOK
                    is_approval: 'string', // 変換できずにエラー
                    type: 0,
                    from: '2019-10-01',
                    to: '2019-12-31',
                    num: 0
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                  { property: 'isApproval', value: 'string', message: '真偽値ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });

        // リクエストする値の型が期待しない
        test('リクエスト: 無効な型(日付)', async () => {
            const response = await supertest(expressApp)
                .get(baseURI)
                .set({
                    accept: 'application/json'
                })
                .set('Cookie', [Name + '=cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc'])
                .query({
                    is_send: 'true',
                    is_unread: 'false',
                    is_approval: true,
                    type: 0,
                    from: '2019/10/01', // 変換できずにエラー
                    to: '2019-12-31',
                    num: 0
                });

            // Expect status is Bad Request
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [ {
                    property: 'from', value: '2019/10/01', message: '日付型ではありません'
                } ]
            }));
            expect(response.status).toBe(400);
        });
    });
});
