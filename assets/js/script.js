// INIT =====================================================================================
const url = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes";
const list = document.querySelector(".quizz-list");
const page = document.querySelector(".quizz-page");
const create = document.querySelector(".quizz-create");
function renderMainPage();

// Functions ================================================================================
function renderMainPage() {
    // Render all-quizzes
    const allQuizzesList = document.querySelector(".all-quizzes ul");
    axios.get(url)
    .then(p => {
        const data = p.data;
        const fragment = document.createDocumentFragment();
        data.forEach(e => fragment.appendChild(createQuizzBox(e)));
        allQuizzesList.replaceChildren(fragment);
    });
}

// Page 1 > Page 3
function toQuizzCreate() {
    list.classList.add("hidden");
    create.classList.remove("hidden");
}

// Page 1 > Page 2
function toQuizzPage(e) {
    list.classList.add("hidden");
    page.classList.remove("hidden");

    axios.get(url + "/" + e.currentTarget.id)
    .then(p => {
        const data = p.data;
        page.id = data.id;
        data.questions.sort(() => Math.random() - 0.5);
        renderQuizzPage(data);
    });


}

// DOM ======================================================================================
function createQuizzBox(obj) {
    const quizzBox = document.createElement("li");
    quizzBox.className = "quizz-box";
    quizzBox.id = obj.id;

    const img = document.createElement("img");
    img.src = obj.image;

    const grad = document.createElement("div");
    grad.className = "gradient";

    const title = document.createElement("span");
    title.textContent = obj.title;

    quizzBox.appendChild(img);
    quizzBox.appendChild(grad);
    quizzBox.appendChild(title);

    quizzBox.addEventListener("click", toQuizzPage);
    return quizzBox;
}

function renderQuizzPage(obj) {
    const fragment = document.createDocumentFragment();

    // Page Header
    const header = document.createElement("div");
    header.className = "page-header";

    const img = document.createElement("img");
    img.src = obj.image;

    const layer = document.createElement("div");
    const title = document.createElement("span");
    title.textContent = obj.title;

    header.appendChild(img);
    header.appendChild(layer);
    header.appendChild(title);

    // Questions
    const questions = document.createElement("div");
    questions.className = "questions";
    
    for (let i = 0; i < obj.questions.length; i++) {
        // Question Box
        const question = document.createElement("div");
        question.className = "question-box";

        // Title
        const titleWrapper = document.createElement("div");
        titleWrapper.className = "title-wrapper";

        const title = document.createElement("h2");
        title.textContent = obj.questions[i].title;

        titleWrapper.appendChild(title);
        question.appendChild(titleWrapper);
        
        // Answers
        const answers = obj.questions[i].answers;
        for (let j = 0; j < answers.length; j++) {
            const answer = document.createElement("div");
            answer.className = "answer"
            
            const img = document.createElement("img");
            img.src = answers[j].image;
            
            const text = document.createElement("div");
            text.textContent = answers[j].text;

            answer.appendChild(img);
            answer.appendChild(text);
            question.appendChild(answer);
        }

        questions.appendChild(question);
    }

    fragment.appendChild(header);
    fragment.appendChild(questions);
    page.replaceChildren(fragment);
}