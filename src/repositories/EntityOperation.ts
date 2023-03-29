/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Notification from './postgres/Notification';
import { connectDatabase } from '../common/Connection';
import { getRepository, BaseEntity, getConnection } from 'typeorm';
import ApprovalManaged from './postgres/ApprovalManaged';
import NotificationDestination from './postgres/NotificationDestination';
/* eslint-enable */
import moment = require('moment-timezone');

/**
 * 各エンティティ操作クラス
 */
export default class EntityOperation {
    /** 日付のフォーマット（データベース用） */
    static readonly DATE_TIME_FORMAT_DATABASE = 'YYYY-MM-DD HH:mm:ss.SSS';

    /**
     * 通知エンティティを条件に一致したものを全て取得する
     * @param type 種別
     * @param isSend 送信フラグ
     * @param isUnread 既読フラグ
     * @param isApproval 承認済みフラグ
     * @param num 最大取得件数
     * @param toDate 絞り込み日付（至）
     * @param fromDate 絞り込み日付
     * @param operatorId オペレーターID
     */
    static async takeNotification (
        type: number,
        isSend: boolean,
        isUnread: boolean,
        isApproval: boolean,
        num: number,
        toDate: Date,
        fromDate: Date,
        operatorId: number,
        operatorType: number,
        toBlockCode: number
    ): Promise<Notification[]> {
        const connection = getConnection('postgres');
        const sendFromMe = isSend
            ? ' AND notification.fromOperatorId = :operatorId' : '';
        const sendToMe = !isSend
            ? ' AND ((notificationDestination.destinationOperatorId = :operatorId AND notification.isSendAll = false) OR (notification.toBlockCatalogCode = :toBlockCode AND notification.toOperatorType = :operatorType AND notification.isSendAll = true))' : '';
        const approved = isApproval
            ? ' AND approvalManaged.status <> 0' : '';
        const filterDate = ((): string => {
            let q = '';
            if (toDate) {
                q += ' AND notification.sendAt <= :toDate';
            }
            if (fromDate) {
                q += ' AND notification.sendAt >= :fromDate';
            }
            return q;
        })();
        try {
            const repository = connection.getRepository(Notification);
            if (type === Notification.APPROVAL_TYPE) {
                const entities = repository.createQueryBuilder('notification')
                    .innerJoinAndSelect(
                        'notification.destinations',
                        'notificationDestination',
                        'notificationDestination.isDisabled = false'
                    )
                    .innerJoinAndSelect(
                        'notification.approvalManaged',
                        'approvalManaged',
                        'approvalManaged.isDisabled = false' + approved
                    )
                    .leftJoinAndSelect(
                        'notification.readingManagement',
                        'readingManagement',
                        'readingManagement.isDisabled = false AND readingManagement.operatorId = :operatorId'
                    )
                    .andWhere('notification.type = 1' + sendToMe)
                    .andWhere(
                        'notification.isDisabled = false' +
                            sendFromMe +
                            filterDate
                        , {
                            operatorId,
                            operatorType,
                            toBlockCode,
                            toDate: moment(toDate).format(this.DATE_TIME_FORMAT_DATABASE),
                            fromDate: moment(fromDate).format(this.DATE_TIME_FORMAT_DATABASE)
                        }
                    );
                if (isUnread) {
                    entities.andWhere(
                        'readingManagement.id IS NULL'
                    );
                }
                entities.limit(num > 0 ? num : null)
                    .orderBy('notification.id', 'DESC');

                return entities.getMany();
            } else {
                const entities = repository.createQueryBuilder('notification')
                    .innerJoinAndSelect(
                        'notification.destinations',
                        'notificationDestination',
                        'notificationDestination.isDisabled = false'
                    )
                    .leftJoinAndSelect(
                        'notification.readingManagement',
                        'readingManagement',
                        'readingManagement.isDisabled = false AND readingManagement.operatorId = :operatorId'
                    )
                    .andWhere('notification.type = 0' + sendToMe)
                    .andWhere(
                        'notification.isDisabled = false' +
                            sendFromMe +
                            filterDate
                        , {
                            operatorId,
                            operatorType,
                            toBlockCode,
                            toDate: moment(toDate).format(this.DATE_TIME_FORMAT_DATABASE),
                            fromDate: moment(fromDate).format(this.DATE_TIME_FORMAT_DATABASE)
                        }
                    );
                if (isUnread) {
                    entities.andWhere(
                        'readingManagement.id IS NULL'
                    );
                }
                entities.limit(num > 0 ? num : null)
                    .orderBy('notification.id', 'DESC');

                return entities.getMany();
            }
        } finally {
            // await connection.close();
        }
    }

