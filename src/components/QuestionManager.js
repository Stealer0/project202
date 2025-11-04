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
}