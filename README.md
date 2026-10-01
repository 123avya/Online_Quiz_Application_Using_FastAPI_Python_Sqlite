# 🎓 QuizMaster – Online Quiz Application

QuizMaster is a full-stack **Online Quiz Application** developed using **Python, FastAPI, SQLAlchemy, SQLite, HTML, CSS, and JavaScript**.

The application provides separate **Admin** and **Student** portals. Administrators can create and manage quiz questions, while students can register, take quizzes, view their results, and check the leaderboard.

---

## 🚀 Features

### 👨‍💼 Admin Portal

* Admin login
* Admin dashboard
* View total number of questions
* View registered students
* View total quiz attempts
* Create new quiz questions
* Add four multiple-choice options
* Select the correct answer
* View question bank
* Delete questions
* Logout functionality

The backend provides APIs for admin authentication, statistics, question creation, retrieving questions, and deleting questions.

### 👨‍🎓 Student Portal

* Student registration
* Student login
* Student dashboard
* Start quiz
* Multiple-choice questions
* Select answers
* Submit quiz
* Automatic score calculation
* View correct answers
* View wrong answers
* View skipped questions
* Detailed quiz review
* View previous quiz results
* View best score
* View leaderboard
* Logout functionality

## The frontend provides separate student pages for login, registration, dashboard, quiz, results, and leaderboard.

## 🛠️ Technologies Used

| Technology      | Purpose                              |
| --------------- | ------------------------------------ |
| 🐍 Python       | Backend programming                  |
| ⚡ FastAPI       | REST API development                 |
| 🗄️ SQLAlchemy  | ORM / Database interaction           |
| 💾 SQLite       | Database                             |
| 🌐 HTML5        | Frontend structure                   |
| 🎨 CSS3         | Frontend styling                     |
| ⚙️ JavaScript   | Frontend logic and API communication |
| 📦 Pydantic     | Request data validation              |
| 📚 Font Awesome | Icons                                |
| 🔗 REST API     | Frontend-backend communication       |

---

## 🏗️ Project Architecture

```text
                  ┌─────────────────────┐
                  │      Frontend       │
                  │ HTML + CSS + JS     │
                  └──────────┬──────────┘
                             │
                             │ REST API
                             ▼
                  ┌─────────────────────┐
                  │      FastAPI        │
                  │      Backend        │
                  └──────────┬──────────┘
                             │
                             │ SQLAlchemy
                             ▼
                  ┌─────────────────────┐
                  │       SQLite        │
                  │      Database       │
                  └─────────────────────┘
```

---

## 📂 Project Structure

```text
QuizMaster/
│
├── main.py
├── database.py
├── tables.py
├── model.py
├── quiz.db
│
├── static/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

> The exact filenames/folder names can be adjusted according to your GitHub repository.

---

# 🗄️ Database Design

The application uses SQLite with SQLAlchemy ORM.

### Admin Table

Stores administrator login information.

```text
admins
├── id
├── username
└── password
```

### Student Table

Stores registered student information.

```text
students
├── id
├── name
├── roll_no
└── password
```

### Question Table

Stores quiz questions and their options.

```text
questions
├── id
├── question_text
├── option_a
├── option_b
├── option_c
├── option_d
├── correct_answer
└── created_by
```

### Quiz Result Table

Stores student quiz attempts.

```text
quiz_results
├── id
├── student_id
├── student_name
├── roll_no
├── score
├── total_questions
└── date_taken
```

---

# 🔌 API Endpoints

## Admin APIs

### Admin Login

```http
POST /api/admin/login
```

Used for administrator authentication.

### Admin Statistics

```http
GET /api/admin/stats
```

Returns:

* Total questions
* Total students
* Total quiz attempts

### Create Question

```http
POST /api/admin/questions
```

Creates a new multiple-choice question.

### Get Questions

```http
GET /api/admin/questions
```

Returns the questions available in the question bank.

### Delete Question

```http
DELETE /api/admin/questions/{question_id}
```

Deletes a question from the question bank.

---

# 👨‍🎓 Student APIs

### Student Registration

```http
POST /api/student/register
```

Registers a new student.

Example request:

```json
{
    "name": "John Doe",
    "roll_no": "101",
    "password": "1234"
}
```

### Student Login

```http
POST /api/student/login
```

Authenticates a student using roll number and password.

### Student Statistics

```http
GET /api/student/stats/{student_id}
```

Returns the student's:

* Number of attempts
* Best score
* Total questions in best attempt

### Get Quiz

```http
GET /api/student/quiz
```

Returns available quiz questions.

### Submit Quiz

```http
POST /api/student/quiz/submit
```

Submits student answers and calculates the score.

Example:

```json
{
    "student_id": 1,
    "answers": {
        "1": "A",
        "2": "C",
        "3": "B"
    }
}
```

### Student Results

```http
GET /api/student/results/{student_id}
```

Returns previous quiz attempts.

### Leaderboard

```http
GET /api/leaderboard
```

Returns students ranked according to their best quiz performance.

---

# 🔄 Application Workflow

## Admin Workflow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Create Question
     ↓
Add Options
     ↓
Select Correct Answer
     ↓
Save Question
     ↓
Question Bank
     ↓
View / Delete Questions
```

