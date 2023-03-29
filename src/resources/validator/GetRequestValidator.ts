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
import AppError from '../../common/AppError';
import GetNotificationReqDto from '../../resources/dto/GetNotificationReqDto';
import Notification from '../../repositories/postgres/Notification';
import Config from '../../common/Config';
import express = require('express');
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

@Middleware({ type: 'before' })
export default class GetRequestValidator implements ExpressMiddlewareInterface {
    async use (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
        const dto = await transformAndValidate(
            GetNotificationReqDto, request.query
        ) as GetNotificationReqDto;

        // 種別が期待する値か
        if (
            dto.type !== Notification.APPROVAL_TYPE &&
            dto.type !== Notification.NOTIFICATION_TYPE
        ) {
            throw new AppError(
                Message.UNEXPECTED_NOTICE_TYPE, 400
            );
        }

        next();
    }
}
