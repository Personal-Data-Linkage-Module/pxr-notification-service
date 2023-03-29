/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Notification from '../../repositories/postgres/Notification';
import { transformFromDateTimeToString } from '../../common/Transform';
/* eslint-enable */
import moment = require('moment-timezone');
import config = require('config');

/**
 * GET: 通知リスト取得レスポンスDTO
 */
export default class GetNotificationResDto {
    /**
     * 取得できた配列をレスポンス用オブジェクトとして生成する
     * @param entities エンティティの配列
     */
    static parseEntities (entities: Notification[], isSend: boolean): any[] {
        // 自身が送信した通知リストをリクエストされた場合
        if (isSend) {
            const array: any[] = [];
            for (const entity of entities) {
                // 宛先管理エンティティの配列から、オペレーター情報を奪取
                const toOperatorIds: number[] = [];
                const toUserIds: string[] = [];
                let actorCode = null;
                let actorVersion = null;
                for (const dest of entity.destinations) {
                    toOperatorIds.push(dest.destinationOperatorId);
                    toUserIds.push(dest.destinationUserId);
                    actorCode = dest.actorCode;
                    actorVersion = dest.actorVersion;
                }

                // 承認要求タイプの場合
                if (entity.type === Notification.APPROVAL_TYPE) {
                    array.push({
                        id: Number(entity.id),
                        type: entity.type,
                        title: entity.title,
                        content: entity.content,
                        attribute: !entity.attributes ? entity.attributes : JSON.parse(entity.attributes),
                        category: {
                            _value: entity.categoryCatalogCode ? Number(entity.categoryCatalogCode) : null,
                            _ver: entity.categoryCatalogVersion ? Number(entity.categoryCatalogVersion) : null
                        },
                        from: {
                            blockCode: entity.fromBlockCatalogCode ? Number(entity.fromBlockCatalogCode) : null,
                            operatorId: entity.fromOperatorId ? Number(entity.fromOperatorId) : null,
                            actor: {
                                _value: entity.fromActorCode ? Number(entity.fromActorCode) : null,
                                _ver: entity.fromActorVersion ? Number(entity.fromActorVersion) : null
                            }
                        },
                        destination: {
                            blockCode: entity.toBlockCatalogCode ? Number(entity.toBlockCatalogCode) : null,
                            operatorType: entity.toOperatorType,
                            isSendAll: entity.isSendAll,
                            operatorId: entity.isSendAll ? null : toOperatorIds,
                            userId: entity.isSendAll ? null : toUserIds,
                            actor: {
                                _value: actorCode ? Number(actorCode) : null,
                                _ver: actorVersion ? Number(actorVersion) : null
                            }
                        },
                        approval: {
                            operatorId: entity.approvalManaged.approvalOperatorId ? Number(entity.approvalManaged.approvalOperatorId) : null,
                            status: entity.approvalManaged.status,
                            approvalAt: moment(entity.approvalManaged.approvalAt).isValid()
                                ? transformFromDateTimeToString(config.get('timezone'), entity.approvalManaged.approvalAt)
                                : null,
                            expirationAt: moment(entity.approvalManaged.expirationAt).isValid()
                                ? transformFromDateTimeToString(config.get('timezone'), entity.approvalManaged.expirationAt)
                                : null
                        },
                        sendAt: moment(entity.sendAt).isValid()
                            ? transformFromDateTimeToString(config.get('timezone'), entity.sendAt)
                            : null,
                        is_transfer: entity.isTransfer
                    });

                // 通知タイプの場合
                } else {
                    array.push({
                        id: Number(entity.id),
                        type: entity.type,
                        title: entity.title,
                        content: entity.content,
                        attribute: !entity.attributes ? entity.attributes : JSON.parse(entity.attributes),
                        category: {
                            _value: entity.categoryCatalogCode ? Number(entity.categoryCatalogCode) : null,
                            _ver: entity.categoryCatalogVersion ? Number(entity.categoryCatalogVersion) : null
                        },
                        from: {
                            blockCode: entity.fromBlockCatalogCode ? Number(entity.fromBlockCatalogCode) : null,
                            operatorId: entity.fromOperatorId ? Number(entity.fromOperatorId) : null,
                            actor: {
                                _value: entity.fromActorCode ? Number(entity.fromActorCode) : null,
                                _ver: entity.fromActorVersion ? Number(entity.fromActorVersion) : null
                            }
                        },
                        destination: {
                            blockCode: entity.toBlockCatalogCode ? Number(entity.toBlockCatalogCode) : null,
                            operatorType: entity.toOperatorType,
                            isSendAll: entity.isSendAll,
                            operatorId: entity.isSendAll ? null : toOperatorIds,
                            userId: entity.isSendAll ? null : toUserIds,
                            actor: {
                                _value: actorCode ? Number(actorCode) : null,
                                _ver: actorVersion ? Number(actorVersion) : null
                            }
                        },
                        sendAt: moment(entity.sendAt).isValid()
                            ? transformFromDateTimeToString(config.get('timezone'), entity.sendAt)
                            : null,
                        is_transfer: entity.isTransfer
                    });
                }
            }
            return array;

        // 自身が受け取り手の通知リストをリクエストされた場合
        } else {
            const array: any[] = [];
            for (const entity of entities) {
                // 承認要求タイプの場合
                if (entity.type === Notification.APPROVAL_TYPE) {
                    array.push({
                        id: Number(entity.id),
                        type: entity.type,
                        title: entity.title,
                        content: entity.content,
                        attribute: JSON.parse(entity.attributes),
                        category: {
                            _value: entity.categoryCatalogCode ? Number(entity.categoryCatalogCode) : null,
                            _ver: entity.categoryCatalogVersion ? Number(entity.categoryCatalogVersion) : null
                        },
                        from: {
                            blockCode: entity.fromBlockCatalogCode ? Number(entity.fromBlockCatalogCode) : null,
                            operatorId: entity.fromOperatorId ? Number(entity.fromOperatorId) : null,
                            actor: {
                                _value: entity.fromActorCode ? Number(entity.fromActorCode) : null,
                                _ver: entity.fromActorVersion ? Number(entity.fromActorVersion) : null
                            }
                        },
                        approval: {
                            operatorId: entity.approvalManaged.approvalOperatorId ? Number(entity.approvalManaged.approvalOperatorId) : null,
                            status: entity.approvalManaged.status,
                            approvalAt: moment(entity.approvalManaged.approvalAt).isValid()
                                ? transformFromDateTimeToString(config.get('timezone'), entity.approvalManaged.approvalAt)
                                : null,
                            expirationAt: moment(entity.approvalManaged.expirationAt).isValid()
                                ? transformFromDateTimeToString(config.get('timezone'), entity.approvalManaged.expirationAt)
                                : null
                        },
                        readAt: entity.readingManagement && entity.readingManagement[0]
                            ? transformFromDateTimeToString(config.get('timezone'), entity.readingManagement[0].readAt)
                            : null,
                        sendAt: moment(entity.sendAt).isValid()
                            ? transformFromDateTimeToString(config.get('timezone'), entity.sendAt)
                            : null,
                        is_transfer: entity.isTransfer
                    });

                // 通知タイプの場合
                } else {
                    array.push({
                        id: Number(entity.id),
                        type: entity.type,
                        title: entity.title,
                        content: entity.content,
                        attribute: JSON.parse(entity.attributes),
                        category: {
                            _value: entity.categoryCatalogCode ? Number(entity.categoryCatalogCode) : null,
                            _ver: entity.categoryCatalogVersion ? Number(entity.categoryCatalogVersion) : null
                        },
                        from: {
                            blockCode: entity.fromBlockCatalogCode ? Number(entity.fromBlockCatalogCode) : null,
                            operatorId: entity.fromOperatorId ? Number(entity.fromOperatorId) : null,
                            actor: {
                                _value: entity.fromActorCode ? Number(entity.fromActorCode) : null,
                                _ver: entity.fromActorVersion ? Number(entity.fromActorVersion) : null
                            }
                        },
                        readAt: entity.readingManagement && entity.readingManagement[0]
                            ? transformFromDateTimeToString(config.get('timezone'), entity.readingManagement[0].readAt)
                            : null,
                        sendAt: moment(entity.sendAt).isValid()
                            ? transformFromDateTimeToString(config.get('timezone'), entity.sendAt)
                            : null,
                        is_transfer: entity.isTransfer
                    });
                }
            }
            return array;
        }
    }
}
