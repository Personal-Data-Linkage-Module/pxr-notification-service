/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import OperatorDomain from '../domains/OperatorDomain';
import Notification from '../repositories/postgres/Notification';
import EntityOperation from '../repositories/EntityOperation';
import AppError from '../common/AppError';
import ApprovalManaged from '../repositories/postgres/ApprovalManaged';
import NotificationDestination from '../repositories/postgres/NotificationDestination';
import ReadFlagManagement from '../repositories/postgres/ReadFlagManagement';
import GetNotificationReqDto from '../resources/dto/GetNotificationReqDto';
import AddNotificationReqDto from '../resources/dto/AddNotificationReqDto';
import OperatorService from './OperatorService';
import BookManageService from './BookManageService';
import { Request } from 'express';
import ProxyRequestDomain from '../domains/ProxyRequestDomain';
import CatalogService from './CatalogService';
import ProxyService from './ProxyService';
import { applicationLogger } from '../common/logging';
/* eslint-enable */
import Config from '../common/Config';
import moment = require('moment-timezone');
import config = require('config');
const Message = Config.ReadConfig('./config/message.json');

/**
 * 通知サービス
 */
export default class NotificationService {
    /**
     * リクエストされた内容から、更新内容をエンティティに反映させる
     * 戻り値は未保存状態
     * @param type リクエスト種別(2: 既読操作 | 3: 承認操作)
     * @param id 通知ID
     * @param operator オペレーター情報
     * リファクタ履歴
     *  separate : getNotificationEntity（通知エンティティを取得）
     */
    static async checkUpdateRequest (
        type: 2 | 3, id: number, operator: OperatorDomain, status?: number, comment?: string
    ): Promise<any> {
        // 通知エンティティを取得
        const entity = await NotificationService.getNotificationEntity(type, id, operator);

        // 既読操作をリクエストされた場合
        if (type === 2) {
            // 既読済みか確認する
            for (const readingManage of entity.readingManagement) {
                if (readingManage.operatorId + '' === operator.operatorId + '') {
                    throw new AppError(Message.ALREADY_READ, 204);
                }
            }
            const readFlagManagement = new ReadFlagManagement();
            readFlagManagement.notificationId = entity.id;
            readFlagManagement.operatorId = operator.operatorId;
            readFlagManagement.userId = operator.loginId;
            readFlagManagement.createdBy = operator.loginId;
            readFlagManagement.updatedBy = operator.loginId;
            readFlagManagement.notification = entity;
            return readFlagManagement;

        // 承認操作をリクエストされた場合
        } else {
            // 承認操作済み or 有効期限切れ
            if (entity.approvalManaged.status !== ApprovalManaged.NON_APPROVAL_STATUS) {
                throw new AppError(Message.ALREADY_APPROVAL_OPERATED, 400);
            } else if (entity.approvalManaged.expirationAt.getTime() <= new Date().getTime()) {
                throw new AppError(Message.TARGET_IS_EXPIRED, 400);
            }
            entity.approvalManaged.status = status;
            entity.approvalManaged.approvalAt = new Date();
            entity.approvalManaged.comment = comment;
            return entity;
        }
    }

    /**
     * 通知エンティティを取得
     * @param type リクエスト種別(2: 既読操作 | 3: 承認操作)
     * @param id 通知ID
     * @param operator オペレーター情報
     */
    private static async getNotificationEntity (type: number, id: number, operator: OperatorDomain) {
        const entity = type === 3
            ? await EntityOperation.takeRelationalEntityWithApprovalType(id)
            : await EntityOperation.takeRelationalEntity(id);
        if (!entity) {
            throw new AppError(Message.NOT_EXISTS_TARGET, 400);
        }

        let destination: NotificationDestination;
        for (const dest of entity.destinations) {
            if (dest.destinationOperatorId + '' === operator.operatorId + '') {
                destination = dest;
                break;
            }
        }
        // 操作権限なし
        if (
            !destination &&
            !(
                (
                    entity.destinations.length === 1 &&
                    !entity.destinations[0].destinationOperatorId &&
                    !entity.destinations[0].destinationUserId
                ) &&
                entity.toBlockCatalogCode + '' === operator.blockCode + ''
            )
        ) {
            throw new AppError(Message.NO_OPERATION_AUTHORITY, 401);
        }
        return entity;
    }

    /**
     * 通知一覧を取得する
     * @param dto リクエスト情報
     * @param operator オペレーター情報
     */
    static async takeEntities (dto: GetNotificationReqDto, operator: OperatorDomain): Promise<Notification[]> {
        const entities = await EntityOperation.takeNotification(
            dto.type, dto.isSend, dto.isUnread, dto.isApproval,
            dto.num, dto.to, dto.from, operator.operatorId, operator.type,
            operator.blockCode);
        if (entities.length <= 0) {
            throw new AppError(Message.NOT_EXISTS_NOTIFICATION, 204);
        }

        return entities;
    }

