import { useState, useEffect } from "react"
import { Container, Navbar, Nav, Button } from "react-bootstrap"
import axios from "axios"

import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
// import QuestionManager from "./components/QuestionManager"
import ExamPage from "./components/ExamPage"
import ExamHistory from "./components/ExamHistory"
import PracticeMode from "./components/PracticeMode"
import QuestionSuggestionForm from "./components/QuestionSuggestionForm"
// import SuggestedQuestionsAdmin from "./components/SuggestedQuestionsAdmin"
// import SuggestHistory from "./components/SuggestHistory"

const API_BASE_URL = "http://localhost:9999"

//  chọn ngẫu nhiên N phần tử từ mảng
function getRandomQuestions(allQuestions, count = 25) {
  const result = []
  while (result.length < count) {
    const randomItem = allQuestions[Math.floor(Math.random() * allQuestions.length)]
    if (!result.includes(randomItem)) {
      result.push(randomItem)
    }
  }
  return result
}

function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [questions, setQuestions] = useState([])
 
  const [randomExamQuestions, setRandomExamQuestions] = useState([])
  const [showSuggestModal, setShowSuggestModal] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions`)
      setQuestions(response.data)
    } catch (error) {
      console.error("Error loading questions:", error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    setCurrentPage("dashboard")
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    setCurrentPage("dashboard")
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <Dashboard user={user} onNavigate={handleNavigate} onSuggestQuestion={() => setShowSuggestModal(true)} />
            <QuestionSuggestionForm questions={questions} showModal={showSuggestModal} setShowModal={setShowSuggestModal} />
          </>
        )

      case "questions":
        return <QuestionManager questions={questions} onQuestionsChange={loadQuestions} />

      case "suggested":
        return <SuggestedQuestionsAdmin onQuestionsChange={loadQuestions} />

      case "exam":
        // Chọn đề ngẫu nhiên 
        if (randomExamQuestions.length === 0 && questions.length >= 25) {
          const random25 = getRandomQuestions(questions, 25)
          setRandomExamQuestions(random25)
          return <div>Đang tạo đề thi...</div>
        }

        return (
          <ExamPage
            user={user}
            questions={randomExamQuestions}
            onComplete={() => {
              setRandomExamQuestions([]) // Reset đề sau khi thi
              handleNavigate("dashboard")
            }}
          />
        )

      case "history":
        return <ExamHistory user={user} onNavigate={handleNavigate} />

      case "practice":
        return <PracticeMode questions={questions} />

      case "suggest-history":
        return <SuggestHistory user={user} />

      default:
        return <Dashboard user={user} onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Ôn Thi Cùng Lái xe máy</Navbar.Brand>

          {user && (
            <>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link active={currentPage === "dashboard"} onClick={() => handleNavigate("dashboard")}>
                    Trang chủ
                  </Nav.Link>
                  <Nav.Link active={currentPage === "practice"} onClick={() => handleNavigate("practice")}>
                    Ôn luyện
                  </Nav.Link>
                  <Nav.Link active={currentPage === "exam"} onClick={() => handleNavigate("exam")}>
                    Thi thử
                  </Nav.Link>
                  <Nav.Link active={currentPage === "history"} onClick={() => handleNavigate("history")}>
                    Lịch sử thi
                  </Nav.Link>
                  {user.role === "admin" && (
                    <>
                      <Nav.Link active={currentPage === "questions"} onClick={() => handleNavigate("questions")}>Quản lý câu hỏi</Nav.Link>
                      <Nav.Link active={currentPage === "suggested"} onClick={() => handleNavigate("suggested")}>Duyệt đề xuất</Nav.Link>
                    </>
                  )}
                </Nav>
                <Nav>
                  <Navbar.Text className="me-3">Xin chào, {user.name}!</Navbar.Text>
                  <Button variant="outline-light" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </Nav>
              </Navbar.Collapse>
            </>
          )}
        </Container>
      </Navbar>

      <Container className="mt-4">{renderCurrentPage()}</Container>
    </div>
  )
}

export default App
