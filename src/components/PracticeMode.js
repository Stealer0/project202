import { useState, useMemo } from "react"
import { Card, Button, Form, Alert, Badge, Row, Col } from "react-bootstrap"

function PracticeMode({ questions }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(-1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Lay danh sach cac category
  const categories = useMemo(() => {
    const cats = [...new Set(questions.map((q) => q.category))]
    return ["all", ...cats]
  }, [questions])

  // Loc theo category
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === "all") {
      return questions
    }
    return questions.filter((q) => q.category === selectedCategory)
  }, [questions, selectedCategory])

  if (questions.length === 0) {
    return <Alert variant="warning">Chưa có câu hỏi nào trong hệ thống. Vui lòng liên hệ quản trị viên.</Alert>
  }

  if (filteredQuestions.length === 0) {
    return <Alert variant="info">Không có câu hỏi nào trong chủ đề này.</Alert>
  }

  const currentQ = filteredQuestions[currentQuestion]

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentQuestion(0)
    setSelectedAnswer(-1)
    setShowAnswer(false)
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const handleCheckAnswer = () => {
    setShowAnswer(true)
    const isCorrect = selectedAnswer === currentQ.correctAnswer
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setCurrentQuestion(0)
    }
    setSelectedAnswer(-1)
    setShowAnswer(false)
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(-1)
      setShowAnswer(false)
    }
  }

  const resetStats = () => {
    setStats({ correct: 0, total: 0 })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Ôn luyện thi </h2>
        <div className="text-end">
          <div>
            <Badge bg="success" className="me-2">
              Đúng: {stats.correct}
            </Badge>
            <Badge bg="secondary" className="me-2">
              Tổng: {stats.total}
            </Badge>
            {stats.total > 0 && <Badge bg="info">Tỷ lệ: {Math.round((stats.correct / stats.total) * 100)}%</Badge>}
          </div>
          <Button variant="outline-secondary" size="sm" onClick={resetStats} className="mt-2">
            Reset thống kê
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Card className="mb-4 category-filter">
        <Card.Body>
          <h6>Chọn chủ đề:</h6>
          <Row>
            {categories.map((category) => (
              <Col key={category} xs="auto" className="mb-2">
                <Button
                  variant={selectedCategory === category ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category === "all" ? "Tất cả" : category}
                  {category !== "all" && (
                    <Badge bg="light" text="dark" className="ms-1">
                      {questions.filter((q) => q.category === category).length}
                    </Badge>
                  )}
                </Button>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between">
            <span>
              Câu {currentQuestion + 1}/{filteredQuestions.length}
            </span>
            <Badge bg="secondary">{currentQ.category}</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <h5 className="mb-4">{currentQ.question}</h5>

          {/* Display image if exists */}
          {currentQ.image && (
            <div className="text-center">
              <img src={currentQ.image || "/placeholder.svg"} alt="Câu hỏi" className="question-image" />
            </div>
          )}

          <Form>
            {currentQ.options.map((option) => (
              <Form.Check
                key={option.id}
                type="radio"
                id={`option-${option.id}`}
                name="answer"
                label={`${option.id + 1}. ${option.content}`}
                checked={selectedAnswer === option.id}
                onChange={() => handleAnswerSelect(option.id)}
                className="mb-3"
                disabled={showAnswer}
              />
            ))}
          </Form>

          {showAnswer && (
            <Alert variant={selectedAnswer === currentQ.correctAnswer ? "success" : "danger"}>
              <div className="d-flex align-items-center">
                <div className="me-3">{selectedAnswer === currentQ.correctAnswer ? "✅" : "❌"}</div>
                <div>
                  <strong>{selectedAnswer === currentQ.correctAnswer ? "Chính xác!" : "Sai rồi!"}</strong>
                  <br />
                  Đáp án đúng là: {currentQ.correctAnswer + 1}. {currentQ.options.find(o => o.id === currentQ.correctAnswer)?.content}
                </div>
              </div>
            </Alert>
          )}
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" disabled={currentQuestion === 0} onClick={handlePrevQuestion}>
              ← Câu trước
            </Button>

            <div>
              {!showAnswer ? (
                <Button variant="primary" onClick={handleCheckAnswer} disabled={selectedAnswer === -1}>
                  Kiểm tra đáp án
                </Button>
              ) : (
                <Button variant="success" onClick={handleNextQuestion}>
                  {currentQuestion < filteredQuestions.length - 1 ? "Câu tiếp →" : "Quay lại đầu"}
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}

export default PracticeMode
