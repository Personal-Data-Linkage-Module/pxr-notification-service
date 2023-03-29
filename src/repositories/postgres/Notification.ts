/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn
} from 'typeorm';
import NotificationDestination from './NotificationDestination';
import ApprovalManaged from './ApprovalManaged';
import ReadFlagManagement from './ReadFlagManagement';
/* eslint-enable */

/**
 * 通知テーブル エンティティクラス
 */
@Entity('notification')
export default class Notification extends BaseEntity {
    /** 通知タイプ */
    public static readonly NOTIFICATION_TYPE = 0;

    /** 承認要求タイプ */
    public static readonly APPROVAL_TYPE = 1;

    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id!: number;

    /** 通知種別 */
    @Column({ type: 'smallint', nullable: false })
    type: number = 0;

    /** 送信元Blockカタログコード */
    @Column({ type: 'bigint', nullable: false, name: 'from_block_catalog_code' })
    fromBlockCatalogCode: number = 0;

    /** 送信元オペレーターID */
    @Column({ type: 'bigint', nullable: false, name: 'from_operator_id' })
    fromOperatorId: number = 0;

    /** 差出元アクターコード */
    @Column({ type: 'bigint', nullable: false, name: 'from_actor_code' })
    fromActorCode: number;

    /** 送信元アクターバージョン */
    @Column({ type: 'bigint', nullable: false, name: 'from_actor_version' })
    fromActorVersion: number;

    /** 宛先Blockカタログコード */
    @Column({ type: 'bigint', nullable: false, name: 'to_block_catalog_code' })
    toBlockCatalogCode: number = 0;

    /** 送信オペレーター種別 */
    @Column({ type: 'smallint', nullable: false, name: 'to_operator_type' })
    toOperatorType: number = 0;

    /** カテゴリーカタログコード */
    @Column({ type: 'bigint', nullable: false, name: 'category_catalog_code' })
    categoryCatalogCode: number;

    /** カテゴリーカタログバージョン */
    @Column({ type: 'bigint', nullable: false, name: 'category_catalog_version' })
    categoryCatalogVersion: number;

    /** 全体送信フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_send_all' })
    isSendAll: boolean = false;

    /** タイトル */
    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string = '';

    /** 内容 */
    @Column({ type: 'text', nullable: false })
    content: string = '';

    /** 属性 */
    @Column({ type: 'text', default: '' })
    attributes: string = '';

    /** 送信日時 */
    @Column({ type: 'timestamp without time zone', name: 'send_at' })
    sendAt: Date = new Date();

    /** 転送フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_transfer' })
    isTransfer: boolean = false;

    /** 無効フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', name: 'created_at' })
    readonly createdAt!: Date;

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', name: 'updated_at', onUpdate: 'now()' })
    readonly updatedAt!: Date;

    /** 宛先管理テーブルのレコード */
    @OneToMany(type => NotificationDestination, dest => dest.notification)
    @JoinColumn({ name: 'id', referencedColumnName: 'notificationId' })
    destinations: NotificationDestination[];

    /** 既読フラグ管理のレコード */
    @OneToMany(type => ReadFlagManagement, readFlag => readFlag.notification)
    @JoinColumn({ name: 'id', referencedColumnName: 'notification_id' })
    readingManagement: ReadFlagManagement[];

    /** 承認管理テーブルのレコード */
    @OneToOne(type => ApprovalManaged, approvalManaged => approvalManaged.notification)
    @JoinColumn({ name: 'id', referencedColumnName: 'notificationId' })
    approvalManaged: ApprovalManaged;
}
