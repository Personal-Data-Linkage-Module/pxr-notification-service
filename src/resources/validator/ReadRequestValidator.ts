/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { transformAndValidate } from 'class-transformer-validator';
import ReadNotificationReqDto from '../../resources/dto/ReadNotificationReqDto';
import AppError from '../../common/AppError';
/* eslint-enable */
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

@Middleware({ type: 'before' })
export default class ReadRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction): Promise<void> {
        // 空かどうか判定し、空と判定した場合にはエラーをスローする
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, 400);
        }
        await transformAndValidate(
            ReadNotificationReqDto,
            request.body
        );

        next();
    }
}
