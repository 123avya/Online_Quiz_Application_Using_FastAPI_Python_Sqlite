const API = "http://127.0.0.1:8000";

let user = null;
let questions = [];
let answers = {};

// API FUNCTION

async function api(url, options = {}) {

    try {

        const response = await fetch(API + url,
            {
                headers: {"Content-Type": "application/json"},
                ...options
            }
        );

        let data;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {

            toast(
                data?.detail ||
                "Something went wrong"
            );

            return null;
        }

        return data;

    } catch (error) {

        console.error(error);

        toast(
            "Cannot connect to FastAPI server. Start FastAPI on port 8000."
        );

        return null;
    }
}

// PAGE

function showPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page = document.getElementById(id);

    if (!page) {
        return;
    }

    page.classList.add("active");

    updateNav();

    window.scrollTo(0, 0);
}

// NAVBAR

function updateNav() {

    const nav = document.getElementById("nav");

    if (!user) {

        nav.innerHTML = "";

        return;
    }

    if (user.type === "admin") {

        nav.innerHTML = `
            <button onclick="showPage('adminDashboard')">
                Dashboard
            </button>

            <button onclick="logout()">
                Logout
            </button>
        `;

    } else {

        nav.innerHTML = `
            <button onclick="showPage('studentDashboard')">
                Dashboard
            </button>

            <button onclick="leaderboard()">
                Leaderboard
            </button>

            <button onclick="logout()">
                Logout
            </button>
        `;
    }
}

// TOAST


function toast(message) {

    const box = document.getElementById("toast");

    box.textContent = message;

    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 3000);
}

// ADMIN LOGIN

async function adminLogin(event) {

    event.preventDefault();

    const username =
        document.getElementById("adminUser").value.trim();

    const password =
        document.getElementById("adminPass").value;

    const data = await api(
        "/api/admin/login",
        {
            method: "POST",

            body: JSON.stringify({
                username,
                password
            })
        }
    );

    if (!data) {
        return;
    }

    user = {
        type: "admin",
        id: data.id,
        name: data.username
    };

    document.getElementById("adminUser").value = "";
    document.getElementById("adminPass").value = "";

    showPage("adminDashboard");

    await loadAdmin();

    toast("Welcome Admin!");
}

// STUDENT LOGIN

async function studentLogin(event) {

    event.preventDefault();

    const roll_no =
        document.getElementById("loginRoll").value.trim();

    const password =
        document.getElementById("loginPass").value;

    const data = await api(
        "/api/student/login",
        {
            method: "POST",

            body: JSON.stringify({
                roll_no,
                password
            })
        }
    );

    if (!data) {
        return;
    }

    user = {
        type: "student",
        id: data.id,
        name: data.name,
        roll_no: data.roll_no
    };

    document.getElementById("loginRoll").value = "";
    document.getElementById("loginPass").value = "";

    showPage("studentDashboard");

    await loadStudent();

    toast("Login successful!");
}

// REGISTER STUDENT

async function registerStudent(event) {

    event.preventDefault();

    const name =
        document.getElementById("regName").value.trim();

    const roll_no =
        document.getElementById("regRoll").value.trim();

    const password =
        document.getElementById("regPass").value;

    const confirm =
        document.getElementById("regConfirm").value;

    if (password !== confirm) {

        toast("Passwords do not match");

        return;
    }

    if (password.length < 4) {

        toast("Password must contain at least 4 characters");

        return;
    }

    const data = await api(
        "/api/student/register",
        {
            method: "POST",

            body: JSON.stringify({
                name,
                roll_no,
                password
            })
        }
    );

    if (!data) {
        return;
    }

    document.getElementById("regName").value = "";
    document.getElementById("regRoll").value = "";
    document.getElementById("regPass").value = "";
    document.getElementById("regConfirm").value = "";

    toast("Registration successful!");

    showPage("studentLogin");
}

// LOGOUT

function logout() {

    user = null;

    questions = [];

    answers = {};

    showPage("landing");

    toast("Logged out");
}

// ADMIN DASHBOARD

async function loadAdmin() {

    if (!user || user.type !== "admin") {
        return;
    }

    document.getElementById(
        "adminWelcome"
    ).textContent =
        `Welcome back, ${user.name}`;

    const stats = await api(
        "/api/admin/stats"
    );

    if (stats) {

        document.getElementById(
            "questionsCount"
        ).textContent = stats.questions;

        document.getElementById(
            "studentsCount"
        ).textContent = stats.students;

        document.getElementById(
            "attemptsCount"
        ).textContent = stats.attempts;
    }

    await loadQuestions();
}
// LOAD QUESTIONS