    /**
     * DTOからエンティティを形成する
     * @param dto リクエスト情報
     * @param operator オペレーター情報
     */
    static async parseToEntity (
        dto: AddNotificationReqDto, operator: OperatorDomain
    ): Promise<Notification> {
        if (dto.type === Notification.APPROVAL_TYPE) {
            dto.approval.expirationAt =
            moment()
                .add(parseInt(config.get('defaultExpiration')), 'days')
                .toDate();
        }

        const entity = new Notification();
        entity.type = dto.type;
        entity.title = dto.title;
        entity.content = dto.content;
        entity.attributes = JSON.stringify(dto.attribute || {});
        entity.fromBlockCatalogCode = operator.blockCode;
        entity.fromOperatorId = operator.operatorId;
        entity.fromActorCode = operator.actorCode;
        entity.fromActorVersion = operator.actorVersion;
        entity.toOperatorType = dto.destination.operatorType;
        entity.toBlockCatalogCode = dto.destination.blockCode;
        entity.isSendAll = dto.destination.isSendAll;
        entity.categoryCatalogCode = dto.category._value;
        entity.categoryCatalogVersion = dto.category._ver;
        entity.sendAt = new Date();
        entity.isTransfer = false;
        entity.createdBy = operator.loginId;
        entity.updatedBy = operator.loginId;
        if (entity.type === Notification.APPROVAL_TYPE) {
            entity.approvalManaged = new ApprovalManaged();
            entity.approvalManaged.noticeBlockCode = dto.approval.noticeBlockCode;
            entity.approvalManaged.noticeUrl = dto.approval.noticeUrl;
            entity.approvalManaged.expirationAt = moment(dto.approval.expirationAt).toDate();
            entity.approvalManaged.createdBy = operator.loginId;
            entity.approvalManaged.updatedBy = operator.loginId;
        }
        return entity;
    }

    /**
     * Block間で通知情報を連携する
     * @param entity エンティティ
     * @param operator オペレーター情報
     */
    static async doLinkingAddInformation (
        entity: Notification, operator: OperatorDomain, req: Request) {
        if (entity.toBlockCatalogCode === operator.blockCode) {
            return;
        }
        entity.isTransfer = true;
        const data = JSON.stringify(req.body);
        const detail: ProxyRequestDomain = {
            fromBlock: entity.fromBlockCatalogCode,
            fromPath: '/notification',
            toBlock: entity.toBlockCatalogCode,
            toPath: '/notification/transfer',
            options: {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                body: data
            }
        };
        await ProxyService.call(detail, operator);
    }

    /**
     * 宛先となるオペレーター情報を取得してエンティティへ追加する
     * @param entity エンティティ
     * @param dto リクエスト情報
     * リファクタ履歴
     *  separate : takeOperatorService（オペレーターサービスへ問い合わせ）
     */
    static async acquireOperatorForEntity (
        entity: Notification, dto: AddNotificationReqDto, operator: OperatorDomain
    ) {
        // 転送済みなら
        if (entity.isTransfer) {
            return;
        }

        // オペレーターサービスへ問い合わせる
        const map = await NotificationService.takeOperatorService(entity, dto, operator);

        // 宛先ブロックコードのアクター情報を取得する
        let { actorCode, actorVersion } = await CatalogService.getActorCatalogFromBlock(dto.destination.blockCode, operator);

        if (!actorCode) {
            actorCode = null;
            actorVersion = null;
        }

        // 全体送信が有効の場合は、宛先管理レコードを一つだけ追加する
        if (dto.destination.isSendAll) {
            const destination = new NotificationDestination();
            destination.destinationUserId = null;
            destination.destinationOperatorId = null;
            destination.actorCode = actorCode;
            destination.actorVersion = actorVersion;
            destination.notification = entity;
            destination.createdBy = operator.loginId;
            destination.updatedBy = operator.loginId;
            entity.destinations = [destination];

        // 無効ならば、取得した情報を元に、宛先管理レコードをその分追加する
        } else {
            // 取得できた情報から宛先管理テーブル
            const keys = [...map.keys()];
            entity.destinations = [];
            for (const operatorId of keys) {
                const userId = map.get(operatorId);
                const destination = new NotificationDestination();
                destination.destinationUserId = userId;
                destination.destinationOperatorId = operatorId;
                destination.createdBy = operator.loginId;
                destination.updatedBy = operator.loginId;
                destination.actorCode = actorCode;
                destination.actorVersion = actorVersion;
                destination.notification = entity;

                entity.destinations.push(destination);
            }
        }
    }

    /**
     * オペレーターサービスへ問い合わせ
     * @param entity エンティティ
     * @param dto リクエスト情報
     * @param operator オペレーター情報
     */
    private static async takeOperatorService (entity: Notification, dto: AddNotificationReqDto, operator: OperatorDomain) {
        const map = new Map<number, string>();
        if (entity.isSendAll) {
            // 全体送信フラグが有効の場合、オペレーターの存在確認不要
        } else if (Array.isArray(dto.destination.operatorId) && dto.destination.operatorId.length > 0) {
            for (const operatorId of dto.destination.operatorId) {
                const targetOperator = await OperatorService.takeOperatorWithOperatorId(operatorId, operator);
                map.set(targetOperator.operatorId, targetOperator.loginId);
            }
        } else if (Array.isArray(dto.destination.userId) && dto.destination.userId.length > 0) {
            for (const userId of dto.destination.userId) {
                const pxrId = await BookManageService.getPxrIdFromUserId(userId, dto.from.applicationCode, operator);
                const targetOperator = await OperatorService.takeOperatorWithPxrId(pxrId, operator);
                map.set(targetOperator.operatorId, targetOperator.loginId);
            }
        } else {
            for (const pxrId of dto.destination.pxrId) {
                const targetOperator = await OperatorService.takeOperatorWithPxrId(pxrId, operator);
                map.set(targetOperator.operatorId, targetOperator.loginId);
            }
        }
        return map;
    }
}
