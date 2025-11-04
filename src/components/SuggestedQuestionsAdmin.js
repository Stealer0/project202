import { useState, useEffect } from "react"
import { Card, Button, Table, Modal, Alert, Badge } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function SuggestedQuestionsAdmin({ onQuestionsChange }) {
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadSuggested()
  }, [])

  const loadSuggested = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${API_BASE_URL}/suggestedQuestions`)
      setSuggested(res.data)
    } catch (e) {
      setError("Không tải được danh sách đề xuất.")
    } finally {
      setLoading(false)
    }
  }

  const handleView = (q) => {
    setSelected(q)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelected(null)
  }

  const handleApprove = async () => {
    if (!selected) return
    setActionLoading(true)
    setError("")
    try {
      // Thêm vào questions
      await axios.post(`${API_BASE_URL}/questions`, selected)
      // Cập nhật status thành 'approved'
      await axios.patch(`${API_BASE_URL}/suggestedQuestions/${selected.id}`, { status: "approved" })
      setShowModal(false)
      setSelected(null)
      loadSuggested()
      if (onQuestionsChange) onQuestionsChange()
    } catch (e) {
      setError("Không thể duyệt câu hỏi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selected) return
    setActionLoading(true)
    setError("")
    try {
      // Cập nhật status thành 'rejected'
      await axios.patch(`${API_BASE_URL}/suggestedQuestions/${selected.id}`, { status: "rejected" })
      setShowModal(false)
      setSelected(null)
      loadSuggested()
    } catch (e) {
      setError("Không thể từ chối câu hỏi.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Card>
      <Card.Body>
        <h3>Danh sách câu hỏi đề xuất</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div>Đang tải...</div>
        ) : suggested.length === 0 ? (
          <Alert variant="info">Chưa có câu hỏi đề xuất nào.</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Câu hỏi</th>
                <th>Danh mục</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suggested.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td style={{ maxWidth: 300 }}>{q.question.length > 50 ? q.question.substring(0, 50) + "..." : q.question}</td>
                  <td><Badge bg="secondary">{q.category}</Badge></td>
                  <td>
                    <Button size="sm" variant="info" onClick={() => handleView(q)}>
                      Xem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal xem chi tiết và duyệt */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết câu hỏi đề xuất</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selected && (
              <>
                <h5>{selected.question}</h5>
                <div className="mb-2">
                  <Badge bg="secondary">{selected.category}</Badge>
                </div>
                {selected.image && (
                  <div className="mb-2">
                    <img src={selected.image} alt="minh họa" style={{ maxWidth: 200, maxHeight: 200 }} />
                  </div>
                )}
                <ol>
                  {selected.options.map((opt, idx) => (
                    <li key={idx} style={{ fontWeight: idx === selected.correctAnswer ? "bold" : "normal" }}>
                      {opt.content || opt}
                      {idx === selected.correctAnswer && <span> (Đáp án đúng)</span>}
                    </li>
                  ))}
                </ol>
              </>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={actionLoading}>
              Đóng
            </Button>
            {selected?.status === "pending" && (
              <>
                <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
                  Từ chối
                </Button>
                <Button variant="success" onClick={handleApprove} disabled={actionLoading}>
                  Duyệt và thêm vào ngân hàng câu hỏi
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  )
}

export default SuggestedQuestionsAdmin 