async function loadQuestions() {

    const data = await api(
        "/api/admin/questions"
    );

    if (!data) {
        return;
    }

    const list =
        document.getElementById("questionList");

    if (data.length === 0) {

        list.innerHTML = `
            <div class="empty">
                No questions available.
            </div>
        `;

        return;
    }

    list.innerHTML = data.map(
        (q, index) => `

        <div class="question">

            <div class="questionTop">

                <b>
                    Q${index + 1}
                </b>

                <button
                    class="delete"
                    onclick="deleteQuestion(${q.id})">

                    Delete

                </button>

            </div>

            <h3>
                ${escapeHtml(q.question_text)}
            </h3>

            <div class="options">

                <span class="${
                    q.correct_answer === "A"
                    ? "correct"
                    : ""
                }">

                    A.
                    ${escapeHtml(q.option_a)}

                </span>

                <span class="${
                    q.correct_answer === "B"
                    ? "correct"
                    : ""
                }">

                    B.
                    ${escapeHtml(q.option_b)}

                </span>

                <span class="${
                    q.correct_answer === "C"
                    ? "correct"
                    : ""
                }">

                    C.
                    ${escapeHtml(q.option_c)}

                </span>

                <span class="${
                    q.correct_answer === "D"
                    ? "correct"
                    : ""
                }">

                    D.
                    ${escapeHtml(q.option_d)}

                </span>

            </div>

        </div>
        `
    ).join("");
}

// CREATE QUESTION
async function createQuestion(event) {

    event.preventDefault();

    if (!user || user.type !== "admin") {

        toast("Admin login required");

        return;
    }

    const data = {

        question_text:
            document.getElementById(
                "question"
            ).value.trim(),

        option_a:
            document.getElementById(
                "optionA"
            ).value.trim(),

        option_b:
            document.getElementById(
                "optionB"
            ).value.trim(),

        option_c:
            document.getElementById(
                "optionC"
            ).value.trim(),

        option_d:
            document.getElementById(
                "optionD"
            ).value.trim(),

        correct_answer:
            document.getElementById(
                "correct"
            ).value,

        admin_id: user.id
    };

    const result = await api(
        "/api/admin/questions",
        {
            method: "POST",

            body: JSON.stringify(data)
        }
    );

    if (!result) {
        return;
    }

    document
        .querySelector(
            "#adminDashboard form"
        )
        .reset();

    toast("Question added successfully!");

    await loadAdmin();
}

// DELETE QUESTION

