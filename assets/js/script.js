// INIT =====================================================================================
const url = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes";
const list = document.querySelector(".quizz-list");
const page = document.querySelector(".quizz-page");
const create = document.querySelector(".quizz-create");
const loading = document.querySelector(".loading");
let toLoad;
renderMainPage();

// Functions ================================================================================
function renderMainPage() {
    // Render all-quizzes
	const allQuizzesList = document.querySelector(".all-quizzes ul");
    
    startLoading(list);
	axios.get(url)
    .then(promise => {
        const data = promise.data;
        const fragment = document.createDocumentFragment();
        data.forEach(e => fragment.appendChild(createQuizzBox(e)));
        allQuizzesList.replaceChildren(fragment);
        endLoading();
    });
}

// Page 1 > Page 3
function toQuizzCreate() {
	list.classList.add("hidden");
	create.classList.remove("hidden");
	create.innerHTML=`
	<p class="title-creation" >Comece pelo começo</p>
	<div class="box-creation">
	  <input class='creation-space-1' type="text" id="text" placeholder="Título do seu quizz" required>
	  <input class='creation-space-1' type="url" id="url" placeholder="URL da imagem do seu quizz" required>
	  <input class='creation-space-1' type="number" id="number1" placeholder="Quantidade de perguntas do quizz" min="0" required>
	  <input class='creation-space-1' type="number" id="number2" placeholder="Quantidade de níveis do quizz" min="0" required>
	</div>
	<button onclick="validarInfosQuizz()">Prosseguir pra criar perguntas</button>`
    window.scrollTo(0, 0);
}