    /**
     * 通知IDをキーに、関連付されているエンティティを含めてオブジェクトを取得する
     * @param notificationId 通知ID
     */
    static async takeRelationalEntityWithApprovalType (notificationId: number): Promise<Notification> {
        const connection = getConnection('postgres');
        try {
            const repository = connection.getRepository(Notification);
            const entity = await repository.createQueryBuilder('notification')
                .innerJoinAndSelect(
                    'notification.destinations',
                    'notificationDestination',
                    'notificationDestination.isDisabled = false'
                )
                .innerJoinAndSelect(
                    'notification.approvalManaged',
                    'approvalManaged',
                    'approvalManaged.isDisabled = false'
                )
                .leftJoinAndSelect(
                    'notification.readingManagement',
                    'readingManagement',
                    'readingManagement.isDisabled = false'
                )
                .andWhere('notification.id = :id', { id: notificationId })
                .andWhere('notification.isDisabled = false')
                .andWhere('notification.type = 1')
                .getOne();
            return entity;
        } finally {
            // await connection.close();
        }
    }

    /**
     * 通知IDをキーに、関連付されているエンティティを含めてオブジェクトを取得する
     * @param notificationId 通知ID
     */
    static async takeRelationalEntity (notificationId: number): Promise<Notification> {
        const connection = getConnection('postgres');
        try {
            const repository = connection.getRepository(Notification);
            const entity = await repository.createQueryBuilder('notification')
                .innerJoinAndSelect(
                    'notification.destinations',
                    'notificationDestination',
                    'notificationDestination.isDisabled = false'
                )
                .leftJoinAndSelect(
                    'notification.readingManagement',
                    'readingManagement',
                    'readingManagement.isDisabled = false'
                )
                .andWhere('notification.id = :id', { id: notificationId })
                .andWhere('notification.isDisabled = false')
                .getOne();
            return entity;
        } finally {
            // await connection.close();
        }
    }

    /**
     * エンティティの登録|更新（共通）
     * @param entity
     */
    static async saveEntity<T extends BaseEntity> (entity: T): Promise<T> {
        const connection = getConnection('postgres');
        const queryRunner = connection.createQueryRunner();
        try {
            const ret = await queryRunner.manager.save(entity);
            return ret;
        } finally {
            await queryRunner.release();
            // await connection.close();
        }
    }

    /**
     * 通知エンティティを関連レコードを含め、登録する
     * @param entity
     */
    static async saveNotificationEntity (entity: Notification): Promise<Notification> {
        const connection = getConnection('postgres');
        try {
            const repository = connection.getRepository(Notification);
            const result = await repository.save(entity);
            const destRepository = connection.getRepository(NotificationDestination);
            if (entity.destinations && Array.isArray(entity.destinations)) {
                for (const dest of entity.destinations) {
                    dest.notificationId = result.id;
                    await destRepository.save(dest);
                }
            }
            if (entity.approvalManaged) {
                const appRepository = connection.getRepository(ApprovalManaged);
                entity.approvalManaged.notificationId = result.id;
                await appRepository.save(entity.approvalManaged);
            }
            return result;
        } finally {
            // await connection.close();
        }
    }
}
