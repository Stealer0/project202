import { useState, useEffect } from "react"
import { Card, Table, Badge, Alert } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function ExamHistory({ user }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [user.id])

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/examResults?userId=${user.id}`)
      const sortedHistory = response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setHistory(sortedHistory)
    } catch (error) {
      console.error("Error loading exam history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  if (loading) {
    return <div>Đang tải lịch sử thi...</div>
  }

  if (history.length === 0) {
    return <Alert variant="info">Bạn chưa tham gia bài thi nào. Hãy thử sức với bài thi thử!</Alert>
  }

  const passedExams = history.filter((exam) => exam.passed).length
  const averageScore = history.reduce((sum, exam) => sum + exam.score, 0) / history.length
  const averagePercentage = history.reduce((sum, exam) => sum + exam.percentage, 0) / history.length

  return (
    <div>
      <h2>Lịch sử thi của bạn</h2>

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center stats-card">
            <Card.Body>
              <Card.Title>Tổng số lần thi</Card.Title>
              <div className="h2">{history.length}</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Số lần đỗ</Card.Title>
              <div className="h2 text-success">{passedExams}</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Điểm trung bình</Card.Title>
              <div className="h2 text-info">{averageScore.toFixed(1)}</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>% trung bình</Card.Title>
              <div className="h2 text-warning">{averagePercentage.toFixed(1)}%</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Chi tiết các lần thi</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Lần thi</th>
                <th>Ngày thi</th>
                <th>Điểm số</th>
                <th>Tỷ lệ đúng</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {history.map((exam, index) => (
                <tr key={exam.id}>
                  <td>{index + 1}</td>
                  <td>{formatDate(exam.date)}</td>
                  <td>
                    {exam.score}/{exam.totalQuestions}
                  </td>
                  <td>{exam.percentage}%</td>
                  <td>
                    <Badge bg={exam.passed ? "success" : "danger"}>{exam.passed ? "ĐỖ" : "TRƯỢT"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ExamHistory