async function deleteQuestion(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
        return;
    }

    const data = await api(
        `/api/admin/questions/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!data) {
        return;
    }

    toast("Question deleted successfully");

    await loadAdmin();
}

// STUDENT DASHBOARD

async function loadStudent() {

    if (!user || user.type !== "student") {
        return;
    }

    document.getElementById(
        "studentWelcome"
    ).textContent =
        `Welcome back, ${user.name}`;

    const data = await api(
        `/api/student/stats/${user.id}`
    );

    if (!data) {
        return;
    }

    document.getElementById(
        "myAttempts"
    ).textContent =
        data.attempts;

    document.getElementById(
        "bestScore"
    ).textContent =
        data.best_total > 0
        ? `${data.best_score}/${data.best_total}`
        : "0";
}

// START QUIZ

async function startQuiz() {

    if (!user || user.type !== "student") {

        toast("Please login as a student");

        return;
    }

    answers = {};

    const data = await api(
        "/api/student/quiz"
    );

    if (!data) {
        return;
    }

    if (data.length === 0) {

        toast(
            "No questions available. Ask admin to add questions."
        );

        return;
    }

    questions = data;

    showPage("quiz");

    displayQuiz();
}

// DISPLAY QUIZ
function displayQuiz() {

    const box =
        document.getElementById(
            "quizQuestions"
        );

    box.innerHTML = questions.map(
        (q, index) => `

        <div class="quizQuestion">

            <p class="number">
                Question ${index + 1}
            </p>

            <h2>
                ${escapeHtml(q.question_text)}
            </h2>

            <div class="quizOptions">

                ${option(
                    q.id,
                    "A",
                    q.option_a
                )}

                ${option(
                    q.id,
                    "B",
                    q.option_b
                )}

                ${option(
                    q.id,
                    "C",
                    q.option_c
                )}

                ${option(
                    q.id,
                    "D",
                    q.option_d
                )}

            </div>

        </div>
        `
    ).join("");
}
// QUIZ OPTION

function option(id, letter, text) {

    return `
        <button
            type="button"
            class="quizOption"
            id="option-${id}-${letter}"
            onclick="selectAnswer(${id}, '${letter}')">

            <b>${letter}</b>

            ${escapeHtml(text)}

        </button>
    `;
}

// SELECT ANSWER

function selectAnswer(id, answer) {

    answers[String(id)] = answer;

    ["A", "B", "C", "D"].forEach(
        letter => {

            const element =
                document.getElementById(
                    `option-${id}-${letter}`
                );

            if (element) {

                element.classList.remove(
                    "selected"
                );
            }
        }
    );

    const selected =
        document.getElementById(
            `option-${id}-${answer}`
        );

    if (selected) {

        selected.classList.add(
            "selected"
        );
    }
}

// SUBMIT QUIZ

async function submitQuiz() {

    if (!user || user.type !== "student") {

        toast("Student login required");

        return;
    }

    const confirmed = confirm(
        "Are you sure you want to submit the quiz?"
    );

    if (!confirmed) {
        return;
    }

    const data = await api(
        "/api/student/quiz/submit",
        {
            method: "POST",

            body: JSON.stringify({

                student_id: user.id,

                answers: answers

            })
        }
    );

    if (!data) {
        return;
    }

    showResult(data);
}

// SHOW RESULT

function showResult(data) {

    const percentage =
        data.total > 0
        ? Math.round(
            data.score /
            data.total *
            100
        )
        : 0;

    document.getElementById(
        "score"
    ).textContent =
        data.score;

    document.getElementById(
        "total"
    ).textContent =
        `/ ${data.total}`;

    document.getElementById(
        "percentage"
    ).textContent =
        percentage + "%";

    document.getElementById(
        "resultMessage"
    ).textContent =
        getMessage(percentage);


    let correct = 0;
    let wrong = 0;
    let skipped = 0;


    data.details.forEach(
        item => {

            if (!item.user_answer) {

                skipped++;

            } else if (item.is_correct) {

                correct++;

            } else {

                wrong++;
            }
        }
    );


    document.getElementById(
        "correctCount"
    ).textContent =
        correct;

    document.getElementById(
        "wrongCount"
    ).textContent =
        wrong;

    document.getElementById(
        "skipCount"
    ).textContent =
        skipped;


    document.getElementById(
        "review"
    ).innerHTML =
        data.details.map(
            (item, index) => `

            <div class="review">

                <b>
                    Question ${index + 1}
                </b>

                <p>
                    ${escapeHtml(
                        item.question_text
                    )}
                </p>

                <span>
                    Your answer:
                    ${
                        item.user_answer ||
                        "Skipped"
                    }
                </span>

                <span>
                    Correct answer:
                    ${item.correct_answer}
                </span>

            </div>

            `
        ).join("");


    showPage("result");
}
// RESULT MESSAGE

function getMessage(percent) {

    if (percent >= 90) {
        return "Outstanding Performance!";
    }

    if (percent >= 80) {
        return "Excellent Work!";
    }

    if (percent >= 60) {
        return "Good Job!";
    }

    if (percent >= 40) {
        return "Keep Practicing!";
    }

    return "Keep Trying!";
}

// MY RESULTS

async function myResults() {

    if (!user || user.type !== "student") {

        toast("Student login required");

        return;
    }

    const data = await api(
        `/api/student/results/${user.id}`
    );

    if (!data) {
        return;
    }

    const box =
        document.getElementById(
            "resultsList"
        );


    if (data.length === 0) {

        box.innerHTML = `
            <div class="empty">
                You haven't taken any quizzes yet.
            </div>
        `;

    } else {

        box.innerHTML =
            data.map(
                result => `

                <div class="resultItem">

                    <div>

                        <h3>
                            ${result.score}
                            /
                            ${result.total}
                        </h3>

                        <p>
                            ${result.date}
                        </p>

                    </div>

                    <strong>
                        ${result.percentage}%
                    </strong>

                </div>

                `
            ).join("");
    }

    showPage("results");
}
// LEADERBOARD

async function leaderboard() {

    const data = await api(
        "/api/leaderboard"
    );

    if (!data) {
        return;
    }

    const box =
        document.getElementById(
            "leaderboardList"
        );


    if (data.length === 0) {

        box.innerHTML = `
            <div class="empty">
                No quiz attempts yet.
            </div>
        `;

    } else {

        box.innerHTML =
            data.map(
                student => `

                <div class="leader">

                    <strong>
                        #${student.rank}
                    </strong>

                    <div>

                        <b>
                            ${escapeHtml(
                                student.name
                            )}
                        </b>

                        <small>
                            ${escapeHtml(
                                student.roll_no
                            )}
                        </small>

                    </div>

                    <span>

                        ${student.score}/${student.total}

                        <br>

                        ${student.percentage}%

                    </span>

                </div>

                `
            ).join("");
    }

    showPage("leaderboard");
}

// ESCAPE HTML

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}

// INITIAL PAGE

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showPage("landing");

    }
);