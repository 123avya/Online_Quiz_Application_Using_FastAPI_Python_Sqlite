from pydantic import BaseModel, Field


class AdminLogin(BaseModel):
    username: str
    password: str


class StudentRegister(BaseModel):
    name: str
    roll_no: str
    password: str


class StudentLogin(BaseModel):
    roll_no: str
    password: str


class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    admin_id: int


class QuizSubmit(BaseModel):
    student_id: int
    answers: dict[str, str]