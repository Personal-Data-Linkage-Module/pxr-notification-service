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
    IsDefined,
    Max,
    Min
} from 'class-validator';
import { transformToBooleanFromString, transformToNumber, transformToDate } from '../../common/Transform';
/* eslint-enable */

/**
 * GET: 通知リストの取得リクエストDTO
 */
export default class GetNotificationReqDto {
    /** 送信フラグ */
    @Transform(({ value }) => { return transformToBooleanFromString(value); })
    @IsBoolean()
    @IsDefined()
    @Expose({ name: 'is_send' })
        isSend: boolean;

    /** 既読フラグ */
    @Transform(({ value }) => { return transformToBooleanFromString(value); })
    @IsBoolean()
    @IsDefined()
    @Expose({ name: 'is_unread' })
        isUnread: boolean;

    /** 承認済みフラグ */
    @Transform(({ value }) => { return transformToBooleanFromString(value); })
    @IsBoolean()
    @IsDefined()
    @Expose({ name: 'is_approval' })
        isApproval: boolean;

    /** 最大件数 */
    @Transform(({ value }) => { return transformToNumber(value); })
    @IsNumber()
    @IsDefined()
        num: number;

    /** 種別 */
    @Transform(({ value }) => { return transformToNumber(value); })
    @IsNumber()
    @IsDefined()
        type: number;

    /** 送信日時の絞り込み範囲 */
    @Transform(({ value }) => { return transformToDate(value); })
    @IsOptional()
    @IsDate()
        from: Date;

    /** 送信日時の絞り込み範囲 */
    @Transform(({ value }) => { return transformToDate(value); })
    @IsOptional()
    @IsDate()
        to: Date;

    /** カテゴリーカタログコード */
    @Transform(({ value }) => { return transformToNumber(value); })
    @Max(Number.MAX_SAFE_INTEGER)
    @Min(1)
    @IsNumber()
    @IsOptional()
        category: number;
}
