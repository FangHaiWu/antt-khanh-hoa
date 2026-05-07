# /check-module — Kiểm tra module đã đăng ký đúng chưa

Kiểm tra nhanh một module có được đăng ký đầy đủ không.

## Cách dùng

```
/check-module <tên-module>
```

Ví dụ: `/check-module osint`

## Việc cần làm khi thực thi

1. **Đọc** `src/app.module.ts`
2. **Đọc** `src/modules/<tên>/<tên>.module.ts`
3. Kiểm tra danh sách sau và báo cáo kết quả:

### Checklist

**Trong AppModule:**
- [ ] Import statement đúng path (không có `./src/` lồng nhau)
- [ ] Module class được thêm vào `imports[]`

**Trong `<tên>.module.ts`:**
- [ ] `TypeOrmModule.forFeature([...entities])` đã import đủ entity
- [ ] Tất cả controllers đã khai báo trong `controllers[]`
- [ ] Tất cả services đã khai báo trong `providers[]`
- [ ] Services nào cần export cho module khác đã trong `exports[]`
- [ ] Module khác được import nếu dùng service của module đó

**Import paths trong file:**
- [ ] Không có path dạng `'./src/...'` (path lồng nhau)
- [ ] Không có circular import

## Output mẫu

```
✅ AppModule: OsintModule đã import, path đúng
✅ osint.module.ts: TypeOrmModule có đủ 5 entities
❌ osint.module.ts: OsintScoringService chưa có trong providers[]
⚠️  osint.module.ts: OsintSourceService chưa được export (có module khác cần dùng không?)
```

## Sau khi kiểm tra

Nếu phát hiện vấn đề, **hỏi xác nhận** trước khi sửa. Ưu tiên sửa từng vấn đề nhỏ thay vì rewrite toàn bộ file.
