export enum OsintSourceStatus {
  DRAFT = 'draft', // vua tao, chua validate
  ACTIVE = 'active', // dang hoat dong, scheduler crawl
  PAUSED = 'paused', // tam dung (manual hoac auto sau 5 lan fail)
  DISABLED = 'disabled', // vo hieu hoa vinh vien
}
