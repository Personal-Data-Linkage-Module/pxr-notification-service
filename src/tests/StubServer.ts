/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import helmet = require('helmet');
import express = require('express');
import cookieParser = require('cookie-parser');
import { Server } from 'net';
import { doPostRequest } from '../common/DoRequest';
/* eslint-enable */

// レスポンスデータを読み込み
import type1 = require('./OperatorResponse/only_type/1.json');
import type2 = require('./OperatorResponse/only_type/2.json');
import type3 = require('./OperatorResponse/only_type/3.json');

import user01 = require('./OperatorResponse/login_id/user01.json');
import user02 = require('./OperatorResponse/login_id/user02.json');
import user03 = require('./OperatorResponse/login_id/user03.json');
import user04 = require('./OperatorResponse/login_id/user04.json');
import user05 = require('./OperatorResponse/login_id/user05.json');
import user06 = require('./OperatorResponse/login_id/user06.json');
import user07 = require('./OperatorResponse/login_id/user07.json');

import operator10000123 = require('./OperatorResponse/operator_id/10000123.json');
import operator10000124 = require('./OperatorResponse/operator_id/10000124.json');
import operator10000125 = require('./OperatorResponse/operator_id/10000125.json');
import operator10000126 = require('./OperatorResponse/operator_id/10000126.json');
import operator10000127 = require('./OperatorResponse/operator_id/10000127.json');
import operator10000128 = require('./OperatorResponse/operator_id/10000128.json');
import operator10000129 = require('./OperatorResponse/operator_id/10000129.json');

import session81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645 = require('./OperatorResponse/session/81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645.json');
import session879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16 = require('./OperatorResponse/session/879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16.json');
import sessioncf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc = require('./OperatorResponse/session/cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc.json');
import sessionf4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4 = require('./OperatorResponse/session/f4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4.json');
import sessionxe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e = require('./OperatorResponse/session/xe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e.json');
import session4f8b51784d37afc15c90e01d2b5e79d685e7ce1beb2181cb618e5a8ca637e214 = require('./OperatorResponse/session/4f8b51784d37afc15c90e01d2b5e79d685e7ce1beb2181cb618e5a8ca637e214.json');

import blockCatalog = require('./block.json');
import categoryCatalog = require('./category.json');
import doesNotMeanCatalog = require('./no_mean.json');

