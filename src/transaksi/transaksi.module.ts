import { Module } from '@nestjs/common';
import { TransaksiService } from './transaksi.service';
import { TransaksiController } from './transaksi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [TransaksiController],
    providers: [TransaksiService],
    exports: [TransaksiService],
})
export class TransaksiModule { }