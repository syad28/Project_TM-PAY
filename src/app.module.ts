import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransaksiModule } from './transaksi/transaksi.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TabunganModule } from './tabungan/tabungan.module';
import { AdminModule } from './admin/admin.module';

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
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
}) export class AppModule { }
