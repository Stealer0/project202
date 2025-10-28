import { Card, Row, Col, Button } from "react-bootstrap"
function Dashboard({ user, onNavigate, onSuggestQuestion }) {
  return (
    <div>
      <h2>Chào mừng, {user.name}!</h2>
      <p className="text-muted">Chọn chức năng bạn muốn sử dụng:</p>

      <Button variant="success" className="mb-4" onClick={onSuggestQuestion}>
        Đề xuất câu hỏi
      </Button>
      <Button variant="outline-info" className="mb-4 ms-2" onClick={() => onNavigate("suggest-history")}>Lịch sử đề xuất</Button>

      <Row>
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title> Ôn luyện</Card.Title>
              <Card.Text>
                Ôn tập các câu hỏi để thi lái xe máy.
              </Card.Text>
              <Button variant="primary" onClick={() => onNavigate("practice")}>
                Bắt đầu ôn luyện
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title> Thi thử</Card.Title>
              <Card.Text>Tham gia bài thi thử để kiểm tra kiến thức và nhận kết quả chi tiết.</Card.Text>
              <Button variant="success" onClick={() => onNavigate("exam")}>
                Thi thử ngay
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title> Lịch sử thi</Card.Title>
              <Card.Text>Xem lại các kết quả thi trước đây và theo dõi tiến độ học tập.</Card.Text>
              <Button variant="info" onClick={() => onNavigate("history")}>
                Xem lịch sử
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {user.role === "admin" && (
          <Col md={6} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title> Quản lý câu hỏi</Card.Title>
                <Card.Text>Thêm, sửa, xóa các câu hỏi trong ngân hàng đề thi. Hỗ trợ upload ảnh.</Card.Text>
                <Button variant="warning" onClick={() => onNavigate("questions")}>
                  Quản lý câu hỏi
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default Dashboard
