# Agent: API Reviewer

## Mục đích

Review API endpoint (controller + service + DTO) theo spec dự án. Phát hiện thiếu validation, sai response format, business rule chưa implement.

## Kích hoạt khi nào

- Sau khi tạo controller mới
- Trước khi báo task hoàn thành
- Khi review PR liên quan đến API

## Quy trình review

### 1. Đọc spec endpoint

Nếu endpoint thuộc OSINT → đọc `.claude/docs/osint-architecture.md` mục 10 để lấy spec đầy đủ.

### 2. Checklist Controller

- [ ] Route đúng với spec? (`/osint/sources` không phải `/osint/source`)
- [ ] HTTP method đúng? (POST tạo mới, PATCH update partial, PUT replace)
- [ ] Dùng đúng decorator: `@Body()`, `@Param('id')`, `@Query()`
- [ ] Response format đúng: `{ success: true, data: ... }` hoặc `{ success: true, data: { items, page, limit, total } }`
- [ ] Status code đúng: 201 cho POST tạo mới, 200 cho các case còn lại
- [ ] Không có business logic trong controller

### 3. Checklist DTO

- [ ] Tất cả required field có validator (`@IsString()`, `@IsEnum()`...)
- [ ] Optional field có `@IsOptional()` và validator type
- [ ] Số có range validator: `@Min()`, `@Max()`
- [ ] URL có `@IsUrl()`
- [ ] Enum có `@IsEnum(EnumClass)`
- [ ] Nested object có `@ValidateNested()` + `@Type(() => NestedClass)`

### 4. Checklist Service

- [ ] Validate business rules theo spec (ví dụ: không cho sửa source khi có run đang chạy → 423)
- [ ] Ghi audit log nếu spec yêu cầu
- [ ] Cập nhật các field liên quan (ví dụ: khi approve candidate → cập nhật `reviewedAt`, `reviewedBy`)
- [ ] Error message rõ ràng, tiếng Anh (để client hiển thị)
- [ ] Không có N+1 query (dùng `relations` hoặc `JOIN`)

### 5. Output format

```
=== API Review: POST /osint/sources ===

Controller:
✅ Route đúng spec
✅ Response format { success: true, data: OsintSource }
❌ Status code: đang trả 200, spec yêu cầu 201 cho POST tạo mới

DTO (CreateSourceDto):
✅ name: @IsString() @IsNotEmpty()
✅ sourceType: @IsEnum(OsintSourceType)
❌ credibilityWeight: thiếu @Min(0) @Max(1) — có thể nhận giá trị âm hoặc > 1
⚠️  crawlRule: dùng @IsObject() nhưng không validate nested schema — nên dùng @ValidateNested()

Service:
❌ Thiếu check unique name trước khi INSERT — sẽ crash với PG unique constraint error thay vì 409
❌ Thiếu validate CrawlRule schema (listSelector required khi type=HTML) → spec yêu cầu 422
✅ Ghi audit log SOURCE_CREATED

Kết luận: ❌ Cần sửa 4 điểm trước khi merge
```

## Tài liệu tham khảo

- `.claude/docs/osint-architecture.md` — spec API đầy đủ
- `.claude/rules/nestjs-patterns.md` — pattern controller/service/DTO
- `src/modules/incidents/` — ví dụ module chuẩn để tham khảo
