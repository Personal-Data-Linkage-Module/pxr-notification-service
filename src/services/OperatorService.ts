/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from '../common/AppError';
import OperatorDomain from '../domains/OperatorDomain';
import { Request } from 'express';
import { doPostRequest, doGetRequest } from '../common/DoRequest';
import Config from '../common/Config';
import config = require('config');
import request = require('request');
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

/**
 * オペレーターサービスとの連携クラス
 */
export default class OperatorService {
    /**
     * オペレーターのセッション情報を取得する
     * @param req リクエストオブジェクト
     */
    static async authMe (req: Request): Promise<OperatorDomain> {
        const { cookies } = req;
        const sessionId = cookies[OperatorDomain.TYPE_PERSONAL_KEY]
            ? cookies[OperatorDomain.TYPE_PERSONAL_KEY]
            : cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                ? cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                : cookies[OperatorDomain.TYPE_MANAGER_KEY];
        // Cookieからセッションキーが取得できた場合、オペレーターサービスに問い合わせる
        if (typeof sessionId === 'string' && sessionId.length > 0) {
            const data = JSON.stringify({ sessionId: sessionId });
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                body: data
            };
            try {
                const result = await doPostRequest(
                    config.get('operatorService.session'),
                    options
                );
                // ステータスコードにより制御
                const { statusCode } = result.response;
                if (statusCode === 204 || statusCode === 400) {
                    throw new AppError(Message.NOT_AUTHORIZED, 401);
                } else if (statusCode !== 200) {
                    throw new AppError(Message.FAILED_TAKE_SESSION, 500);
                }
                return new OperatorDomain(result.body);
            } catch (err) {
                if (err instanceof AppError) {
                    throw err;
                }

                throw new AppError(
                    Message.FAILED_CONNECT_TO_OPERATOR, 500, err);
            }

        // ヘッダーにセッション情報があれば、それを流用する
        } else if (req.headers.session) {
            let data = decodeURIComponent(req.headers.session + '');
            while (typeof data === 'string') {
                data = JSON.parse(data);
            }
            return new OperatorDomain(data, req.headers.session + '');

        // セッション情報が存在しない場合、未ログインとしてエラーをスローする
        } else {
            throw new AppError(Message.NOT_AUTHORIZED, 401);
        }
    }

    /**
     * PXR-IDからオペレーター情報を取得する
     * @param pxrId PXR-ID
     */
    static async takeOperatorWithPxrId (pxrId: string, loginOperator: OperatorDomain) {
        const url = `${config.get('operatorService.operator')}?pxrId=${pxrId}`;
        const operator = await this.getOperator(url, loginOperator);
        return operator[0];
    }

    /**
     * オペレーターIDからオペレーター情報を取得する
     * @param operatorId オペレーターID
     */
    static async takeOperatorWithOperatorId (operatorId: number, loginOperator: OperatorDomain): Promise<OperatorDomain> {
        const url = `${config.get('operatorService.operator')}/${operatorId}`;
        const operator = await this.getOperator(url, loginOperator);
        return operator[0];
    }

    /**
     * オペレーターサービスのオペレーターAPIを呼び出す
     * @param url
     */
    private static async getOperator (url: string, operator: OperatorDomain): Promise<OperatorDomain[]> {
        try {
            const result = await doGetRequest(url, {
                headers: {
                    accept: 'application/json',
                    session: operator.encoded
                }
            });
            const { statusCode } = result.response;
            if (statusCode === 204 || statusCode === 400) {
                throw new AppError(Message.NOT_EXISTS_OPERATOR, 400);
            } else if (statusCode !== 200) {
                throw new AppError(Message.FAILED_TAKE_OPERATOR, 500);
            }
            return [new OperatorDomain(result.body)];
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError(
                Message.FAILED_CONNECT_TO_OPERATOR, 500, err);
        }
    }
}
