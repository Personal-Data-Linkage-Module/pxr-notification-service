/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import express = require("express");
import { Server } from "net";

export class StubBookManageServer {
    app: express.Application;
    server: Server;
    constructor (status: number) {
        const _listener = (req: express.Request, res: express.Response) => {
            res.status(status);
            if (status === 200) {
                res.json({
                    pxrId: 'taro.test.org'
                });
            }
            res.end();
        };
        this.app = express();
        this.app.post('/search/user', _listener);
        this.app.post('/book-manage/search/user', _listener);
        this.server = this.app.listen(3005);
    }
}
