/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { doGetRequest } from '../common/DoRequest';
import AppError from '../common/AppError';
import { sprintf } from 'sprintf-js';
import OperatorDomain from '../domains/OperatorDomain';
/* eslint-enable */
import Config from '../common/Config';
import config = require('config');
const Message = Config.ReadConfig('./config/message.json');

/**
 * カタログサービスとの連携クラス
 */
export default class CatalogService {
    /** Block名の正規表現 */
    static readonly BLOCK_NAME_SPACE = /^catalog\/ext\/[\S]*\/block\/([\S])*$/;

    /** カテゴリ名の正規表現 */
    static readonly CATEGORY_NAME_SPACE = /^catalog\/model\/notification[\S]*$/;

    /**
     * コードから期待するカタログ情報かを確認する
     * @param blockCode
     * @param categoryCode
     */
    static async checkAttributes (
        operator: OperatorDomain,
        blockCode: number,
        categoryCode: number,
        categoryVersion?: number
    ): Promise<number> {
        {
            const catalog = await this.get(blockCode, operator);
            if (catalog === null) {
                throw new AppError(sprintf(Message.IS_NOT_BLOCK_CATALOG, blockCode), 400);
            }
            const { ns } = catalog.catalogItem;
            if (!this.BLOCK_NAME_SPACE.test(ns)) {
                throw new AppError(sprintf(Message.IS_NOT_BLOCK_CATALOG, blockCode), 400);
            }
        }
        {
            const catalog = await this.get(categoryCode, operator);
            if (catalog === null) {
                throw new AppError(sprintf(Message.IS_NOT_CATEGORY_CATALOG, categoryCode), 400);
            }
            const { ns } = catalog.catalogItem;
            if (!this.CATEGORY_NAME_SPACE.test(ns)) {
                throw new AppError(sprintf(Message.IS_NOT_CATEGORY_CATALOG, categoryCode), 400);
            }
            return categoryVersion || parseInt(catalog.catalogItem._code._ver);
        }
    }

    /**
     * ブロックのカタログからアクターカタログを取得する
     * @param blockCode
     * @param operator
     */
    static async getActorCatalogFromBlock (
        blockCode: number,
        operator: OperatorDomain
    ) {
        const catalog = await this.get(blockCode, operator);
        const ns = catalog.catalogItem.ns + '';
        const actorCatalog = await this.get(ns.replace('block', 'actor'), operator);
        return {
            actorCode: actorCatalog ? parseInt(actorCatalog.catalogItem._code._value) : null,
            actorVersion: actorCatalog ? parseInt(actorCatalog.catalogItem._code._ver) : null
        };
    }

    /**
     * カタログコードから、カタログサービスよりカタログ情報を取得する
     * @param code カタログコード
     */
    static async get (prefix: number | string, operator: OperatorDomain) {
        const url = config.get('catalogService.get') + '' + (typeof prefix === 'string' ? `?ns=${prefix}` : prefix);
        try {
            const result = await doGetRequest(url, {
                headers: {
                    accept: 'application/json',
                    session: operator.encoded
                }
            });
            const { statusCode } = result.response;
            if (statusCode === 404) {
                return null;
            } else if (statusCode !== 200) {
                throw new AppError(Message.FAILED_CATALOG_SERVICE, 500);
            }
            return typeof prefix === 'string' ? result.body[0] : result.body;
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError(Message.FAILED_CONNECT_TO_CATALOG, 500, err);
        }
    }
}
