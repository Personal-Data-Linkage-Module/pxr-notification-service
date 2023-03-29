/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    JsonController, Get, UseBefore, Req, Body, Res, Header, Post, Params
} from 'routing-controllers';
import GetRequestValidator from './validator/GetRequestValidator';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import GetNotificationReqDto from './dto/GetNotificationReqDto';
import OperatorService from '../services/OperatorService';
import { Request, Response } from 'express';
import NotificationService from '../services/NotificationService';
import GetNotificationResDto from './dto/GetNotificationResDto';
import AddRequestValidator from './validator/AddRequestValidator';
import AddNotificationReqDto from './dto/AddNotificationReqDto';
import EntityOperation from '../repositories/EntityOperation';
import AddNotificationResDto from './dto/AddNotificationResDto';
import { transformAndValidate } from 'class-transformer-validator';
import CatalogService from '../services/CatalogService';
/* eslint-enable */

@JsonController('/notification')
export default class NotificationController {
    @Get('/')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(GetRequestValidator)
    async getNotification (@Req() req: Request): Promise<any> {
        const dto = await transformAndValidate(
            GetNotificationReqDto, req.query
        ) as GetNotificationReqDto;

        // オペレーターセッション情報を取得する
        const operator = await OperatorService.authMe(req);

        // エンティティの取得
        const entities = await NotificationService.takeEntities(dto, operator);

        // レスポンスを生成して終了
        return GetNotificationResDto.parseEntities(entities, dto.isSend);
    }

    @Post('/')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(AddRequestValidator)
    async addNotification (@Req() req: Request, @Body() dto: AddNotificationReqDto, @Res() res: Response): Promise<any> {
        // オペレーターセッション情報を取得する
        const operator = await OperatorService.authMe(req);

        /** リクエストされたコードの整合を確認する */
        dto.category._ver = await CatalogService.checkAttributes(
            operator,
            dto.destination.blockCode,
            dto.category._value,
            dto.category._ver
        );

        // エンティティを生成する
        const entity = await NotificationService.parseToEntity(dto, operator);

        // 必要があれば、宛先Blockへの連携を行う
        await NotificationService.doLinkingAddInformation(entity, operator, req);

        // 必要があれば、宛先となるオペレーター情報を取得し、エンティティへ追加する
        await NotificationService.acquireOperatorForEntity(entity, dto, operator);

        // エンティティを保存する
        const result = await EntityOperation.saveNotificationEntity(entity);

        // レスポンスを生成して終了
        return AddNotificationResDto.parseEntity(result);
    }
}
