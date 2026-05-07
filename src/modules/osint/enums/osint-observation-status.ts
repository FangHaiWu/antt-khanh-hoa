export enum OsintObservationStatus {
  DRAFT = 'draft', // vua tao tu parse
  NORMALIZED = 'normalized', // da chuan hoa text
  ENRICHED = 'enriched', // da geocode, map ward
  VALIDATED = 'validated', // analyst da kiem tra
  NEEDS_REVIEW = 'needs_review', // confidence thap, can nguoi duyet
  REJECTED = 'rejected', // bi tu choi
}
