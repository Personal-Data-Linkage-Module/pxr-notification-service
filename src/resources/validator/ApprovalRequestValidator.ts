/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    Middleware,
    ExpressMiddlewareInterface
} from 'routing-controllers';
import { transformAndValidate } from 'class-transformer-validator';
import PutApprovalReqDto from '../dto/PutApprovalReqDto';
import AppError from '../../common/AppError';
import ApprovalManaged from '../../repositories/postgres/ApprovalManaged';
import Config from '../../common/Config';
import express = require('express');
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

/**
 * 承認操作APIのバリデーションチェッククラス
 */
@Middleware({ type: 'before' })
export default class ApprovalRequestValidator implements ExpressMiddlewareInterface {
    async use (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
        // 空かどうか判定し、空と判定した場合にはエラーをスローする
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, 400);
        }
        const dto = await transformAndValidate(
            PutApprovalReqDto, request.body
        ) as PutApprovalReqDto;
        // 否認ステータスでも承認ステータスでもない場合
        if (dto.status !== ApprovalManaged.UN_APPROVAL_STATUS && dto.status !== ApprovalManaged.APPROVAL_STATUS) {
            throw new AppError(Message.UNEXPECTED_STATUS_NUMBER, 400);

        // 否認かつコメント無しならエラー
        } else if (!dto.comment && dto.status === ApprovalManaged.UN_APPROVAL_STATUS) {
            throw new AppError(Message.UNEXPECTED_UNCOMMENT_WITH_UNAPPROVED, 400);
        }

        next();
    }
}
