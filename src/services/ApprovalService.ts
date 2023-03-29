/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

/* eslint-disable */
import Notification from '../repositories/postgres/Notification';
import NotificationDestination from '../repositories/postgres/NotificationDestination';
import ProxyRequestDomain from '../domains/ProxyRequestDomain';
import AppError from '../common/AppError';
/* eslint-enable */

/**
 * 承認操作サービス
 */
export default class ApprovalService {
    /**
     * 承認操作から、通知URLへ連携する内容を生成する
     * @param operator
     * @param entity
     */
    public static async linkage (entity: Notification): Promise<ProxyRequestDomain> {
        const data = JSON.stringify({
            status: entity.approvalManaged.status,
            comment: entity.approvalManaged.comment
        });
        const detail: ProxyRequestDomain = new ProxyRequestDomain({
            toBlock: entity.approvalManaged.noticeBlockCode,
            toPath: entity.approvalManaged.noticeUrl,
            fromBlock: entity.toBlockCatalogCode,
            fromPath: '/notification/approval',
            options: {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                body: data
            }
        });
        return detail;
    }
}
