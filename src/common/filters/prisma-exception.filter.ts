import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let message = 'Internal server error';
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (exception.code === 'P2002') {
            statusCode = HttpStatus.BAD_REQUEST;
            message = 'email ini sudah terdaftar';
            response.status(statusCode).json({
                statusCode, message
            });
        }
    }
}