/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Transform, Expose } from 'class-transformer';
import {
    IsNumber,
    IsDate,
    IsBoolean,
    IsOptional,
    IsDefined
} from 'class-validator';
import { transformToBooleanFromString, transformToNumber, transformToDate } from '../../common/Transform';
/* eslint-enable */

/**
 * GET: 通知リストの取得リクエストDTO
 */
export default class GetNotificationReqDto {
    /** 送信フラグ */
    @Transform(transformToBooleanFromString)
    @IsBoolean()
    @IsDefined()
    @Expose({ name: 'is_send' })
    isSend: boolean;

    /** 既読フラグ */
    @Transform(transformToBooleanFromString)
    @IsBoolean()
    @IsDefined()
    @Expose({ name: 'is_unread' })
    isUnread: boolean;

    /** 承認済みフラグ */
    @Transform(transformToBooleanFromString)
    @IsBoolean()
    @IsDefined()
    @Expose({ name: 'is_approval' })
    isApproval: boolean;

    /** 最大件数 */
    @Transform(transformToNumber)
    @IsNumber()
    @IsDefined()
    num: number;

    /** 種別 */
    @Transform(transformToNumber)
    @IsNumber()
    @IsDefined()
    type: number;

    /** 送信日時の絞り込み範囲 */
    @Transform(transformToDate)
    @IsOptional()
    @IsDate()
    from: Date;

    /** 送信日時の絞り込み範囲 */
    @Transform(transformToDate)
    @IsOptional()
    @IsDate()
    to: Date;
}
