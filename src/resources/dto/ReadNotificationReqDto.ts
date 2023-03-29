/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Transform } from 'class-transformer';
import {
    IsNumber,
    IsDefined
} from 'class-validator';

/**
 * PUT: 通知に対する既読操作のリクエストDTO
 */
export default class ReadNotificationReqDto {
    @Transform((t: any): number => {
        const result = parseInt(t);
        if (isNaN(result)) {
            return t;
        }
        return result;
    })
    @IsNumber()
    @IsDefined()
    id: number;
}
