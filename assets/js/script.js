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
let acertos = 0;

function renderizarQuizz(resposta) {
    const quizz = resposta.data;

    let perguntas = '';
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
        }, 2000);
    }

    if (elemento.classList.contains("true")) acertos++;
}


























// function escolherResposta(elemento, correta, indicePergunta) {
//     const containerRespostas = elemento.parentNode;
  
//     // impedindo que uma pergunta já respondida seja respondida de novo
//     if (containerRespostas.classList.contains('respondido')) {
//       return;
//     }
  
//     contadorPerguntasRespondidas += 1;
  
//     if (correta) {
//       contadorRespostasCorretas += 1;
//     }
  
//     // quando o elemento pai tem a classe respondido as respostas recebem as cores
//     containerRespostas.classList.add('respondido');
  
//     // colocando transparência no restante
//     const respostas = containerRespostas.querySelectorAll('.resposta');
  
//     for (let i = 0; i < respostas.length; i++) {
//       const resposta = respostas[i];
  
//       if (elemento !== resposta) {
//         resposta.classList.add('transparente');
//       }
//     }
  
//     if (contadorPerguntasRespondidas !== quizzAtual.questions.length) {
//       if (indicePergunta !== quizzAtual.questions.length - 1) {
//         const proximaPergunta = document.querySelector(
//           `.pergunta-${indicePergunta + 1}`
//         );
//         scrollarParaElemento(proximaPergunta);
//       }
//     } else {
//       calcularEExibirNivel();
//       const nivel = document.querySelector('.nivel');
//       scrollarParaElemento(nivel);
//     }
//   }

  