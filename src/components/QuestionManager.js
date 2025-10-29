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
