from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import *
from tables import *
from model import *


Base.metadata.create_all(bind=engine)


db = SessionLocal()

try:
    admin = db.query(Admin).filter(Admin.username == "admin").first()
    if not admin:
        admin = Admin(username="admin",password="admin123")

        db.add(admin)
        db.commit()

finally:
    db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "message": "QuizMaster Backend is running",
        "docs": "http://127.0.0.1:8000/docs"
    }


@app.post("/api/admin/login")
def admin_login(data: AdminLogin,db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == data.username,Admin.password == data.password).first()
    if not admin:
        raise HTTPException(status_code=401,detail="Invalid username or password")

    return {
        "id": admin.id,
        "username": admin.username
    }

@app.get("/api/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    return {
        "questions": db.query(Question).count(),
        "students": db.query(Student).count(),
        "attempts": db.query(QuizResult).count()
    }

@app.post("/api/admin/questions")
def create_question(data: QuestionCreate,db: Session = Depends(get_db)):

    correct_answer = data.correct_answer.strip().upper()

    if correct_answer not in ["A", "B", "C", "D"]:
        raise HTTPException(status_code=400,detail="Correct answer must be A, B, C or D")

    admin = db.query(Admin).filter(Admin.id == data.admin_id).first()

    if not admin:
        raise HTTPException(status_code=404,detail="Admin not found")

    question = Question(
        question_text=data.question_text.strip(),
        option_a=data.option_a.strip(),
        option_b=data.option_b.strip(),
        option_c=data.option_c.strip(),
        option_d=data.option_d.strip(),
        correct_answer=correct_answer,
        created_by=data.admin_id
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "message": "Question added successfully",
        "id": question.id
    }


@app.get("/api/admin/questions")
def get_admin_questions(db: Session = Depends(get_db)):

    questions = db.query(Question).order_by(Question.id).all()

    return [
        {
            "id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "correct_answer": q.correct_answer
        }
        for q in questions
    ]


@app.delete("/api/admin/questions/{question_id}")
def delete_question(question_id: int,db: Session = Depends(get_db)):

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404,detail="Question not found")

    db.delete(question)
    db.commit()

    return {
        "message": "Question deleted successfully"
    }


@app.post("/api/student/register")
def register_student(data: StudentRegister,db: Session = Depends(get_db)):

    name = data.name.strip()
    roll_no = data.roll_no.strip()
    password = data.password

    if not name:
        raise HTTPException(status_code=400,detail="Name is required")

    if not roll_no:
        raise HTTPException(status_code=400,detail="Roll number is required")

    if not password:
        raise HTTPException(status_code=400,detail="Password is required")

    existing = db.query(Student).filter(Student.roll_no == roll_no).first()

    if existing:
        raise HTTPException(status_code=400,detail="Roll number already registered")
    student = Student(name=name,roll_no=roll_no,password=password)

    db.add(student)
    db.commit()
    db.refresh(student)

    return {
        "message": "Registration successful",
        "id": student.id,
        "name": student.name,
        "roll_no": student.roll_no
    }


@app.post("/api/student/login")
def student_login(data: StudentLogin,db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.roll_no == data.roll_no.strip(),Student.password == data.password).first()

    if not student:
        raise HTTPException(status_code=401,detail="Invalid roll number or password")

    return {
        "id": student.id,
        "name": student.name,
        "roll_no": student.roll_no
    }

@app.get("/api/student/stats/{student_id}")
def student_stats(student_id: int,db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404,detail="Student not found")

    results = db.query(QuizResult).filter(QuizResult.student_id == student_id).all()

    attempts = len(results)

    best_score = 0
    best_total = 0
    best_percentage = 0

    for result in results:

        if result.total_questions <= 0:
            continue

        percentage = (
            result.score /
            result.total_questions
        ) * 100

        if percentage > best_percentage:
            best_percentage = percentage
            best_score = result.score
            best_total = result.total_questions

    return {
        "attempts": attempts,
        "best_score": best_score,
        "best_total": best_total
    }


@app.get("/api/student/quiz")
def get_quiz(db: Session = Depends(get_db)):
    questions = db.query(Question).order_by(Question.id).all()

    return [
        {
            "id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d
        }
        for q in questions
    ]


@app.post("/api/student/quiz/submit")
def submit_quiz(data: QuizSubmit,db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.id == data.student_id).first()

    if not student:
        raise HTTPException(status_code=404,detail="Student not found")

    questions = db.query(Question).order_by(Question.id).all()

    if not questions:
        raise HTTPException(status_code=400,detail="No questions available")

    score = 0
    details = []

    for question in questions:

        answer = data.answers.get(
            str(question.id),
            ""
        )

        answer = answer.strip().upper()

        correct = (
            answer == question.correct_answer
        )

        if correct:
            score += 1

        details.append({
            "question_text": question.question_text,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d,
            "correct_answer": question.correct_answer,
            "user_answer": answer,
            "is_correct": correct
        })

    total = len(questions)

    result = QuizResult(
        student_id=student.id,
        student_name=student.name,
        roll_no=student.roll_no,
        score=score,
        total_questions=total
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "id": result.id,
        "score": score,
        "total": total,
        "details": details
    }


@app.get("/api/student/results/{student_id}")
def student_results(student_id: int,db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404,detail="Student not found")

    results = db.query(QuizResult).filter(QuizResult.student_id == student_id).order_by( QuizResult.date_taken.desc()).all()

    return [
        {
            "id": result.id,
            "score": result.score,
            "total": result.total_questions,
            "percentage": round(
                (
                    result.score /
                    result.total_questions
                ) * 100,
                1
            ) if result.total_questions else 0,
            "date": result.date_taken.strftime(
                "%d-%m-%Y %H:%M"
            ) if result.date_taken else ""
        }
        for result in results
    ]


@app.get("/api/leaderboard")
def leaderboard(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    data = []

    for student in students:

        results = db.query(QuizResult).filter(QuizResult.student_id == student.id).all()

        if not results:
            continue

        best = max(
            results,
            key=lambda result: (
                result.score /
                result.total_questions
            ) if result.total_questions else 0
        )

        percentage = (
            best.score /
            best.total_questions *
            100
        ) if best.total_questions else 0

        data.append({
            "name": student.name,
            "roll_no": student.roll_no,
            "score": best.score,
            "total": best.total_questions,
            "percentage": round(
                percentage,
                1
            )
        })

    data.sort(
        key=lambda item: (
            -item["percentage"],
            -item["score"],
            item["name"].lower()
        )
    )

    for index, student in enumerate(data):
        student["rank"] = index + 1

    return data