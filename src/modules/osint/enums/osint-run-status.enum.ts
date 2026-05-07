export enum OsintRunStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  PARTIAL_SUCCESS = 'partial_success', // crawl thanh cong nhung co loi parse 1 phan
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
