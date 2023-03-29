/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

// SDE-IMPL-REQUIRED 本ファイルをコピーして外部サービスに公開する REST API インタフェースを定義します。

/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Put, Body, Header, Res, Req, UseBefore,
} from 'routing-controllers';
import PutApprovalReqDto from './dto/PutApprovalReqDto';
import ApprovalService from '../services/ApprovalService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import ApprovalRequestValidator from './validator/ApprovalRequestValidator';
import OperatorService from '../services/OperatorService';
import EntityOperation from '../repositories/EntityOperation';
import ProxyService from '../services/ProxyService';
import NotificationService from '../services/NotificationService';
/* eslint-enable */

// SDE-IMPL-REQUIRED REST API のベースルートを指定します。("/")をベースルートにする場合は引数なしとしてください。
@JsonController('/notification')
export default class ApprovalController {
    @Put('/approval')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(ApprovalRequestValidator)
    async putApproval (@Req() req: Request, @Body() dto: PutApprovalReqDto, @Res() res: Response): Promise<any> {
        // オペレーターセッション情報を取得する
        const operator = await OperatorService.authMe(req);

        // データベースとの整合を確認
        const entity = await NotificationService.checkUpdateRequest(
            3, dto.id, operator, dto.status, dto.comment);

        // 連携内容を生成
        const detail = await ApprovalService.linkage(entity);

        // 承認内容を通知URLへ連携する
        const proxyResponse = await ProxyService.call(detail, operator);

        // データベースに登録
        await EntityOperation.saveEntity(entity.approvalManaged);

        // レスポンスを生成する
        return proxyResponse;
    }
}