---

## Student Workflow

```text
Student Registration
        ↓
Student Login
        ↓
Student Dashboard
        ↓
Start Quiz
        ↓
Answer Questions
        ↓
Submit Quiz
        ↓
Score Calculation
        ↓
Result Page
        ↓
View Results / Leaderboard
```

---

# 📝 Quiz Evaluation

When a student submits the quiz:

1. The backend retrieves all available questions.
2. Student answers are received through the API.
3. Each answer is compared with the stored correct answer.
4. Correct answers increase the student's score.
5. The result is stored in the `quiz_results` table.
6. The API returns the score and detailed question review.

The backend performs the comparison and increments the score for correct answers.

---

# 🏆 Leaderboard

The application includes a leaderboard where students can compare their quiz performance.

The leaderboard displays:

* Rank
* Student name
* Roll number
* Best score
* Total questions
* Percentage

The backend calculates each student's best attempt and sorts the leaderboard by percentage and score.

---

# 📊 Student Result System

After submitting a quiz, students can see:

```text
Score
Percentage
Correct Answers
Wrong Answers
Skipped Questions
Detailed Question Review
```

The frontend also provides a **My Results** section where students can view their previous attempts.

---

# 🎨 User Interface

The application provides a modern dark-themed interface with:

* Responsive design
* Admin dashboard
* Student dashboard
* Login and registration forms
* Quiz interface
* Result page
* Leaderboard
* Toast notifications
* Mobile-friendly layout

The landing page provides separate Admin and Student portals.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/QuizMaster.git
```

Move into the project directory:

```bash
cd QuizMaster
```

---

## 2. Create Virtual Environment

```bash
python -m venv myenv
```

### Windows

```bash
myenv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

---

## 4. Start FastAPI Server

Run:

```bash
uvicorn main:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

The project root endpoint also exposes the Swagger documentation URL.

---

# 🔐 Default Admin Login

For development/testing:

```text
Username: admin
Password: admin123
```

The application initializes this default admin account when the database is created.

> ⚠️ For a production application, use secure password hashing and do not store passwords as plain text.

---

# 📱 Main Pages

```text
Landing Page
     │
     ├── Admin Login
     │      └── Admin Dashboard
     │             ├── Statistics
     │             ├── Create Question
     │             └── Question Bank
     │
     └── Student Login
            ├── Student Registration
            └── Student Dashboard
                   ├── Start Quiz
                   ├── My Results
                   └── Leaderboard
```

---

# 🔮 Future Enhancements

The project can be extended with:

* 🔐 JWT authentication
* 🔒 Password hashing using bcrypt
* ⏱️ Quiz timer
* 📚 Multiple quiz categories
* 🎯 Difficulty levels
* 📈 Admin analytics dashboard
* 📊 Performance charts
* 🖼️ Image-based questions
* 📄 Export results to PDF
* 📧 Email result notifications
* 🔍 Question search and filtering
* ✏️ Edit existing questions
* 👥 Admin management
* 🌐 Deployment using Render, Railway, or AWS
* 🐳 Docker support

---

# 🎯 Learning Outcomes

Through this project, I practiced:

* Python backend development
* FastAPI REST API development
* Pydantic data validation
* SQLAlchemy ORM
* SQLite database operations
* CRUD operations
* API integration
* HTML/CSS frontend development
* JavaScript asynchronous programming
* Fetch API
* Form handling
* Database relationships
* Quiz evaluation logic
* Result management
* Leaderboard implementation
* Frontend and backend integration

---

# 👩‍💻 Author

**Navya Narayan Gouda**

B.E. – Computer Science & Engineering (Data Science)

### Skills

```text
Python
FastAPI
SQL
SQLAlchemy
HTML
CSS
JavaScript
Power BI
Data Analysis
Machine Learning
```

---

# ⭐ Project Highlights

```text
✔ Full-Stack Quiz Application
✔ FastAPI REST APIs
✔ Admin & Student Portals
✔ SQLite Database
✔ SQLAlchemy ORM
✔ Automatic Quiz Evaluation
✔ Result History
✔ Leaderboard
✔ Responsive UI
✔ REST API Integration
```

---

## 📌 Project Status

🟢 **Completed – Academic / Portfolio Project**

This project was developed to demonstrate full-stack application development using **Python FastAPI, SQLAlchemy, SQLite, HTML, CSS, and JavaScript**.
