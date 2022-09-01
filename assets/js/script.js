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
		.then(promise => {
			const data = promise.data;
			const fragment = document.createDocumentFragment();
			data.forEach(e => fragment.appendChild(createQuizzBox(e)));
			allQuizzesList.replaceChildren(fragment);
		});
}

// Page 1 > Page 3
function toQuizzCreate() {
	list.classList.add("hidden");
	create.classList.remove("hidden");
    window.scrollTo(0, 0);
}

// Page 1 > Page 2
function toQuizzPage(e) {
	list.classList.add("hidden");
	page.classList.remove("hidden");
    window.scrollTo(0, 0);

	axios.get(url + "/" + e.currentTarget.id)
		.then(promise => renderizarQuizz(promise.data));
}

function pageToHome() {
    page.classList.add("hidden");
    list.classList.remove("hidden");
    window.scrollTo(0, 0);
    renderMainPage();
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
const delay = 100; // 2000
let acertos, selecionados, quizzAtual;

function renderizarQuizz(quizz) {
    acertos = 0;
    selecionados = 0;
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
			window.scrollTo({ top: y, behavior: 'smooth', block: 'start' });
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

		for (i = levels.length - 1; i >= 0; i--) {
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
            <div class="quizz-options">
                <button class="reset-quizz" onclick="resetQuizz()">Reiniciar Quizz</button>
                <div class="quit-quizz" onclick="pageToHome()">Voltar para home<div>
            </div>
            `;

			const result = page.querySelector(".result-wrapper");
			const yOffset = -80;
			const y = result.getBoundingClientRect().top + window.pageYOffset + yOffset;
			window.scrollTo({ top: y, behavior: 'smooth', block: 'start' });
		}, delay);
	}
}

function resetQuizz() {
    renderizarQuizz(quizzAtual);
    window.scrollTo(0, 0);
}

// Create Quizz ==================================================================
let array_create_quizz = [];

function go_to_create_question() {
	const list_inputs = create.querySelectorAll('input');
	let array = [];

	for (let i = 0; i < list_inputs.length; i++) {
		array.push(list_inputs[i].value);
	}

	create.innerHTML = `<p class="title-creation">Crie suas perguntas</p>`;
	for (let i = 0; i < array[2]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation'>
                <div onclick='' class='external id${i + 1}'>
                    <p>Pergunta ${i + 1}</p>
                    <ion-icon onclick='open_question(this.parentNode)' class="" name="create-outline"></ion-icon>
            		<ion-icon onclick='open_question(this.parentNode)' class="hidden" name="remove-outline"></ion-icon>
                </div>
                <div class='internal hidden id${i + 1}'>
                    <input type="text" id="text" placeholder="Título do seu quizz">
                    <input type="url" id="url" placeholder="URL da imagem do seu quizz">
                    <input type="number" id="number1" placeholder="Quantidade de perguntas do quizz">
                    <input type="number" id="number2" placeholder="Quantidade de níveis do quizz">
                </div>
            </div>
        </div>
        `;
	}

	create.innerHTML = create.innerHTML + `<button onclick"">Prosseguir pra criar níveis</button>`
}

function open_question(element) {
	const internal = element.parentNode.querySelector('.internal');
	const ion = element.querySelector('ion-icon');
	internal.classList.toggle('hidden');
	ion.classList.toggle('hidden');
	// validarQuizz();
}

// Validação do Quizz ===========================================================================
function validarInfosQuizz() {
	array_create_quizz = {
		titulo:'',
		imagem:'',
		quantidadeDePerguntas: 0,
		quantidadeDeNiveis: 0,
		perguntas: [],
		niveis:[],
	}
	
	const titulo = document.querySelector("#text");
	const imagem = document.querySelector("#url");
	const quantidadeDePerguntas = document.querySelector("#number1");
	const quantidadeDeNiveis = document.querySelector("#number2");

	array_create_quizz.titulo = titulo.value;
	array_create_quizz.imagem = imagem.value;
	array_create_quizz.quantidadeDePerguntas = quantidadeDePerguntas.value;
	array_create_quizz.quantidadeDeNiveis = quantidadeDeNiveis.value;

	if (array_create_quizz.titulo.length < 20 || array_create_quizz.titulo.length > 65) {
		alert('O título deve ter no mínimo 20 caracteres e no máximo 65');
		return;
	} else if (!imagem.validity.valid) {
		alert('O valor informado não é uma URL válida');
		return;
    } else if (array_create_quizz.quantidadeDePerguntas < 3) {
		alert('Quantidade mínima de perguntas 3');
		return;
	} else if (array_create_quizz.quantidadeDeNiveis < 2) {
		alert('Quantidade mínima de níveis 2');
		return;
	}

    go_to_create_question();
}
