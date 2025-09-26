import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type TranslateResult = { status: number; message: string };

export function translatePrismaError(
    error: unknown,
    ctx?: { model?: string; action?: string; fieldMap?: Record<string, string> }
): TranslateResult {
    const model = ctx?.model ?? 'Record';
    const fieldMap = ctx?.fieldMap ?? {};

    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {

        return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: (error as any)?.message ?? 'Terjadi Kesalahan' };
    }

    const code = error.code;

    const targetRaw = (error.meta as any)?.target;
    let target = '';
    if (Array.isArray(targetRaw)) target = targetRaw.join(', ');
    else if (typeof targetRaw === 'string') target = targetRaw;
    switch (code) {
        case 'P2002':
            if (target) {

                if (model.toLowerCase() === 'user' && target.toLowerCase().includes('email')) {
                    return { status: HttpStatus.CONFLICT, message: 'Email sudah terdaftar' };
                }
                return {
                    status: HttpStatus.CONFLICT,
                    message: `Nilai duplikat pada field: ${target}`,
                };
            }
            return { status: HttpStatus.CONFLICT, message: 'Nilai duplikat ditemukan' };

        case 'P2025':
            return { status: HttpStatus.NOT_FOUND, message: `${model} tidak ditemukan` };

        case 'P2003':
            if (target.toLowerCase().includes('userid') || target.toLowerCase().includes('userId'.toLowerCase())) {
                return { status: HttpStatus.BAD_REQUEST, message: 'User tidak ditemukan' };
            }
            if (target.toLowerCase().includes('tabunganid') || target.toLowerCase().includes('tabunganId'.toLowerCase())) {
                return { status: HttpStatus.BAD_REQUEST, message: 'Tabungan tidak ditemukan' };
            }
            return { status: HttpStatus.BAD_REQUEST, message: 'Referensi data tidak ditemukan' };

        default:
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: `Database error: ${code}` };
    }
}