from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer,primary_key=True,index=True)
    username = Column(String,unique=True,nullable=False)
    password = Column(String,nullable=False)


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False)
    roll_no = Column(String,unique=True,nullable=False)
    password = Column(String,nullable=False)


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer,primary_key=True,index=True)
    question_text = Column(String,nullable=False)
    option_a = Column(String,nullable=False)
    option_b = Column(String,nullable=False)
    option_c = Column(String,nullable=False)
    option_d = Column(String,nullable=False)
    correct_answer = Column(String,nullable=False)
    created_by = Column(Integer,ForeignKey("admins.id"),nullable=True)


class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer,primary_key=True,index=True)
    student_id = Column(Integer,ForeignKey("students.id"),nullable=False)
    student_name = Column(String,nullable=False)
    roll_no = Column(String,nullable=False)
    score = Column(Integer,nullable=False)
    total_questions = Column(Integer,nullable=False)
    date_taken = Column(DateTime,default=func.now())