/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    IsDefined,
    IsString,
    IsArray,
    IsNumber,
    IsInt,
    ValidateNested,
    IsDate,
    IsOptional,
    IsBoolean,
    ValidateIf
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { transformToDateTime, transformToBooleanFromString } from '../../common/Transform';
import 'reflect-metadata';
import Notification from '../../repositories/postgres/Notification';

export class Category {
    @IsNumber()
    @IsDefined()
    _value: number;

    @IsNumber()
    @IsOptional()
    _ver: number;
}

export class From {
    @IsNumber()
    @IsOptional()
    applicationCode: number;

    @IsNumber()
    @IsOptional()
    workflowCode: number;
}

export class Destination {
    @IsNumber()
    @IsDefined()
    blockCode: number;

    @IsNumber()
    @IsDefined()
    operatorType: number;

    @Transform(transformToBooleanFromString)
    @IsBoolean()
    @IsDefined()
    isSendAll: boolean;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    operatorId: number[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    userId: string[] = [];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    pxrId: string[] = [];
}

export class Approval {
    @IsNumber()
    @IsDefined()
    noticeBlockCode: number;

    @IsString()
    @IsDefined()
    noticeUrl: string;

    @Transform(transformToDateTime)
    @IsDate()
    @IsOptional()
    expirationAt: Date;
}
/* eslint-enable */

/**
 * POST: 通知追加のリクエストDTO
 */
export default class AddNotificationReqDto {
    @IsNumber()
    @IsDefined()
    type: number;

    @IsString()
    @IsDefined()
    title: string;

    @IsString()
    @IsDefined()
    content: string;

    @ValidateNested()
    @IsOptional()
    attribute?: any;

    @IsOptional()
    @Type(() => From)
    @ValidateNested()
    from: From;

    @IsDefined()
    @Type(() => Category)
    @ValidateNested()
    category: Category;

    @IsDefined()
    @Type(() => Destination)
    @ValidateNested()
    destination: Destination;

    @Type(() => Approval)
    @ValidateNested()
    @ValidateIf(o => o.type === Notification.APPROVAL_TYPE)
    approval?: Approval;
}
