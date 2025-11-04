import { useState, useEffect } from "react"
import { Card, Table, Badge, Alert } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function SuggestHistory({ user }) {
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSuggested()
    // eslint-disable-next-line
  }, [user.id])

  const loadSuggested = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/suggestedQuestions?userId=${user.id}`)
      setSuggested(response.data)
    } catch (error) {
      setSuggested([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Đang tải lịch sử đề xuất...</div>
  }

  if (suggested.length === 0) {
    return <Alert variant="info">Bạn chưa đề xuất câu hỏi nào.</Alert>
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Lịch sử đề xuất câu hỏi</h5>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>STT</th>
              <th>Câu hỏi</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {suggested.map((q, idx) => (
              <tr key={q.id}>
                <td>{idx + 1}</td>
                <td style={{ maxWidth: 300 }}>{q.question.length > 50 ? q.question.substring(0, 50) + "..." : q.question}</td>
                <td><Badge bg="secondary">{q.category}</Badge></td>
                <td>
                  {q.status === "pending" && <Badge bg="warning">Chờ duyệt</Badge>}
                  {q.status === "approved" && <Badge bg="success">Đã duyệt</Badge>}
                  {q.status === "rejected" && <Badge bg="danger">Từ chối</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export default SuggestHistory 