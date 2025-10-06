import { Module } from '@nestjs/common';
import { TabunganService } from './tabungan.service';
import { TabunganController } from './tabungan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TransaksiModule } from 'src/transaksi/transaksi.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [PrismaModule],
    controllers: [TabunganController],
    providers: [TabunganService],
    exports: [TabunganService],
})
export class TabunganModule { }

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'tmpay-default-secret-key-change-this-in-production',
                signOptions: {
                    expiresIn: configService.get<string>('JWT_SECRET') || '1d',
                    issuer: 'tmpay_api',
                    audience: 'tmpay-users',
                },
            }),
            inject: [ConfigService],
        }),
        PrismaModule,
        TransaksiModule,
        UsersModule,
        TabunganModule,
    ],
    controllers: [AppController],
    providers: [AppService],
}) export class AppModule {
}