// Page 1 > Page 2
function toQuizzPage(e) {
    list.classList.add("hidden");
	page.classList.remove("hidden");
    window.scrollTo(0, 0);
    
    startLoading(page);
	axios.get(url + "/" + e.currentTarget.id)
	.then(promise => {
        renderizarQuizz(promise.data);
        endLoading();
    });
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

// HELPERS ==================================================================================
function startLoading(element) {
    console.log(element);
    toLoad = element;
    loading.classList.remove("hidden");
    toLoad.classList.add("hidden");
}

function endLoading() {
    loading.classList.add("hidden");
    toLoad.classList.remove("hidden");
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
let arrayCreateQuizz = [];
let newQuizzData=[];
function goToCreateQuestion() {
	const listInputs = create.querySelectorAll('input');
	for (let i = 0; i < listInputs.length; i++) {
		newQuizzData.push(listInputs[i].value);
	}

	create.innerHTML = `<p class="title-creation">Crie suas perguntas</p>`;
	for (let i = 0; i < newQuizzData[2]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation'>
                <div onclick='' class='external id${i + 1}'>
                    <p>Pergunta ${i + 1}</p>
                    <ion-icon onclick='openQuestion(this.parentNode)' class="" name="create-outline"></ion-icon>
            		<ion-icon onclick='openQuestion(this.parentNode)' class="hidden" name="remove-outline"></ion-icon>
                </div>
                <div class='internal hidden id${i + 1}'>
                    <input class='creation-space-1' type="text" id="text" placeholder="Texto da pergunta">
					<input class='creation-space-1' type="text" id="text" placeholder="Cor de fundo da pergunta" required>
					<p class='creation-space-2'>Resposta correta</p>
					<input class='creation-space-2' type="text" id="text" placeholder="Resposta correta" required>
					<input class='creation-space-1' type="url" id="url" placeholder="URL da imagem" required>
					<p class='creation-space-2' >Resposta incorreta</p>
					<input class='creation-space-2' type="text" id="text" placeholder="Resposta incorreta 1">
					<input class='creation-space-1' type="url" id="url" placeholder="URL da imagem 1" required>
					<input class='creation-space-2' type="text" id="text" placeholder="Resposta incorreta 2">
					<input class='creation-space-1' type="url" id="url" placeholder="URL da imagem 2" required>
					<input class='creation-space-2' type="text" id="text" placeholder="Resposta incorreta 3">
					<input class='creation-space-1' type="url" id="url" placeholder="URL da imagem 3" required>
                </div>
            </div>
        </div>
        `;
	}

	create.innerHTML = create.innerHTML + `<button onclick="validityQuestions()" >Prosseguir pra criar níveis</button>`
	const ion = document.querySelector('.quizz-create ion-icon');
	openQuestion(ion.parentNode);
	window.scrollTo(0,0);
}
function validityQuestions(){
	let valityValue = 1;
	let isAllEmpty = 1;
	const internalBox = create.querySelectorAll('.internal');
	let inputsBoxes = [];
	let allInputs = create.querySelectorAll('input');
	for (let i=0; i<allInputs.length;i++){
		allInputs[i].classList.remove('become-red');
	}
	for (i=0; i<internalBox.length;i++){
		isAllEmpty = 1;
		inputsBoxes = internalBox[i].querySelectorAll('input');
		if (inputsBoxes[0].value.length<=20){
			inputsBoxes[0].classList.add('become-red');
			valityValue = 0;
		}
		for (ii=4;ii<inputsBoxes.length;ii++){
			if (inputsBoxes[ii].value!='')
				isAllEmpty=0;
		}
		if (isAllEmpty){
			for (ii=4;ii<inputsBoxes.length;ii++){
				inputsBoxes[ii].classList.add('become-red');
			}
		}
		if (!/^#[0-9A-Fa-f]{6}$/i.test(inputsBoxes[1].value)){
			inputsBoxes[1].classList.add('become-red');
		}
		if(!inputsBoxes[2].checkValidity()){
			inputsBoxes[2].classList.add('become-red');
		}
		if(!inputsBoxes[3].checkValidity()){
			inputsBoxes[3].classList.add('become-red');
		}
	}
	if (valityValue === 1)
		goToCreateLevel();
}

function goToCreateLevel(){
	create.innerHTML = `<p class="title-creation">Agora, decida os níveis!</p>`;
	for (let i = 0; i < newQuizzData[2]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation'>
                <div onclick='' class='external id${i + 1}'>
                    <p>Nível ${i + 1}</p>
                    <ion-icon onclick='openQuestion(this.parentNode)' class="" name="create-outline"></ion-icon>
            		<ion-icon onclick='openQuestion(this.parentNode)' class="hidden" name="remove-outline"></ion-icon>
                </div>
                <div class='internal hidden id${i + 1}'>
                    <input class='creation-space-1' type="text" id="text" placeholder="Título do nível">
					<input class='creation-space-1' type="text" id="text" placeholder="% de acerto mínima">
					<input class='creation-space-1' type="url" id="text" placeholder="URL da imagem do nível">
					<textarea class='creation-space-1' placeholder="Descrição do nível"></textarea> 
                </div>
            </div>
        </div>
        `;
	}
	create.innerHTML = create.innerHTML + `<button onclick="goToCreateLevel()" >Finalizar Quizz</button>`
	const ion = document.querySelector('.quizz-create ion-icon');
	openQuestion(ion.parentNode);
	window.scrollTo(0,0);
}

function openQuestion(element) {
	const internal = element.parentNode.querySelector('.internal');
	const ion = element.querySelectorAll('ion-icon');
	internal.classList.toggle('hidden');
	for(let i=0;i<ion.length;i++){
        ion[i].classList.toggle('hidden');
    };
	// validarQuizz();
}

// Validação do Quizz ===========================================================================
function validarInfosQuizz() {
	arrayCreateQuizz = {
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

	arrayCreateQuizz.titulo = titulo.value;
	arrayCreateQuizz.imagem = imagem.value;
	arrayCreateQuizz.quantidadeDePerguntas = quantidadeDePerguntas.value;
	arrayCreateQuizz.quantidadeDeNiveis = quantidadeDeNiveis.value;

	if (arrayCreateQuizz.titulo.length < 20 || arrayCreateQuizz.titulo.length > 65) {
		alert('O título deve ter no mínimo 20 caracteres e no máximo 65');
		return;
	} else if (!imagem.validity.valid) {
		alert('O valor informado não é uma URL válida');
		return;
    } else if (arrayCreateQuizz.quantidadeDePerguntas < 3) {
		alert('Quantidade mínima de perguntas 3');
		return;
	} else if (arrayCreateQuizz.quantidadeDeNiveis < 2) {
		alert('Quantidade mínima de níveis 2');
		return;
	}

    goToCreateQuestion();
}
