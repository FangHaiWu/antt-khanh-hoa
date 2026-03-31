/**
 * FILE: src/database/generate-test-data.ts
 *
 * MỤC ĐÍCH:
 * - Generate dữ liệu incident lớn (2000–4000 records)
 * - Mỗi xã (ward) 10–50 vụ
 * - Dùng để test dashboard, heatmap, filter
 *
 * YÊU CẦU:
 * - Đã có bảng:
 *   + incident_category
 *   + incident_type
 *   + incident_subtype
 *   + ward (65 xã Khánh Hòa)
 *
 * CHẠY:
 * npx ts-node -r tsconfig-paths/register src/database/generate-test-data.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// ENTITY
import { Incident } from '../modules/incidents/entities/incident.entity';
import { IncidentType } from '../modules/incidents/entities/incidentType.entity';
import { Ward } from '../modules/administrative_unit/entities/wards.entity';

/* ================= TYPES ================= */

type IncidentTemplate = {
  title: string;
  description?: string;
  sourceType: string;
  incidentTypeCode: string;
};

/* ================= UTILS ================= */

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ================= GENERATOR ================= */

function generateIncidents(
  wards: Ward[],
  typeMap: Map<string, IncidentType>,
  templates: IncidentTemplate[],
): Partial<Incident>[] {
  const results: Partial<Incident>[] = [];

  for (const ward of wards) {
    // mỗi xã 10–50 vụ
    let count = randomInt(10, 50);

    // hotspot: Nha Trang nhiều hơn
    if (ward.ten_xa?.includes('Nha Trang')) {
      count += 20;
    }

    for (let i = 0; i < count; i++) {
      const template = randomItem(templates);
      const type = typeMap.get(template.incidentTypeCode);

      if (!type) continue;

      const date = new Date();
      date.setDate(date.getDate() - randomInt(0, 30));
      date.setHours(randomInt(18, 23));

      results.push({
        title: template.title,
        description: template.description ?? undefined,
        incidentTime: date,
        incidentLocation: `Địa bàn ${ward.ten_xa}`,
        sourceType: template.sourceType,
        sourceUrl: undefined,
        incidentType: type,
        ward,
      });
    }
  }

  return results;
}

/* ================= MAIN ================= */

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const incidentRepo = dataSource.getRepository(Incident);
  const typeRepo = dataSource.getRepository(IncidentType);
  const wardRepo = dataSource.getRepository(Ward);

  /**
   * 📌 ĐƯỜNG DẪN JSON
   * File JSON nằm tại:
   * src/database/seeds/data/incidents
   */
  const basePath = path.resolve(__dirname, 'seeds/data/incidents');

  console.log('📂 BASE PATH:', basePath);

  // load template incidents
  const templates = JSON.parse(
    fs.readFileSync(`${basePath}/incident.json`, 'utf-8'),
  ) as IncidentTemplate[];

  // load type
  const types = await typeRepo.find();
  const typeMap = new Map<string, IncidentType>();
  types.forEach((t) => typeMap.set(t.code, t));

  // load ward
  const wards = await wardRepo.find();

  console.log(`📍 Loaded wards: ${wards.length}`);

  // generate data
  const incidents = generateIncidents(wards, typeMap, templates);

  console.log(`🔥 Generated incidents: ${incidents.length}`);

  // insert DB
  await incidentRepo.save(incidents);

  console.log('✅ INSERT DONE');

  await app.close();
}

/* ================= RUN ================= */

run().catch((err) => {
  console.error('❌ ERROR:', err);
  process.exit(1);
});
