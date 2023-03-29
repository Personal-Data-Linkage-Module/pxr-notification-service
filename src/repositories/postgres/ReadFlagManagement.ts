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
    ManyToOne,
    JoinColumn
} from 'typeorm';
import Notification from './Notification';

/**
 * 宛先テーブル エンティティクラス
 */
@Entity('readflag_management')
export default class ReadFlagManagement extends BaseEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id!: number;

    /** 通知ID */
    @Column({ type: 'bigint', name: 'notification_id', nullable: false })
    notificationId: number = 0;

    /** 宛先オペレーターID */
    @Column({ type: 'bigint', name: 'operator_id', nullable: false })
    operatorId: number = 0;

    /** 宛先利用者ID */
    @Column({ type: 'varchar', length: 255, name: 'user_id', nullable: false })
    userId: string = '';

    /** 既読日時 */
    @Column({ type: 'timestamp without time zone', name: 'read_at', nullable: false, default: 'now()' })
    readonly readAt!: Date;

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

    @ManyToOne(type => Notification, notice => notice.readingManagement)
    @JoinColumn({ name: 'notification_id', referencedColumnName: 'id' })
    notification: Notification;
}
