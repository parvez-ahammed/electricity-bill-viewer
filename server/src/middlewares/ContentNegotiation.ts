import logger from '@helpers/Logger';
import { Request, Response, NextFunction } from 'express';
import { jsonToXml } from 'src/utility/jsonToXmlUtility';

const FORMATS = {
    JSON: 'application/json',
    HTML: 'text/html',
    XML: 'application/xml',
    TEXT: 'text/plain',
};

export function contentNegotiation(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const originalSend = res.send.bind(res);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.send = (body: any) => {
        if (res.headersSent) {
            logger.warn(
                'Attempted to send response after headers were already sent.'
            );
            return res; // Don't call send again!
        }

        const format = req.accepts(Object.values(FORMATS)) || FORMATS.JSON;

        if (typeof body !== 'string') {
            try {
                body = JSON.stringify(body, null, 2);
            } catch (e) {
                logger.error('Failed to serialize response body:');
                logger.error(e);
                res.setHeader('Content-Type', FORMATS.TEXT);
                return originalSend('Response serialization error');
            }
        }

        const formatHandlers: Record<string, (body: string) => string> = {
            [FORMATS.JSON]: (body) => body,
            [FORMATS.HTML]: (body) => `<pre>${body}</pre>`,
            [FORMATS.XML]: (body) => {
                try {
                    return jsonToXml(JSON.parse(body));
                } catch (e) {
                    logger.error('Failed to convert JSON to XML:');
                    logger.error(e);
                    return '<error>Invalid JSON for XML conversion</error>';
                }
            },
            [FORMATS.TEXT]: (body) => body,
        };

        const handler = formatHandlers[format];

        if (!handler) {
            res.setHeader('Content-Type', FORMATS.TEXT);
            return originalSend('Not Acceptable');
        }

        res.setHeader('Content-Type', format);
        return originalSend(handler(body));
    };

    next();
}
