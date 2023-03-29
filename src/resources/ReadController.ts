/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Put, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import ReadNotificationReqDto from './dto/ReadNotificationReqDto';
import ReadNotificationResDto from './dto/ReadNotificationResDto';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import OperatorService from '../services/OperatorService';
import NotificationService from '../services/NotificationService';
import EntityOperation from '../repositories/EntityOperation';
import ReadRequestValidator from './validator/ReadRequestValidator';
/* eslint-enable */

@JsonController('/notification')
export default class ReadController {
    @Put('/')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(ReadRequestValidator)
    async putRead (@Req() req: Request, @Body() dto: ReadNotificationReqDto, @Res() res: Response): Promise<any> {
        // セッションからオペレーター情報を取得する
        const operator = await OperatorService.authMe(req);

        // 更新の整合を確認する
        const entity = await NotificationService.checkUpdateRequest(2, dto.id, operator);

        // 更新内容を保存
        await EntityOperation.saveEntity(entity);

        // レスポンスを生成して終了
        return new ReadNotificationResDto();
    }
}