export class CatalogServer {
    app: express.Application;
    server: Server;
    constructor () {
        this.app = express();
        this.app.get('/catalog/:code', (req: express.Request, res: express.Response) => {
            const code = parseInt(req.params.code);
            if (code === 1) {
                res.status(200).send(categoryCatalog).end();
            } else if (code === 2) {
                res.status(500).end();
            } else if (code === 3) {
                res.status(404).end();
            } else if (code === 4) {
                res.status(200).send(doesNotMeanCatalog).end();
            } else if (code === 5) {
                res.status(400).end();
            }
            res.status(200).send(blockCatalog).end();
        });
        this.app.get('/catalog/', (req, res) => {
            const ns = req.query.ns;
            res.status(200).json([
                {
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/actor/pxr-root",
                        "name": "流通制御組織",
                        "_code": {
                            "_value": 1000001,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 50,
                            "_ver": 1
                        },
                        "description": "流通制御組織の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000001,
                            "_ver": 1
                        },
                        "app-cert": {
                            "cert": {
                                "title": "",
                                "section": {
                                    "title": "アプリケーションプロバイダーの認定基準",
                                    "content": {
                                        "sentence": "アプリケーションプロバイダーの認定基準です。"
                                    }
                                }
                            },
                            "audit": {
                                "title": "",
                                "section": {
                                    "title": "アプリケーションプロバイダーの監査手順",
                                    "content": {
                                        "sentence": "アプリケーションプロバイダーの監査手順です。"
                                    }
                                }
                            }
                        },
                        "category": null,
                        "consumer-cert": {
                            "cert": {
                                "title": "",
                                "section": {
                                    "title": "データコンシューマーの認定基準",
                                    "content": {
                                        "sentence": "データコンシューマーの認定基準です。"
                                    }
                                }
                            },
                            "audit": {
                                "title": "",
                                "section": {
                                    "title": "データコンシューマーの監査手順",
                                    "content": {
                                        "sentence": "データコンシューマーの監査手順です。"
                                    }
                                }
                            }
                        },
                        "data-trader-cert": {
                            "cert": {
                                "title": "",
                                "section": {
                                    "title": "データ取引サービスプロバイダーの認定基準",
                                    "content": {
                                        "sentence": "データ取引サービスプロバイダーの認定基準です。"
                                    }
                                }
                            },
                            "audit": {
                                "title": "",
                                "section": {
                                    "title": "データ取引サービスプロバイダーの監査手順",
                                    "content": {
                                        "sentence": "データ取引サービスプロバイダーの監査手順です。"
                                    }
                                }
                            }
                        },
                        "main-block": {
                            "_value": 1000110,
                            "_ver": 1
                        },
                        "other-block": null,
                        "region-root-cert": {
                            "cert": {
                                "title": "",
                                "section": {
                                    "title": "領域運営サービスプロバイダーの認定基準",
                                    "content": {
                                        "sentence": "領域運営サービスプロバイダーの認定基準です。"
                                    }
                                }
                            },
                            "audit": {
                                "title": "",
                                "section": {
                                    "title": "領域運営サービスプロバイダーの監査手順",
                                    "content": {
                                        "sentence": "領域運営サービスプロバイダーの監査手順です。"
                                    }
                                }
                            }
                        },
                        "statement": {
                            "title": "組織ステートメント",
                            "section": {
                                "title": "事業概要",
                                "content": {
                                    "sentence": "データ取引組織の事業概要です。"
                                }
                            }
                        },
                        "status": {
                            "status": "certified",
                            "by": null,
                            "at": "20200101T000000.000+0900"
                        },
                        "wf-cert": {
                            "cert": {
                                "title": "",
                                "section": {
                                    "title": "ワークフロープロバイダーの認定基準",
                                    "content": {
                                        "sentence": "ワークフロープロバイダーの認定基準です。"
                                    }
                                }
                            },
                            "audit": {
                                "title": "",
                                "section": {
                                    "title": "ワークフロープロバイダーの監査手順",
                                    "content": {
                                        "sentence": "ワークフロープロバイダーの監査手順です。"
                                    }
                                }
                            }
                        }
                    },
                    "prop": [
                        {
                            "key": "app-cert",
                            "type": {
                                "of": "inner",
                                "inner": null,
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "アプリケーションプロバイダー認定"
                        },
                        {
                            "key": "category",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/category/share/actor/*",
                                        "catalog/built_in/category/share/actor/*",
                                        "catalog/ext/test-org/category/share/actor/*",
                                        "catalog/model/category/supply/actor/*",
                                        "catalog/built_in/category/supply/actor/*",
                                        "catalog/ext/test-org/category/supply/actor/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": null
                        },
                        {
                            "key": "consumer-cert",
                            "type": {
                                "of": "inner",
                                "inner": null,
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "データコンシューマー認定"
                        },
                        {
                            "key": "data-trader-cert",
                            "type": {
                                "of": "inner",
                                "inner": null,
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "データ取引サービスプロバイダー認定"
                        },
                        {
                            "key": "main-block",
                            "type": {
                                "of": "code",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": null,
                                    "_code": null,
                                    "base": {
                                        "_value": 29,
                                        "_ver": 1
                                    }
                                }
                            },
                            "description": "アクター参加時に割り当てられたPXR-Block"
                        },
                        {
                            "key": "other-block",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": null,
                                    "_code": null,
                                    "base": {
                                        "_value": 29,
                                        "_ver": 1
                                    }
                                }
                            },
                            "description": "他アクターから引き継いだPXR-Blockの配列"
                        },
                        {
                            "key": "region-root-cert",
                            "type": {
                                "of": "inner",
                                "inner": null,
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "領域運営サービスプロバイダー認定"
                        },
                        {
                            "key": "statement",
                            "type": {
                                "of": "item[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": null,
                                    "_code": [
                                        {
                                            "_value": 61,
                                            "_ver": 1
                                        }
                                    ],
                                    "base": null
                                }
                            },
                            "description": "組織ステートメント"
                        },
                        {
                            "key": "status",
                            "type": {
                                "of": "inner[]",
                                "inner": null,
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "認定の履歴"
                        },
                        {
                            "key": "wf-cert",
                            "type": {
                                "of": "inner",
                                "inner": null,
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "ワークフロープロバイダー認定"
                        }
                    ],
                    "attribute": null
                }
            ]).end();
        });
        this.server = this.app.listen(3001);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}


export class CatalogServer2 {
    app: express.Application;
    server: Server;
    constructor () {
        this.app = express();
        this.app.get('/catalog/:code', (req: express.Request, res: express.Response) => {
            const code = parseInt(req.params.code);
            if (code === 1) {
                res.status(200).send(categoryCatalog).end();
            } else if (code === 2) {
                res.status(500).end();
            } else if (code === 3) {
                res.status(404).end();
            } else if (code === 4) {
                res.status(200).send(doesNotMeanCatalog).end();
            } else if (code === 5) {
                res.status(400).end();
            }
            res.status(200).send(blockCatalog).end();
        });
        this.app.get('/catalog/', (req, res) => {
            res.status(404).end();
        });
        this.server = this.app.listen(3001);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// 承認結果連携先のスタブサーバー
export class ApprovalServer {
    app: express.Express;
    server: Server;
    constructor (port: number) {
        this.app = express();
        this.app.post('/', (req: express.Request, res: express.Response) => {
            res.status(200);
            res.json({});
            res.end();
        });
        this.app.post('/approval/result/save', (req: express.Request, res: express.Response) => {
            res.status(500);
            res.json({});
            res.end();
        });
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// 転送先のスタブサーバー
export class TransferServer {
    app: express.Express;
    server: Server;
    constructor (port: number, status?: number) {
        this.app = express();
        this.app.post('/notification/transfer', (req: express.Request, res: express.Response) => {
            if (status === 200 || !status) {
                res.status(200).json({}).end();
            } else {
                res.status(status).end();
            }
        });
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// オペレーターサービスのスタブサーバー
export class OperatorServer {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.get('/operator/:code', (req: express.Request, res: express.Response) => {
            const id = parseInt(req.params.code);
            res.status(status);
            if (status === 200) {
                if (id === 10000123) {
                    res.json(operator10000123).end();
                } else if (id === 10000124) {
                    res.json(operator10000124).end();
                } else if (id === 10000125) {
                    res.json(operator10000125).end();
                } else if (id === 10000126) {
                    res.json(operator10000126).end();
                } else if (id === 10000127) {
                    res.json(operator10000127).end();
                } else if (id === 10000128) {
                    res.json(operator10000128).end();
                } else if (id === 10000129) {
                    res.json(operator10000129).end();
                } else {
                    res.status(204).end();
                }
            }
            res.end();
        });
        this.app.get('/operator/', (req: express.Request, res: express.Response) => {
            const type = parseInt(<string>req.query.type);
            if (status !== 200) {
                res.status(status).end();
            }
            if (!req.query.loginId && !req.query.pxrId) {
                if (type === 0) {
                    res.status(204).end();
                } else if (type === 1) {
                    res.json(type1).end();
                } else if (type === 2) {
                    res.json(type2).end();
                } else if (type === 3) {
                    res.json(type3).end();
                } else {
                    res.status(204).end();
                }
            } else if (req.query.pxrId) {
                if (req.query.pxrId === 'taro.test.org') {
                    res.json(user01).end();
                    return;
                }
            } else {
                const id = req.query.loginId;
                if (type === 1) {
                    if (id === 'user02') {
                        res.json(user02).end();
                        return;
                    } else if (id === 'user05') {
                        res.json(user05).end();
                        return;
                    }
                } else if (type === 2) {
                    if (id === 'user04') {
                        res.json(user04).end();
                        return;
                    }
                } else if (type === 3) {
                    if (id === 'user01') {
                        res.json(user01).end();
                        return;
                    } else if (id === 'user03') {
                        res.json(user03).end();
                        return;
                    } else if (id === 'user06') {
                        res.json(user06).end();
                        return;
                    } else if (id === 'user07') {
                        res.json(user07).end();
                        return;
                    }
                }
                res.status(204).end();
            }
        });
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            const id = req.body.sessionId;
            if (id === 'cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc') {
                res.status(200).json(sessioncf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc).end();
            } else if (id === 'xe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e') {
                res.status(200).json(sessionxe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e).end();
            } else if (id === '81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645') {
                res.status(200).json(session81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645).end();
            } else if (id === 'f4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4') {
                res.status(200).json(sessionf4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4).end();
            } else if (id === '879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16') {
                res.status(200).json(session879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16).end();
            } else if (id === '4f8b51784d37afc15c90e01d2b5e79d685e7ce1beb2181cb618e5a8ca637e214') {
                res.status(200).json(session4f8b51784d37afc15c90e01d2b5e79d685e7ce1beb2181cb618e5a8ca637e214).end();
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(3000);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// オペレーターサービスのスタブサーバー（セッション認証時に内部エラー）
export class OperatorServerAbnormalAuth {
    app: express.Express;
    server: Server;
    constructor (port: number) {
        this.app = express();
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            res.status(500);
            res.end();
        });
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// オペレーターサービスのスタブサーバー（ユーザー情報取得時に内部エラー）
export class OperatorServerAbnormalUser {
    app: express.Express;
    server: Server;
    constructor (port: number) {
        this.app = express();
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.get('/operator/:code', (req: express.Request, res: express.Response) => {
            res.status(500);
            res.end();
        });
        this.app.get('/operator/', (req: express.Request, res: express.Response) => {
            res.status(500);
            res.end();
        });
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            const id = req.body.sessionId;
            if (id === 'cf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc') {
                res.status(200).json(sessioncf930faf40d879b87a550d59f26fa4d5c788bb45fa9c94cee6c597608cb46acc).end();
            } else if (id === 'xe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e') {
                res.status(200).json(sessionxe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e).end();
            } else if (id === '81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645') {
                res.status(200).json(session81654181b851542feec3ee0ba3be7695f1472af4702f3aa2a6aa1971c5e3d645).end();
            } else if (id === 'f4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4') {
                res.status(200).json(sessionf4e8797a4f4ed4b0142f25057cfe6e755230a58cc1b1b48ab54da273ef3cd0c4).end();
            } else if (id === '879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16') {
                res.status(200).json(session879777267f854aa3fb49993ca2d1488a7ef2ca5c743297ad6f4b155c88c12c16).end();
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// プロキシーサービスのスタブサーバー（転送先へ確実に渡す）
export class ProxyServer {
    app: express.Express;
    server: Server;
    constructor (port: number) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(helmet());
        const handler = async (req: express.Request, res: express.Response) => {
            const toPath = decodeURIComponent(<string>req.query.path);
            let target = 0;
            if (toPath === '/notification/transfer') {
                target = 4004;
            } else {
                target = 8888;
            }
            const uri = `http://localhost:${target}${toPath}`;
            const data = JSON.stringify(req.body);
            const options = {
                headers: {
                    session: encodeURIComponent(JSON.stringify(sessionxe1398b7147b65cc9fbb84bcbee8f825289dc688eab8703221c2254b82c9c88e)),
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                body: data
            };
            const result = await doPostRequest(uri, options);
            res.status(result.response.statusCode);
            let parsed = result.body;
            while (typeof parsed === 'string' && parsed.length > 0) {
                parsed = JSON.parse(parsed);
            }
            res.json(parsed);
            res.end();
        };
        this.app.post('/pxr-block-proxy', handler);
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// プロキシーサービスのスタブサーバー（400エラー）
export class ProxyServerBadRequest {
    app: express.Express;
    server: Server;
    constructor (port: number) {
        this.app = express();
        const handler = (req: express.Request, res: express.Response) => {
            res.status(400);
            res.end();
        };
        this.app.post('/pxr-block-proxy', handler);
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

// プロキシーサービスのスタブサーバー（内部エラー）
export class ProxyServerAbnormal {
    app: express.Express;
    server: Server;
    constructor (port: number) {
        this.app = express();
        const handler = (req: express.Request, res: express.Response) => {
            res.status(500);
            res.end();
        };
        this.app.post('/pxr-block-proxy', handler);
        this.server = this.app.listen(port);
    }

    stop () {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}

export class BookManageServer {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        const _listener = (req: express.Request, res: express.Response) => {
            res.status(status);
            res.json({});
            res.end();
        };
        this.app.post('/book-manage/search/user', _listener);
        this.server = this.app.listen(3005);
    }

    stop () {
        return new Promise<void>((resolve, reject) => {
            this.server.close(() => {
                resolve();
            });
        });
    }
}
