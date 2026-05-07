# /gen-module — Sinh NestJS module boilerplate

Tạo cấu trúc module NestJS đầy đủ theo convention dự án antt-khanh-hoa.

## Cách dùng

```
/gen-module <tên-module>
```

Ví dụ: `/gen-module alert` sẽ tạo `src/modules/alert/`

## Yêu cầu khi thực thi

1. **Đọc trước** `.claude/rules/nestjs-patterns.md` và `.claude/rules/comment-style.md`
2. Tạo các file theo cấu trúc sau:

```
src/modules/<tên>/
  <tên>.module.ts
  <tên>.controller.ts
  <tên>.controller.spec.ts
  <tên>.service.ts
  <tên>.service.spec.ts
  dto/
    create-<tên>.dto.ts
    update-<tên>.dto.ts
  entities/
    <tên>.entity.ts
```

3. **Header comment** bắt buộc ở đầu mỗi file (tiếng Việt)
4. **Entity:** UUID PK, `@CreateDateColumn()`, `@UpdateDateColumn()`
5. **DTO:** `class-validator` decorators đầy đủ
6. **Service:** inject Repository qua constructor, method `findAll`, `findOne`, `create`, `update`, `remove`
7. **Controller:** response format `{ success: true, data: ... }`
8. **Module:** đăng ký `TypeOrmModule.forFeature([Entity])`

## Sau khi tạo file

Hỏi: "Bạn có muốn tôi đăng ký `<TênModule>` vào `AppModule` không?" rồi đợi xác nhận trước khi sửa `app.module.ts`.

## Nguy cơ lỗi cần báo

- Entity có field nullable phải khai báo `| null` trong TypeScript type
- Nếu có relation với module khác, cần import module đó vào module mới
- Enum columns cần migration khi thêm giá trị mới
