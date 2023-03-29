/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Notification from '../../repositories/postgres/Notification';
import moment = require('moment-timezone');
import { transformFromDateTimeToString } from '../../common/Transform';
/* eslint-enable */
import config = require('config');

/**
 * POST: 通知追加のレスポンスDTO
 */
export default class AddNotificationResDto {
    /**
     * 追加した通知の内容からレスポンスを生成する
     * @param entity エンティティ
     */
    static parseEntity (entity: Notification): any {
        const operatorIdList = [];
        const userIdList = [];
        if (entity.destinations && Array.isArray(entity.destinations)) {
            for (const dest of entity.destinations) {
                operatorIdList.push(dest.destinationOperatorId);
                userIdList.push(dest.destinationUserId);
            }
        }
        const r: any = {
            id: entity.id,
            type: entity.type,
            title: entity.title,
            content: entity.content,
            attribute: JSON.parse(entity.attributes),
            category: {
                _value: entity.categoryCatalogCode,
                _ver: entity.categoryCatalogVersion
            },
            from: {
                blockCode: entity.fromBlockCatalogCode,
                operatorId: entity.fromOperatorId,
                actor: {
                    _value: entity.fromActorCode,
                    _ver: entity.fromActorVersion
                }
            },
            sendAt: transformFromDateTimeToString(config.get('timezone'), entity.sendAt),
            is_transfer: entity.isTransfer
        };
        if (entity.type === Notification.APPROVAL_TYPE) {
            r.approval = {
                expirationAt: transformFromDateTimeToString(config.get('timezone'), entity.approvalManaged.expirationAt)
            };
        }
        r.destination = {
            blockCode: entity.toBlockCatalogCode,
            operatorType: entity.toOperatorType,
            isSendAll: entity.isSendAll
        };
        if (!entity.isSendAll && !entity.isTransfer) {
            r.destination.userId = userIdList;
            r.destination.operatorId = operatorIdList;
        }
        return r;
    }
}
