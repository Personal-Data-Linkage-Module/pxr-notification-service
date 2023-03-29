/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToOne
} from 'typeorm';
import Notification from './Notification';

/**
 * 承認管理テーブル エンティティクラス
 */
@Entity('approval_managed')
export default class ApprovalManaged extends BaseEntity {
    /** 未承認ステータス */
    public static readonly NON_APPROVAL_STATUS = 0;

    /** 承認済みステータス */
    public static readonly APPROVAL_STATUS = 1;

    /** 非承認ステータス */
    public static readonly UN_APPROVAL_STATUS = 2;

    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id!: number;

    /** 通知ID */
    @Column({ type: 'bigint', name: 'notification_id' })
    notificationId: number = 0;

    /** 承認操作のオペレーターID */
    @Column({ type: 'bigint', name: 'approver_operator_id' })
    approvalOperatorId: number = 0;

    /** 承認ステータス */
    @Column({ type: 'smallint', nullable: false, default: 0 })
    status: number = 0;

    /** コメント */
    @Column({ type: 'varchar', length: 255, name: 'comment' })
    comment: string;

    /** 承認日時 */
    @Column({ type: 'timestamp without time zone', name: 'approval_at' })
    approvalAt: Date | null = null;

    /** 通知Block */
    @Column({ type: 'bigint', nullable: false, name: 'notice_block_code' })
    noticeBlockCode: number = 0;

    /** 通知URL */
    @Column({ type: 'text', nullable: false, name: 'notice_url' })
    noticeUrl: string = '';

    /** 有効期限 */
    @Column({ type: 'timestamp without time zone', name: 'expiration_at' })
    expirationAt: Date = new Date();

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

    /** 通知エンティティ */
    @OneToOne(type => Notification, notice => notice.approvalManaged)
    @JoinColumn({ name: 'notification_id', referencedColumnName: 'id' })
    notification: Notification
}
