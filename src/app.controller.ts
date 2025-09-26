import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'TMPay API IS running',
      version: '1.0.0',
      endpoints: ['/users', '/transaksi']
    };
  }
  @Get('health')
  healthCheck() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
