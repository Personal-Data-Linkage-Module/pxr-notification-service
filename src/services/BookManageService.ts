/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from '../common/AppError';
import OperatorDomain from '../domains/OperatorDomain';
import { doPostRequest } from '../common/DoRequest';
import Config from '../common/Config';
import config = require('config');
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

/**
 * オペレーターサービスとの連携クラス
 */
export default class BookManageService {
    /**
     * 利用者IDからPXR-IDを取得する
     * @param userId 利用者ID
     * @param type オペレーター種別
     */
    static async getPxrIdFromUserId (userId: string, app: number, loginOperator: OperatorDomain): Promise<string> {
        const body = {
            actor: null as any,
            app: app,
            wf: null as any,
            userId: userId
        };
        const url = `${config.get('bookManageService.postSearchUser')}`;
        const book = await this.postSearchUser(url, body, loginOperator);
        return book['pxrId'];
    }

    /**
     * オペレーターサービスのオペレーターAPIを呼び出す
     * @param url
     * @param data
     * @param operator
     */
    private static async postSearchUser (url: string, body: any, operator: OperatorDomain): Promise<OperatorDomain[]> {
        const bodyStr = JSON.stringify(body);
        try {
            const result = await doPostRequest(url, {
                headers: {
                    accept: 'application/json',
                    session: operator.encoded,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(bodyStr)
                },
                body: bodyStr
            });
            if (result.response.statusCode !== 200) {
                throw new AppError(Message.FAILED_TAKE_BOOK, 500);
            }
            return result.body;
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError(Message.FAILED_CONNECT_TO_BOOK_MANAGE, 500, err);
        }
    }
}
