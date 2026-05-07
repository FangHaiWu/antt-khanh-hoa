# /gen-entity — Sinh TypeORM entity

Tạo TypeORM entity với đầy đủ decorator, comment tiếng Việt, index cần thiết.

## Cách dùng

```
/gen-entity <tên-entity> [--module <tên-module>]
```

Ví dụ: `/gen-entity osint-alert --module osint`

## Yêu cầu khi thực thi

1. **Đọc trước** `.claude/rules/typeorm-safety.md` và `.claude/rules/comment-style.md`
2. **Hỏi** các thông tin sau trước khi sinh code:
   - Các fields cần có (tên, type, nullable?)
   - Relations với entity nào?
   - Fields nào hay được filter/sort? (để thêm `@Index`)
   - Có soft delete không?

3. **Template chuẩn:**

```typescript
// <tên>.entity.ts
// <Mô tả entity làm gì, vai trò trong hệ thống>
// Được dùng bởi: <service nào, workflow nào>

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('<table_name>')
export class <ClassName> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // <giải thích field nếu không hiển nhiên>
  @Column()
  fieldName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Checklist sau khi tạo

- [ ] UUID PK
- [ ] Nullable field có `| null` trong TypeScript type
- [ ] Enum field có `type: 'enum', enum: EnumClass`
- [ ] JSONB field có interface type (không dùng `any`)
- [ ] Index cho field hay query
- [ ] Relation có FK column riêng (`sourceId: string`)
- [ ] File đã có header comment

## Nguy cơ lỗi cần báo

- Thêm giá trị vào enum PostgreSQL cần migration thủ công (ALTER TYPE)
- Relation với `onDelete: 'CASCADE'` sẽ xóa record liên quan khi parent bị xóa — xác nhận với user
- `synchronize: true` không handle đổi tên column đúng (sẽ DROP + CREATE)
