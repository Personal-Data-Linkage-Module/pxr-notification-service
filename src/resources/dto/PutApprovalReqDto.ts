/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    IsString,
    IsNumber,
    IsDefined,
    IsOptional
} from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';
/* eslint-enable */

/**
 * PUT: 承認要求に対する承認操作のリクエストDTO
 */
export default class PutApprovalReqDto {
    /** コメント */
    @IsString()
    @IsOptional()
    comment: string = '';

    /** 操作対象の通知ID */
    @Transform(transformToNumber)
    @IsNumber()
    @IsDefined()
    id: number;

    /** 承認結果ステータス */
    @Transform(transformToNumber)
    @IsNumber()
    @IsDefined()
    status: number;
}
