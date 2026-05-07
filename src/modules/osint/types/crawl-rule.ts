type CrawlRuleType = 'RSS' | 'HTML' | 'API';

export interface CrawlRule {
  type: CrawlRuleType;

  // Đối với type 'HTML'
  listSelector?: string; // CSS Selector để lấy danh sách bài viết
  titleSelector?: string; // CSS Selector để lấy tiêu đề bài viết
  contentSelector?: string; // CSS Selector để lấy nội dung bài viết
  linkSelector?: string; // CSS Selector để lấy link bài viết
  dateSelector?: string; // CSS Selector để lấy thời gian bài viết
  dateFormat?: string; // Định dạng ngày tháng nếu cần parse DD/MM/YYYY HH:mm

  // Đối với type 'RSS'
  // Khong can selector vi RSS da co san dinh dang, chi can field de map

  // Đối với type 'API'
  endpoint?: string; // URL endpoint của API
  method?: 'GET' | 'POST'; // Phương thức HTTP
  headers?: Record<string, string>; // Headers nếu cần
  bodyTemplate?: object; // Body nếu cần (cho POST)

  // Pagination (nếu có)
  paginationType?: {
    type: 'page' | 'offset' | 'cursor';
    param?: string; // Tên tham số dùng cho pagination: "page", "p"
    cursorPath?: string; // Đường dẫn đến cursor trong response nếu dùng cursor pagination
    maxPage?: number; // Số trang tối đa cần crawl (nếu dùng page pagination)
    startPage?: number; // Trang bắt đầu (mặc định là 1)
  };
}
