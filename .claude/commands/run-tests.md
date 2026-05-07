# /run-tests — Chạy test cho module

## Cách dùng

```
/run-tests [tên-module]
/run-tests osint
/run-tests            ← chạy tất cả
```

## Việc cần làm khi thực thi

1. Chạy lệnh phù hợp:

```bash
# Chạy test 1 module
npm run test -- --testPathPattern=src/modules/<tên-module>

# Chạy tất cả
npm run test

# Chạy với coverage
npm run test:cov -- --testPathPattern=src/modules/<tên-module>
```

2. **Phân tích output** và báo cáo:
   - Số test passed / failed / skipped
   - Test nào fail và lý do cụ thể
   - Coverage % (nếu chạy với `--coverage`)

3. **Nếu có test fail:**
   - Đọc error message và stack trace
   - Chỉ ra nguyên nhân (mock thiếu, assertion sai, business logic thay đổi...)
   - Đề xuất fix — nhưng **hỏi xác nhận** trước khi sửa code

## Nguy cơ lỗi thường gặp trong dự án này

- **Repository not provided:** Quên mock repository trong test module
  ```typescript
  // Cần thêm trong TestingModule
  { provide: getRepositoryToken(OsintSource), useValue: mockRepo }
  ```

- **PostGIS functions:** `ST_DWithin`, `ST_Contains` không hoạt động trong SQLite in-memory test
  → Cần mock service hoặc dùng PostgreSQL test DB

- **Enum mismatch:** Enum value trong test khác với enum trong code sau khi refactor

## Cách fix test nhanh

```bash
# Chạy chỉ 1 test file
npm run test -- --testPathPattern=osint-source.service.spec

# Watch mode khi đang fix
npm run test:watch -- --testPathPattern=<tên>
```
