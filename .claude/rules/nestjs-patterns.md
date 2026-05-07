# Rule: NestJS Patterns

Các pattern NestJS chuẩn của dự án. Áp dụng cho mọi module.

---

## Cấu trúc module chuẩn

```
modules/<tên>/
  <tên>.module.ts       ← đăng ký providers, imports, exports
  <tên>.controller.ts   ← nhận HTTP request, validate DTO, gọi service
  <tên>.service.ts      ← business logic
  dto/
    create-<tên>.dto.ts
    update-<tên>.dto.ts
    <tên>-response.dto.ts
  entities/
    <tên>.entity.ts
  enums/
  types/
```

---

## Controller — chỉ làm 3 việc

1. Nhận request + parse params/body
2. Gọi service method
3. Trả response

```typescript
// ĐÚNG
@Post()
async create(@Body() dto: CreateSourceDto): Promise<SuccessResponse<OsintSource>> {
  const source = await this.sourceService.create(dto);
  return { success: true, data: source };
}

// SAI — business logic trong controller
@Post()
async create(@Body() dto: CreateSourceDto) {
  if (dto.sourceType === 'HTML' && !dto.crawlRule.listSelector) {
    throw new BadRequestException('...');  // Validation này thuộc service
  }
  // ...
}
```

---

## Service — inject Repository qua constructor

```typescript
@Injectable()
export class OsintSourceService {
  constructor(
    @InjectRepository(OsintSource)
    private readonly sourceRepo: Repository<OsintSource>,
    // inject services khác nếu cần
    private readonly scoringService: OsintScoringService,
  ) {}
}
```

---

## DTO — dùng class-validator

```typescript
export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(OsintSourceType)
  sourceType: OsintSourceType;

  @IsUrl()
  baseUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  credibilityWeight?: number;
}
```

**Lưu ý:**
- `whitelist: true` và `forbidNonWhitelisted: true` đã được bật global trong `main.ts`
- Không cần tự filter field trong service
- Dùng `@IsOptional()` cho field optional, không dùng `?` mà không có `@IsOptional()`

---

## Error handling

Dùng NestJS built-in exceptions:
```typescript
throw new NotFoundException(`Source ${id} không tìm thấy`);
throw new BadRequestException('crawlRule.listSelector là required khi type=HTML');
throw new ConflictException('Tên source đã tồn tại');
throw new UnprocessableEntityException({ message: '...', details: { field: 'reason' } });
```

Custom HTTP status khi cần:
```typescript
throw new HttpException('Source đang có run đang chạy', HttpStatus.LOCKED); // 423
```

---

## Module registration

Mỗi entity cần `TypeOrmModule.forFeature([EntityClass])` trong module imports:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([OsintSource, OsintRun, OsintRawEvent, OsintObservation, OsintCandidate]),
    // Import module khác nếu cần dùng service của module đó
    IncidentsModule,
  ],
  controllers: [OsintSourceController, ...],
  providers: [OsintSourceService, ...],
  exports: [OsintSourceService], // nếu module khác cần dùng
})
export class OsintModule {}
```

---

## Import paths

Dùng relative path từ file hiện tại — KHÔNG dùng path tuyệt đối bắt đầu bằng `src/`:

```typescript
// ĐÚNG
import { OsintSource } from '../entities/osint-source.entity';
import { applyIncidentFilters } from 'src/common/query-builders/incident-query.builder'; // OK nếu dùng alias

// SAI — path sai gây lỗi khi build
import { OsintModule } from './src/modules/osint/osint.module';
```

---

## Response format

Tất cả controller phải trả theo chuẩn:
```typescript
// Đơn
{ success: true, data: T, message?: string }

// Danh sách
{ success: true, data: { items: T[], page: number, limit: number, total: number } }
```

---

## Không làm

- Không viết SQL thuần trong service (dùng QueryBuilder hoặc Repository methods)
- Ngoại lệ: spatial queries (PostGIS) — dùng `entityManager.query()` và ghi comment lý do
- Không inject `EntityManager` trực tiếp vào service thông thường
- Không dùng `any` trong TypeScript — ghi TODO nếu chưa biết type
