/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import AppError from '../../common/AppError';
import OperatorDomain from '../../domains/OperatorDomain';
import { transformAndValidate } from 'class-transformer-validator';
import AddNotificationReqDto from '../../resources/dto/AddNotificationReqDto';
import Notification from '../../repositories/postgres/Notification';
/* eslint-enable */
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 通知追加APIのバリデーションチェッククラス
 */
@Middleware({ type: 'before' })
export default class AddRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // 空かどうか判定し、空と判定した場合にはエラーをスローする
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, 400);
        }
        const dto = await transformAndValidate(
            AddNotificationReqDto, request.body
        ) as AddNotificationReqDto;
        // オペレータータイプの数値を確認、期待しない値はエラーとする
        if (![OperatorDomain.TYPE_PERSONAL_NUMBER, OperatorDomain.TYPE_APPLICATION_NUMBER, OperatorDomain.TYPE_MANAGER_NUMBER].includes(dto.destination.operatorType)) {
            throw new AppError(Message.UNEXPECTED_OPERATOR_TYPE, 400);
        }
        // 通知種別が期待しない値はエラー
        if (dto.type !== 0 && dto.type !== 1) {
            throw new AppError(Message.UNEXPECTED_NOTICE_TYPE, 400);
        }
        // 宛先オペレーターの種別が個人ではない場合、PXR-IDの指定はエラー
        if (dto.destination.operatorType !== 0 && Array.isArray(dto.destination.pxrId) && dto.destination.pxrId.length > 0) {
            throw new AppError('個人オペレーター以外を宛先とした場合、PXR-IDによる個別宛先の指定はできません', 400);
        }
        // 個別送信時に宛先情報がないとエラー
        if (
            !dto.destination.isSendAll &&
            (!Array.isArray(dto.destination.userId) || !dto.destination.userId.length) &&
            (!Array.isArray(dto.destination.operatorId) || !dto.destination.operatorId.length) &&
            (!Array.isArray(dto.destination.pxrId) || !dto.destination.pxrId.length)
        ) {
            throw new AppError(Message.UNEXPECTED_DESTINATION_ARE_NOT_EXISTS_FOR_INDIVIDUALLY_SEND, 400);
        }
        // オペレーターIDとユーザーID, PXR-IDを同時に指定されている場合はエラー
        const i = Array.isArray(dto.destination.userId) && dto.destination.userId.length > 0 ? 1 : 0;
        const n = Array.isArray(dto.destination.operatorId) && dto.destination.operatorId.length > 0 ? 1 : 0;
        const p = dto.destination.operatorType === 0 && Array.isArray(dto.destination.pxrId) && dto.destination.pxrId.length > 0 ? 1 : 0;
        if (i + n + p >= 2) {
            throw new AppError(Message.UNEXPECTED_IS_BOTH_DESTINATION_ARE_EXISTS, 400);
        }
        // 承認タイプの場合に通知URLが未設定はエラー
        if (
            dto.type === Notification.APPROVAL_TYPE && (
                !dto.approval || typeof dto.approval !== 'object' || !dto.approval.noticeUrl ||
                !/^(?!(https?:\/\/))[A-Za-z0-9%$/&=?-]*$/.test(dto.approval.noticeUrl)
            )
        ) {
            throw new AppError(Message.UNEXPECTED_NOT_SET_NOTICE_URL_WHEN_APPROVAL_TYPE_REQUEST, 400);
        }

        next();
    }
}
