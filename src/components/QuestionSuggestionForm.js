import { useState, useMemo, useEffect } from "react"
import { Card, Button, Modal, Form, Alert } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function QuestionSuggestionForm({ questions = [], showModal, setShowModal }) {
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    image: null,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [success, setSuccess] = useState(false)

  // Lấy danh mục có sẵn từ danh sách câu hỏi
  const existingCategories = useMemo(() => {
    return [...new Set(questions.map((q) => q.category))].sort()
  }, [questions])

  // Khi mở modal từ Dashboard, reset form khi showModal chuyển từ false -> true
  // Sử dụng useEffect để reset form khi showModal=true
  useEffect(() => {
    if (showModal) {
      setError("")
      setSuccess(false)
      setFormData({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "",
        image: null,
      })
      setImagePreview(null)
      setShowCustomCategory(false)
      setCustomCategory("")
    }
  }, [showModal])

  const handleCloseModal = () => {
    setShowModal(false)
    setError("")
    setSuccess(false)
    setImagePreview(null)
    setShowCustomCategory(false)
    setCustomCategory("")
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        setFormData({ ...formData, image: base64 })
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null })
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      // Định dạng lại options thành object nếu cần
      const options = formData.options.map((content, idx) => ({ id: idx, content }))
      const user = JSON.parse(localStorage.getItem("user"))
      await axios.post(`${API_BASE_URL}/suggestedQuestions`, {
        ...formData,
        options,
        userId: user?.id,
        status: "pending"
      })
      setSuccess(true)
      setFormData({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "",
        image: null,
      })
      setImagePreview(null)
      setShowCustomCategory(false)
      setCustomCategory("")
    } catch (error) {
      setError("Có lỗi xảy ra khi gửi đề xuất câu hỏi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      
      

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Đề xuất câu hỏi mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Câu hỏi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                value={showCustomCategory ? "custom" : formData.category}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setShowCustomCategory(true)
                    setFormData({ ...formData, category: "" })
                  } else {
                    setShowCustomCategory(false)
                    setCustomCategory("")
                    setFormData({ ...formData, category: e.target.value })
                  }
                }}
                required={!showCustomCategory}
              >
                <option value="">-- Chọn danh mục --</option>
                {existingCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="custom">➕ Thêm danh mục mới</option>
              </Form.Select>
              {showCustomCategory && (
                <div className="mt-2">
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên danh mục mới"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value)
                      setFormData({ ...formData, category: e.target.value })
                    }}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowCustomCategory(false)
                      setCustomCategory("")
                      setFormData({ ...formData, category: "" })
                    }}
                  >
                    Hủy danh mục tùy chỉnh
                  </Button>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh minh họa (tùy chọn)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                  />
                  <br />
                  <Button variant="outline-danger" size="sm" className="mt-2" onClick={handleRemoveImage}>
                    Xóa ảnh
                  </Button>
                </div>
              )}
            </Form.Group>

            {formData.options.map((option, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label>Đáp án {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label>Đáp án đúng</Form.Label>
              <Form.Select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: Number.parseInt(e.target.value) })}
              >
                {formData.options.map((option, index) => (
                  <option key={index} value={index}>
                    {index + 1} - {option}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Đã gửi đề xuất thành công! Câu hỏi sẽ được duyệt bởi quản trị viên.</Alert>}

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi đề xuất"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default QuestionSuggestionForm 