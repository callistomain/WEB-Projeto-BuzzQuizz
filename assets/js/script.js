// INIT =====================================================================================
const url = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes";
const list = document.querySelector(".quizz-list");
const page = document.querySelector(".quizz-page");
const create = document.querySelector(".quizz-create");
renderMainPage();

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
    .then(renderizarQuizz);
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

// Comportamento das respostas ==============================================================
const delay = 2000;
let acertos = 0;
let selecionados = 0;
let quizzAtual;

function renderizarQuizz(resposta) {
    const quizz = resposta.data;
    quizzAtual = quizz;

    let perguntas = '';
    quizz.questions.sort(() => Math.random() - 0.5);
    quizz.questions.forEach(function (pergunta) {
        perguntas += gerarCardPergunta(pergunta);
    });

    page.innerHTML = `
        <div class="page-header">
            <img src="${quizz.image}" alt="">
            <div></div>
            <span>${quizz.title}</span>
        </div>

        <ul class="questions">
            ${perguntas}
        </ul>
    `;
}

function gerarCardPergunta(pergunta) {
    let respostas = "";
    pergunta.answers.forEach(function (resposta) {
        respostas += `
            <div class="answer ${resposta.isCorrectAnswer}" onclick="escolherResposta(this)">
                <img src="${resposta.image}" alt="">
                <div>${resposta.text}</div>
            </div>
        `;
    });

    return `
        <li class="question-box">
            <div class="title-wrapper" style="background-color:${pergunta.color}">
                <h2>${pergunta.title}</h2>
            </div>
            ${respostas}
        </li>
    `
}

function escolherResposta(elemento) {
    if (elemento.classList.contains("selecionado") || elemento.classList.contains("filtro-branco")) return;

    const pai = elemento.parentNode;
    const respostas = pai.querySelectorAll('.answer');

    elemento.classList.add("selecionado");
    for (let i = 0; i < respostas.length; i++) {
        const resposta = respostas[i];
        if (resposta !== elemento) {
            resposta.classList.add("filtro-branco")
        }
    }

    const sibling = pai.nextSibling.nextSibling;
    if (sibling) {
        setTimeout(() => {
            const yOffset = -80; 
            const y = sibling.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth', block: 'start'});
        }, delay);
    }

    selecionados++;
    if (elemento.classList.contains("true")) acertos++;
    resolveResult();
}

function resolveResult() {
    const len = quizzAtual.questions.length;
    if (selecionados === len) {
        const levels = quizzAtual.levels;
        const percentage = Math.floor((acertos / len) * 100);
        let i;
        
        for (i = levels.length-1; i >= 0; i--) {
            if (percentage >= levels[i].minValue) break;
        }

        const level = levels[i];
        setTimeout(() => {
            page.innerHTML += `
            <div class="result-wrapper">
                <div class="result">
                    <div class="title-wrapper" style="background-color:#EC362D">
                        <h2>${percentage}% de acerto: ${level.title}</h2>
                    </div>
                    <img src="${level.image}" alt="">
                    <div class="text">${level.text}</div>
                </div>
            </div>
            `;

            const result = page.querySelector(".result-wrapper");
            const yOffset = -80; 
            const y = result.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth', block: 'start'});
        }, delay);
    }
}

// ============================= Create Quizz ============================
let array_create_quizz=[];
function go_to_create_question(){
    const list_inputs= create.querySelectorAll('input');
    let array=[];
    for (let i = 0;i<list_inputs.length;i++){
        array.push(list_inputs[i].value);
    }
    create.innerHTML=`<p class="title-creation">Crie suas perguntas</p>`;
    for (let i=0;i<array[2];i++){
        create.innerHTML=create.innerHTML+`<div class="box-creation">
        <div class='question-creation'>
        <div onclick='open_question(this)' class='external id${i+1}'>
            <p>Pergunta ${i+1}</p>
            <ion-icon class="" name="create-outline"></ion-icon>
        </div>
        <div class='internal hidden id${i+1}'>
            <input type="text" placeholder="Título do seu quizz">
            <input type="url" placeholder="URL da imagem do seu quizz">
            <input type="number" placeholder="Quantidade de perguntas do quizz">
            <input type="number" placeholder="Quantidade de níveis do quizz">
        </div>
        </div>
        </div>`
    }
        
    create.innerHTML=create.innerHTML+`<button onclick="go_to_create_question()">Prosseguir pra criar níveis</button>`
}

function open_question(element){
    const internal = element.parentNode.querySelector('.internal');
    const ion = element.querySelector('ion-icon');
    internal.classList.toggle('hidden');
    ion.classList.toggle('hidden');
}
