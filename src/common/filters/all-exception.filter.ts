import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Terjadi kesalahan internal';

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    statusCode = HttpStatus.BAD_REQUEST;
                    message = 'Data sudah ada';
                    break;
                case 'P2003':
                    statusCode = HttpStatus.BAD_REQUEST;
                    message = 'Data terkait tidak ditemukan';
                    break;
                default:
                    message = `Database error: ${exception.code}`;
            }
        }
        else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();
            message =
                typeof res === 'string'
                    ? res : (res as any).message || 'Terjadi kesalahan';
        } else if (exception instanceof Error) {
            message = exception.message;
        }
        response.status(statusCode).json({
            statusCode,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}