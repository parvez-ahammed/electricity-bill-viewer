/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from 'express';

export class ResponseBuilder {
    private res: Response;
    private statusCode: number;
    private message: string;

    private data: any;

    constructor(res: Response) {
        this.res = res;
        this.statusCode = 200;
        this.message = 'Success';
        this.data = null;
    }

    setStatus(statusCode: number) {
        this.statusCode = statusCode;
        return this;
    }

    setMessage(message: string) {
        this.message = message;
        return this;
    }

    setData(data: any) {
        this.data = data;
        return this;
    }

    send() {
        return this.res.status(this.statusCode).send({
            status: 'success',
            message: this.message,
            data: this.data,
        });
    }

    sendError() {
        return this.res.status(this.statusCode).send({
            status: 'error',
            message: this.message,
            data: this.data,
        });
    }
}
