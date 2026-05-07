export interface ParseRule {
  //Pattern trich xuat dia diem tu text
  locationPattern?: string[]; // Regex pattern để trích xuất địa điểm
  // Vi du: ["tai {location}", "o {location}", "tai dia diem {location}", duong {location}"]

  // Tu khoa phan loai incident type - map sang

  incidentTypeKeywords?: Record<string, string[]>; // Map từ incident type code sang danh sách từ khóa
  // Ví dụ: 
  // "CUOP_GIAT": ["cuop giat", "cuop tai san", "cuop", "giat"],
  // "TNGT": ["tai nan giao thong", "tngt", "giao thong", "tai nan"],
  // 
  titleField: string; // Trường dùng để lấy tiêu đề bài viết
  bodyField: string; // Trường dùng để lấy nội dung bài viết
  dateField: string; // Trường dùng để lấy thời gian bài viết
  locationField?: string; // Trường dùng để lấy vị trí (nếu có)
  eventIdField?: string; // Trường dùng để lấy ID sự kiện (nếu có)
}
