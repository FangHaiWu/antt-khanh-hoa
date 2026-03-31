import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdministrativeUnitModule } from './modules/administrative_unit/administrative_unit.module';
import { IncidentsController } from './modules/incidents/incidents.controller';
import { IncidentsModule } from './modules/incidents/incidents.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, //dev only, set to false in production
      entities: ['dist/**/*.entity{.ts,.js}'],
    }),
    AdministrativeUnitModule,
    IncidentsModule,
  ],
  controllers: [AppController, IncidentsController],
  providers: [AppService],
})
export class AppModule {}
