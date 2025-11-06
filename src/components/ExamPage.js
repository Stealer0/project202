import { useState, useEffect } from "react"
import { Card, Button, Form, Alert, ProgressBar, Modal } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function ExamPage({ user, questions, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(1200)
  const [showResult, setShowResult] = useState(false)
  const [examResult, setExamResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setAnswers(new Array(questions.length).fill(-1))
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [questions.length])

  const formatTime = (s) =>
    [Math.floor(s / 60), s % 60].map(n => String(n).padStart(2, "0")).join(":")

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmitExam = async () => {
    setLoading(true)
    try {
      const correctAnswers = questions.map((q) => q.correctAnswer)
      let score = 0
      answers.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
          score++
        }
      })

      const percentage = Math.round((score / questions.length) * 100)
      const passed = percentage >= 80

      const result = {
        userId: user.id,
        score: score,
        totalQuestions: questions.length,
        answers: answers,
        correctAnswers: correctAnswers,
        passed: passed,
        percentage: percentage,
        date: new Date().toISOString(),
      }

      const response = await axios.post(`${API_BASE_URL}/examResults`, result)
      setExamResult(response.data)
      setShowResult(true)
    } catch (error) {
      alert("Có lỗi xảy ra khi nộp bài thi")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseResult = () => {
    setShowResult(false)
    onComplete()
  }

  if (questions.length === 0) {
    return <Alert variant="warning">Chưa có câu hỏi nào trong hệ thống. Vui lòng liên hệ quản trị viên.</Alert>
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = answers.filter((answer) => answer !== -1).length

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bài thi thử bằng lái xe máy</h2>
        <div className="text-end">
          <div className="h5 text-danger"> {formatTime(timeLeft)}</div>
          <small className="text-muted">
            Đã trả lời: {answeredCount}/{questions.length}
          </small>
        </div>
      </div>

      <ProgressBar now={progress} className="mb-4" />

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between">
            <span>
              Câu {currentQuestion + 1}/{questions.length}
            </span>
            <span className="badge bg-secondary">{questions[currentQuestion]?.category}</span>
          </div>
        </Card.Header>
        <Card.Body>
          <h5 className="mb-4">{questions[currentQuestion]?.question}</h5>

          {/* Display image if exists */}
          {questions[currentQuestion]?.image && (
            <div className="text-center">
              <img
                src={questions[currentQuestion].image || "/placeholder.svg"}
                alt="Câu hỏi"
                className="question-image"
              />
            </div>
          )}

          <Form>
            {questions[currentQuestion]?.options.map((option) => (
              <Form.Check
                key={option.id}
                type="radio"
                id={`option-${option.id}`}
                name="answer"
                label={`${option.id + 1}. ${option.content}`}
                checked={answers[currentQuestion] === option.id}
                onChange={() => handleAnswerChange(currentQuestion, option.id)}
                className="mb-3"
              />
            ))}
          </Form>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              ← Câu trước
            </Button>

            <div>
              {currentQuestion < questions.length - 1 ? (
                <Button variant="primary" onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                  Câu tiếp →
                </Button>
              ) : (
                <Button variant="success" onClick={handleSubmitExam} disabled={loading}>
                  {loading ? "Đang nộp bài..." : "Nộp bài thi"}
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>

      <Modal show={showResult} onHide={handleCloseResult} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kết quả thi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {examResult && (
            <div className="text-center">
              <div className={`h1 ${examResult.passed ? "text-success" : "text-danger"}`}>
                {examResult.passed ? "🎉 ĐỖ" : "😞 TRƯỢT"}
              </div>
              <div className="h3 mb-4">
                Điểm số: {examResult.score}/{examResult.totalQuestions} ({examResult.percentage}%)
              </div>
              <div className="mb-4">
                <ProgressBar
                  now={examResult.percentage}
                  variant={examResult.passed ? "success" : "danger"}
                  label={`${examResult.percentage}%`}
                />
              </div>
              <p className="text-muted">
                {examResult.passed
                  ? "Chúc mừng! Bạn đã đạt yêu cầu để thi bằng lái thật."
                  : "Bạn cần ôn tập thêm để đạt kết quả tốt hơn. Cần đạt tối thiểu 80% để đỗ."}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseResult}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ExamPage
