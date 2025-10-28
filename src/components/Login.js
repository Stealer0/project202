import { useState } from "react"
import { Card, Form, Button, Alert, Row, Col, Tabs, Tab } from "react-bootstrap"
import axios from "axios"

const API_BASE_URL = "http://localhost:9999"

function Login({ onLogin }) {
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({ username: "", password: "", name: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    const username = loginData.username.trim()
    const password = loginData.password.trim()

    // Client-side validation
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu")
      return
    }
    if (username.length < 4) {
      setError("Tên đăng nhập phải có ít nhất 4 ký tự")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    try {
      setLoading(true)
      const { data: users } = await axios.get(`${API_BASE_URL}/users`)
      const user = users.find(
        (u) => u.username === username && u.password === password
      )

      if (user) {
        onLogin({ id: user.id, username: user.username, role: user.role, name: user.name })
      } else {
        setError("Sai tên đăng nhập hoặc mật khẩu")
      }
    } catch {
      setError("Đăng nhập thất bại")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    const name = registerData.name.trim()
    const username = registerData.username.trim()
    const password = registerData.password.trim()

    // Client-side validation
    if (!name || !username || !password) {
      setError("Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu")
      return
    }
    if (name.length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự")
      return
    }
    const usernameRegex = /^[a-zA-Z0-9_.]{4,}$/
    if (!usernameRegex.test(username)) {
      setError("Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới hoặc dấu chấm và ít nhất 4 ký tự")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    try {
      setLoading(true)
      const { data: users } = await axios.get(`${API_BASE_URL}/users`)
      const existingUser = users.find((u) => u.username === username)

      if (existingUser) {
        setError("Tên đăng nhập đã tồn tại")
      } else {
        const newUser = {
          username,
          password,
          name,
          role: "user",
        }

        const { data: createdUser } = await axios.post(`${API_BASE_URL}/users`, newUser)

        onLogin({
          id: createdUser.id,
          username: createdUser.username,
          role: createdUser.role,
          name: createdUser.name,
        })
      }
    } catch {
      setError("Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <Card>
          <Card.Header>
            <h4 className="text-center mb-0">Hệ thống ôn thi</h4>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Tabs defaultActiveKey="login" className="mb-3">
              <Tab eventKey="login" title="Đăng nhập">
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                      type="text"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </Form>
              </Tab>

              <Tab eventKey="register" title="Đăng ký">
                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ tên</Form.Label>
                    <Form.Control
                      type="text"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, name: e.target.value })
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                      type="text"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, username: e.target.value })
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      required
                    />
                  </Form.Group>

                  <Button variant="success" type="submit" className="w-100" disabled={loading}>
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default Login
