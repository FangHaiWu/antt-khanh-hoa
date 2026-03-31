import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

import { IncidentCategory } from '../../../../modules/incidents/entities/incidentCategory.entity';
import { IncidentType } from '../../../../modules/incidents/entities/incidentType.entity';
import { IncidentSubtype } from '../../../../modules/incidents/entities/incidentSubtype.entity';
import { Incident } from '../../../../modules/incidents/entities/incident.entity';
import { Ward } from '../../../../modules/administrative_unit/entities/wards.entity';

/* ================= TYPES ================= */

type CategoryJson = {
  code: string;
  name: string;
};

type TypeJson = {
  code: string;
  name: string;
  lawCode: string | null;
  categoryCode: string;
};

type SubtypeJson = {
  code: string;
  name: string;
  typeCode: string;
};

type IncidentJson = {
  title: string;
  description?: string;
  incidentTime: string;
  incidentLocation: string;
  sourceType: string;
  sourceUrl?: string | null;
  incidentTypeCode: string;
  ma_xa?: string;
};

/* ================= HELPERS ================= */

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/* ================= SEED ================= */

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const categoryRepo = dataSource.getRepository(IncidentCategory);
  const typeRepo = dataSource.getRepository(IncidentType);
  const subtypeRepo = dataSource.getRepository(IncidentSubtype);
  const incidentRepo = dataSource.getRepository(Incident);
  const wardRepo = dataSource.getRepository(Ward);

  const basePath = __dirname;
  console.log('BASE PATH:', basePath);
  /* ===== LOAD JSON ===== */
  const categoryJson = readJsonFile<CategoryJson[]>(
    `${basePath}/incident-category.json`,
  );

  const typeJson = readJsonFile<TypeJson[]>(`${basePath}/incident-type.json`);

  const subtypeJson = readJsonFile<SubtypeJson[]>(
    `${basePath}/incident-subtype.json`,
  );

  const incidentJson = readJsonFile<IncidentJson[]>(
    `${basePath}/incident.json`,
  );

  /* ===== CLEAR DATA (DEV ONLY) ===== */
  console.log('🧹 Clearing old data...');
  await incidentRepo.createQueryBuilder().delete().execute();
  await subtypeRepo.createQueryBuilder().delete().execute();
  await typeRepo.createQueryBuilder().delete().execute();
  await categoryRepo.createQueryBuilder().delete().execute();

  /* ===== CATEGORY ===== */
  console.log('Seeding category...');
  const categories = await categoryRepo.save(categoryJson);

  const categoryMap = new Map<string, IncidentCategory>();
  categories.forEach((c) => categoryMap.set(c.code, c));

  /* ===== TYPE ===== */
  console.log('Seeding type...');

  const types = typeJson.map((t): Partial<IncidentType> => {
    const category = categoryMap.get(t.categoryCode);
    if (!category) {
      throw new Error(`Category not found: ${t.categoryCode}`);
    }

    return {
      code: t.code,
      name: t.name,
      lawCode: t.lawCode ?? undefined,
      category,
    };
  });

  const savedTypes = await typeRepo.save(types);

  const typeMap = new Map<string, IncidentType>();
  savedTypes.forEach((t) => {
    if (!t.code) {
      throw new Error('Type missing code after save');
    }
    typeMap.set(t.code, t);
  });

  /* ===== SUBTYPE ===== */
  console.log('Seeding subtype...');

  const subtypes = subtypeJson.map((s): Partial<IncidentSubtype> => {
    const type = typeMap.get(s.typeCode);
    if (!type) {
      throw new Error(`Type not found: ${s.typeCode}`);
    }

    return {
      code: s.code,
      name: s.name,
      incidentType: type,
    };
  });

  await subtypeRepo.save(subtypes);

  /* ===== WARD ===== */
  console.log('Loading wards...');
  const wards = await wardRepo.find();

  const wardMap = new Map<string, Ward>();
  wards.forEach((w) => wardMap.set(w.ma_xa, w));

  /* ===== INCIDENT ===== */
  console.log('Seeding incident...');

  const incidents = incidentJson.map((i): Partial<Incident> => {
    const type = typeMap.get(i.incidentTypeCode);
    if (!type) {
      throw new Error(`Type not found: ${i.incidentTypeCode}`);
    }

    const ward = i.ma_xa ? wardMap.get(i.ma_xa) : undefined;

    return {
      title: i.title,
      description: i.description ?? undefined,
      incidentTime: new Date(i.incidentTime),
      incidentLocation: i.incidentLocation,
      sourceType: i.sourceType,
      sourceUrl: i.sourceUrl ?? undefined,
      incidentType: type,
      ward: ward ?? undefined,
    };
  });

  await incidentRepo.save(incidents);

  console.log('✅ SEED DONE');

  await app.close();
}
/* ================= RUN ================= */

seed().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error('❌ SEED ERROR:', err.message);
  } else {
    console.error('❌ SEED ERROR:', err);
  }
  process.exit(1);
});
