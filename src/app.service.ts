import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Du an Sentinel - An ninh trat tu Khanh Hoa';
  }
}
