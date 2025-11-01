import { useState, useMemo } from "react"
import { Card, Button, Table, Modal, Form, Alert, Badge } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function QuestionManager({ questions, onQuestionsChange }) {
    const [showModal, setShowModal] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)
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

    // Lay cate co san tu cau hoi
    const existingCategories = useMemo(() => {
        return [...new Set(questions.map((q) => q.category))].sort()
    }, [questions])

    const handleShowModal = (question = null) => {
        if (question) {
            setEditingQuestion(question)
            setFormData({
                question: question.question,
                options: [...question.options],
                correctAnswer: question.correctAnswer,
                category: question.category,
                image: question.image,
            })
            setImagePreview(question.image)
            // Check if category exists in existing categories
            const categoryExists = existingCategories.includes(question.category)
            if (!categoryExists && question.category) {
                setShowCustomCategory(true)
                setCustomCategory(question.category)
            } else {
                setShowCustomCategory(false)
                setCustomCategory("")
            }
        } else {
            setEditingQuestion(null)
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
        setShowModal(true)
        setError("")
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingQuestion(null)
        setError("")
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

        try {
            if (editingQuestion) {
                await axios.put(`${API_BASE_URL}/questions/${editingQuestion.id}`, formData)
            } else {
                await axios.post(`${API_BASE_URL}/questions`, formData)
            }

            onQuestionsChange()
            handleCloseModal()
        } catch (error) {
            setError("Có lỗi xảy ra khi lưu câu hỏi")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/questions/${id}`)
                onQuestionsChange()
            } catch (error) {
                alert("Có lỗi xảy ra khi xóa câu hỏi")
            }
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý câu hỏi</h2>
                <Button variant="primary" onClick={() => handleShowModal()}>
                    Thêm câu hỏi mới
                </Button>
            </div>

            <Card>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Câu hỏi</th>
                                <th>Danh mục</th>
                                <th>Ảnh</th>
                                <th>Đáp án đúng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((question) => (
                                <tr key={question.id}>
                                    <td>{question.id}</td>
                                    <td style={{ maxWidth: "300px" }}>
                                        {question.question.length > 50 ? question.question.substring(0, 50) + "..." : question.question}
                                    </td>
                                    <td>
                                        <Badge bg="secondary">{question.category}</Badge>
                                    </td>
                                    <td>
                                        {question.image ? (
                                            <img
                                                src={question.image || "/placeholder.svg"}
                                                alt="Câu hỏi"
                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <span className="text-muted">Không có</span>
                                        )}
                                    </td>
                                    <td>{question.options.find(o => o.id === question.correctAnswer)?.content}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowModal(question)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(question.id)}>
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

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