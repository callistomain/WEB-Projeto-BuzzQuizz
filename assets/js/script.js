// INIT =====================================================================================
const url = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes";
const list = document.querySelector(".quizz-list");
const page = document.querySelector(".quizz-page");
const create = document.querySelector(".quizz-create");
const loading = document.querySelector(".loading");
let toLoad;
renderMainPage();

// Functions ================================================================================
function testQuizz(element){
	const myQuizzesList = document.querySelector(".my-quizzes ul");
	if (myQuizzesList.innerHTML=='')
		myQuizzesList.replaceChildren(createQuizzBox(element.data, true));
	else
		myQuizzesList.appendChild(createQuizzBox(element.data, true));
}

function renderMainPage() {
	// Render all-quizzes
	const allQuizzesList = document.querySelector(".all-quizzes ul");
	const myQuizzesList = document.querySelector(".my-quizzes ul");
	startLoading(list);

	let text;
	myQuizzesList.innerHTML = '';
    document.querySelector(".empty-quizz").classList.remove("hidden");
    document.querySelector(".my-title").classList.add("hidden");
    document.querySelector(".my-quizzes").classList.add("hidden");
	const userList = JSON.parse(localStorage.getItem("userList"));
	if (userList != null) {
        if (userList.length) {
            document.querySelector(".empty-quizz").classList.add("hidden");
            document.querySelector(".my-title").classList.remove("hidden");
            document.querySelector(".my-quizzes").classList.remove("hidden");
            for (let j = 0; j < userList.length; j++){
                text = axios.get(url + '/' + userList[j].id);
                text.then(testQuizz);
            }
        }
	}

	// All Quizzes
	axios.get(url)
    .then(promise => {
        const allQuizzes = promise.data;
        fragment = document.createDocumentFragment();
        allQuizzes.forEach(e => fragment.appendChild(createQuizzBox(e)));
        allQuizzesList.replaceChildren(fragment);

        endLoading();
    }).catch(endLoading);
}

// Page 1 > Page 2
function homeToPage(e) {
	list.classList.add("hidden");
	page.classList.remove("hidden");
	window.scrollTo(0, 0);
    
	startLoading(page);
	axios.get(url + "/" + e.currentTarget.parentNode.id)
    .then(promise => {
        renderizarQuizz(promise.data);
        endLoading();
    }).catch(endLoading);
}

// Page 2 > Page 1
function pageToHome() {
    page.classList.add("hidden");
    list.classList.remove("hidden");
    window.scrollTo(0, 0);
    renderMainPage();
}

// Page 1 > Page 3
function homeToCreate() {
    list.classList.add("hidden");
    create.classList.remove("hidden");
    create.innerHTML = `
        <p class="title-creation" >Comece pelo come??o</p>
        <div class="box-creation">
            <input class='creation-space-1' type="text" id="text" placeholder="T??tulo do seu quizz" required>
            <input class='creation-space-1' type="url" id="url" placeholder="URL da imagem do seu quizz" required>
            <input class='creation-space-1' type="number" id="number1" placeholder="Quantidade de perguntas do quizz" min="0" required>
            <input class='creation-space-1' type="number" id="number2" placeholder="Quantidade de n??veis do quizz" min="0" required>
        </div>
        <button class='button' onclick="validarInfosQuizz()">Prosseguir pra criar perguntas</button>
    `;
    window.scrollTo(0, 0);
}

// DOM ======================================================================================
function createQuizzBox(obj, fromUser) {
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

	if (fromUser) {
		const iconsWrapper = document.createElement("div");
		iconsWrapper.className = "icons-wrapper";

		const iconEdit = document.createElement("ion-icon");
		iconEdit.setAttribute("name", "create-outline");
		iconEdit.addEventListener("click", () => quizzEdit(obj));

		const iconDelete = document.createElement("ion-icon");
		iconDelete.setAttribute("name", "trash-outline");
		iconDelete.addEventListener("click", () => quizzDelete(obj));

		iconsWrapper.appendChild(iconEdit);
		iconsWrapper.appendChild(iconDelete);
		quizzBox.appendChild(iconsWrapper);
	}

	grad.addEventListener("click", homeToPage);
	title.addEventListener("click", homeToPage);
    quizzBox.setAttribute("data-identifier", "quizz-card");
	return quizzBox;
}

// HELPERS ==================================================================================
function startLoading(element) {
	toLoad = element;
	loading.classList.remove("hidden");
	toLoad.classList.add("hidden");
}

function endLoading() {
	loading.classList.add("hidden");
	toLoad.classList.remove("hidden");
}

// Comportamento das respostas ==============================================================
const delay = 2000;
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
    pergunta.answers.sort(() => Math.random() - 0.5);
	pergunta.answers.forEach(function (resposta) {
		respostas += `
            <div class="answer ${resposta.isCorrectAnswer}" onclick="escolherResposta(this)" data-identifier="answer">
                <img src="${resposta.image}" alt="">
                <div>${resposta.text}</div>
            </div>
        `;
	});

	return `
        <li class="question-box" data-identifier="question">
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

        levels.sort((a, b) => a.minValue - b.minValue);
		for (i = levels.length - 1; i >= 0; i--) {
			if (percentage >= levels[i].minValue) break;
		}

		const level = levels[i];
		setTimeout(() => {
			page.innerHTML += `
            <div class="result-wrapper" data-identifier="quizz-result">
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
let newQuizzData = [];

function goToCreateQuestion() {
	newQuizzData = [];
	const listInputs = create.querySelectorAll('input');

	for (let i = 0; i < listInputs.length; i++) {
		newQuizzData.push(listInputs[i].value);
	}

	create.innerHTML = `<p class="title-creation">Crie suas perguntas</p>`;
	for (let i = 0; i < newQuizzData[2]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation' data-identifier="question-form">
                <div onclick='' class='external id${i}'>
                    <p>Pergunta ${i + 1}</p>
                    <ion-icon onclick='toggleQuestion(this.parentNode)' class="" name="create-outline" data-identifier="expand"></ion-icon>
            		<ion-icon onclick='toggleQuestion(this.parentNode)' class="hidden" name="remove-outline"></ion-icon>
                </div>
                <div class='internal hidden id${i}'>
                    <input class='creation-space-1' type="text" id="text" placeholder="Texto da pergunta">
					<input class='creation-space-1' type="color" id="color" placeholder="Cor de fundo da pergunta" required>
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

	create.innerHTML = create.innerHTML + `<button class='button' onclick="validityQuestions()" >Prosseguir pra criar n??veis</button>`
	const ion = document.querySelector('.quizz-create ion-icon');
	toggleQuestion(ion.parentNode);
	window.scrollTo(0, 0);
}

function goToCreateLevel(){
	create.innerHTML = `<p class="title-creation">Agora, decida os n??veis!</p>`;
	for (let i = 0; i < newQuizzData[3]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation'>
                <div onclick='' class='external id${i + 1}'>
                    <p>N??vel ${i + 1}</p>
                    <ion-icon onclick='toggleQuestion(this.parentNode)' class="" name="create-outline" data-identifier="expand"></ion-icon>
            		<ion-icon onclick='toggleQuestion(this.parentNode)' class="hidden" name="remove-outline"></ion-icon>
                </div>
                <div class='internal hidden id${i + 1}' data-identifier="level">
                    <input class='creation-space-1' type="text" id="text" placeholder="T??tulo do n??vel">
					<input class='creation-space-1' type="number" id="number" placeholder="% de acerto m??nima" required>
					<input class='creation-space-1' type="url" id="text" placeholder="URL da imagem do n??vel" required>
					<textarea class='creation-space-1' placeholder="Descri????o do n??vel"></textarea> 
                </div>
            </div>
        </div>
        `;
	}
	create.innerHTML = create.innerHTML + `<button class='button' onclick="validityLevels()" >Finalizar Quizz</button>`
	const ion = document.querySelector('.quizz-create ion-icon');
	toggleQuestion(ion.parentNode);
	window.scrollTo(0,0);
}

function goToCreateEnd(element){
	loading.classList.add('hidden');
	let listaSerializada = localStorage.getItem("lista");
	const lista = JSON.parse(listaSerializada);
    
	let lista2 = JSON.parse(localStorage.getItem("userList"));
	if (lista2) {
		lista2.push({
            id: element.data.id,
			secretKey: element.data.key
		});
	} else {
		lista2 = [{
            id: element.data.id,
			secretKey: element.data.key
		}];
	}
	localStorage.setItem("userList", JSON.stringify(lista2));

	create.innerHTML = `
        <p class="title-creation">Seu quizz est?? pronto!</p>
        <div class="quizz-box-2" id="${element.data.id}">
            <img src=${lista[0].image}>
            <div class="gradient"></div>
            <span>${lista[0].title}</span>
        </div>
        <button class='create-end' id="${element.data.id}">Acessar Quizz</button>
        <h4 onclick="returnToHome()">Voltar pra home</h4>
    `;

	window.scrollTo(0,0);
	const image = create.querySelector('.quizz-box-2');
	image.addEventListener("click", createToPage);
	const button = create.querySelector('button');
	button.addEventListener("click", createToPage);
    endLoading();
}

function getEndToEdit(element){
	loading.classList.add('hidden');
	create.innerHTML = `
        <p class="title-creation">Seu quizz foi editado!</p>
        <div class="quizz-box-2" id="${element.data.id}">
            <img src=${element.data.image}>
            <div class="gradient"></div>
            <span>${element.data.title}</span>
        </div>
        <button class='create-end' id="${element.data.id}">Acessar Quizz</button>
        <h4 onclick="returnToHome()">Voltar pra home</h4>
    `;

	window.scrollTo(0,0);
	const image = create.querySelector('.quizz-box-2');
	image.addEventListener("click", createToPage);
	const button = create.querySelector('button');
	button.addEventListener("click", createToPage);
    endLoading();
}

function getQuestions(){
	const internalBox = create.querySelectorAll('.internal');
	let inputsBoxes = [];
	let arrayQuestions = [];
	let arrayAswers = [];
	for (i=0; i<internalBox.length;i++){
		inputsBoxes = internalBox[i].querySelectorAll('input');
		arrayQuestions.push({
			title: inputsBoxes[0].value,
			color: inputsBoxes[1].value,
			answers: [
				{
					text: inputsBoxes[2].value,
					image: inputsBoxes[3].value,
					isCorrectAnswer: true
				}
			]});
		arrayAswers = arrayQuestions[i].answers;
		for (ii=4;ii<10;ii+=2){
			if (inputsBoxes[ii].value!==''){
				arrayAswers.push({
					text: inputsBoxes[ii].value,
					image: inputsBoxes[ii+1].value,
					isCorrectAnswer: false
				})
			}
		}
		arrayQuestions[i].answers = arrayAswers;
	}
	arrayCreateQuizz[0].questions = arrayQuestions;
}

function getLevels(){
	const internalBox = create.querySelectorAll('.internal');
	let inputsBoxes = [];
	let arrayLevels = [];
	let textBox;
	for (i=0; i<internalBox.length;i++){
		inputsBoxes = internalBox[i].querySelectorAll('input');
		textBox = internalBox[i].querySelector('textarea');
		arrayLevels.push({
			title: inputsBoxes[0].value,
			image: inputsBoxes[2].value,
			text: textBox.value,
			minValue: Number(inputsBoxes[1].value)
			});
	}
	arrayCreateQuizz[0].levels = arrayLevels;
}

function exportQuizz() {
	const exemploSerializado = JSON.stringify(arrayCreateQuizz);
	localStorage.setItem("lista", exemploSerializado);
	loading.classList.remove('hidden');
    startLoading(create);
	let response = axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', arrayCreateQuizz[0]);
	response.then(goToCreateEnd);
    response.catch(endLoading);
}

function exportQuizz2() {
	//objectPcEdit
	arrayEditQuizz = [{
		title: arrayCreateQuizz[0].title,
		image: arrayCreateQuizz[0].image,
		questions: arrayCreateQuizz[0].questions,
		levels: arrayCreateQuizz[0].levels
	}];
	loading.classList.remove('hidden');
    startLoading(create);
	let response = axios.put('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/'+objectPcEdit.id, arrayEditQuizz[0], {headers: {"Secret-Key": objectPcEdit.secretKey},});
	response.then(getEndToEdit);
    response.catch(endLoading);
}

function toggleQuestion(element) {
	const internal = element.parentNode.querySelector('.internal');
	const ion = element.querySelectorAll('ion-icon');
	internal.classList.toggle('hidden');
	for(let i=0;i<ion.length;i++){
        ion[i].classList.toggle('hidden');
    }
}

function openQuestion(element) {
	const internal = element.parentNode.querySelector('.internal');
	const ion = element.querySelectorAll('ion-icon');
	internal.classList.remove('hidden');
	ion[0].classList.add('hidden');
	ion[1].classList.remove('hidden');
}

function closeQuestion(element) {
	const internal = element.parentNode.querySelector('.internal');
	const ion = element.querySelectorAll('ion-icon');
	internal.classList.add('hidden');
	ion[0].classList.remove('hidden');
	ion[1].classList.add('hidden');
}

// Page 3 > Page 2
function createToPage(e) {
    create.classList.add("hidden");
	page.classList.remove("hidden");
    window.scrollTo(0, 0);
    
    startLoading(page);
	axios.get(url + "/" + e.currentTarget.id)
	.then(promise => {
        renderizarQuizz(promise.data);
        endLoading();
    }).catch(endLoading);
}
// Quizz Edit ===================================================================================
let objectPcEdit;
function quizzEdit(element) {
	let response = axios.get(url+'/'+element.id);
	const userList = JSON.parse(localStorage.getItem("userList"));
	for (i=0;i<userList.length;i++){
		if(element.id==userList[i].id)
			objectPcEdit=userList[i];
	}
	response.then(getQuizzToEdit);
}

let arrayEditQuizz;
function getQuizzToEdit(element) {
	let object = [{
		title: element.data.title,
		image: element.data.image,
		questions: element.data.questions,
		levels: element.data.levels
	}];
	arrayEditQuizz=object;
	homeToCreate();
	let arrayInputs = create.querySelectorAll('input');
	arrayInputs[0].value=arrayEditQuizz[0].title;
	arrayInputs[1].value=arrayEditQuizz[0].image;
	arrayInputs[2].value=arrayEditQuizz[0].questions.length;
	arrayInputs[3].value=arrayEditQuizz[0].levels.length;
	create.querySelector('p').innerHTML='Editar o come??o';
	create.querySelector('button').innerHTML='Prosseguir pra editar perguntas';
	create.querySelector('button').onclick=goToEditQuestions;
}

function goToEditQuestions(){
	const vality = validarInfosQuizz();
	if (vality==1)
		getQuestionsToEdit();
}

function goToEditLevels(){
	const vality = validityQuestions();
	if (vality==1)
		getLevelsToEdit();
}

function goToEditEnd(){
	const vality = validityLevels('ok');
	if (vality==1){
		exportQuizz2();
	}
}

function getQuestionsToEdit(){
	let arrayInternals = create.querySelectorAll('.internal');
	let arrayInputs;
	let maxQuestions;
	if (arrayEditQuizz[0].questions.length<arrayInternals.length)
		maxQuestions=arrayEditQuizz[0].questions.length;
	else
		maxQuestions=arrayInternals.length
	for (i=0;i<maxQuestions;i++){
		arrayInputs = arrayInternals[i].querySelectorAll('input');
		//title: "T??tulo da pergunta 1",
		//color: "#123456",
		arrayInputs[0].value=arrayEditQuizz[0].questions[i].title;
		arrayInputs[1].value=arrayEditQuizz[0].questions[i].color;
		for (j=2;j<(arrayEditQuizz[0].questions[i].answers.length*2)+2;j+=2){
			//text: "Texto da resposta 1",
			//image: "https://http.cat/411.jpg",
			arrayInputs[j].value=arrayEditQuizz[0].questions[i].answers[(j/2)-1].text;
			arrayInputs[j+1].value=arrayEditQuizz[0].questions[i].answers[(j/2)-1].image;
		}
	}
	create.querySelector('p').innerHTML='Edite suas perguntas';
	create.querySelector('button').innerHTML='Prosseguir pra editar n??veis';
	create.querySelector('button').onclick=goToEditLevels;
}

function getLevelsToEdit(){
	let arrayInternals = create.querySelectorAll('.internal');
	let arrayInputs;
	let maxLevels;
	if (arrayEditQuizz[0].levels.length<arrayInternals.length)
		maxLevels=arrayEditQuizz[0].levels.length;
	else
		maxLevels=arrayInternals.length
	for (i=0;i<maxLevels;i++){
		arrayInputs = arrayInternals[i].querySelectorAll('input');
		arrayInputs[0].value=arrayEditQuizz[0].levels[i].title;
		arrayInputs[1].value=arrayEditQuizz[0].levels[i].minValue;
		arrayInputs[2].value=arrayEditQuizz[0].levels[i].image;
		arrayInternals[i].querySelector('textarea').value=arrayEditQuizz[0].levels[i].text;
	}
	create.querySelector('p').innerHTML='Edite seus n??veis!';
	create.querySelector('button').innerHTML='Finalizar edi????o';
	create.querySelector('button').onclick=goToEditEnd;
}
// Valida????o do Quizz ===========================================================================
function validarInfosQuizz() {
	let valityValue = 1;
	arrayCreateQuizz = [{
		title:'',
		image:'',
		questions: [],
		levels:[],
	}];
	let allInputs = create.querySelectorAll('input');
	let allH1 = create.querySelectorAll('h1');
	for (let i=0; i<allInputs.length;i++){
		allInputs[i].classList.remove('become-red');
		allInputs[i].classList.remove('become-red-2');
		allInputs[i].classList.remove('become-red-3');
	}
	for (i=0; i<allH1.length;i++){
		allH1[i].remove();
	}
	const titulo = document.querySelector("#text");
	const imagem = document.querySelector("#url");
	const quantidadeDePerguntas = document.querySelector("#number1");
	const quantidadeDeNiveis = document.querySelector("#number2");
	const inputsBoxes = create.querySelectorAll('input');

	arrayCreateQuizz[0].title = titulo.value;
	arrayCreateQuizz[0].image = imagem.value;
	

	if (arrayCreateQuizz[0].title.length < 20 || arrayCreateQuizz[0].title.length > 65) {
		inputsBoxes[0].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[0].insertAdjacentHTML("afterend", "<h1>O t??tulo deve ter no m??nimo 20 caracteres e no m??ximo 65.</h1>");
	} if (!imagem.validity.valid) {
		inputsBoxes[1].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[1].insertAdjacentHTML("afterend", "<h1>O valor informado n??o ?? uma URL v??lida.</h1>");
	} if (quantidadeDePerguntas.value < 3) {
		inputsBoxes[2].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[2].insertAdjacentHTML("afterend", "<h1>Quantidade m??nima de perguntas 3.</h1>");
	} if (quantidadeDeNiveis.value < 2) {
		inputsBoxes[3].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[3].insertAdjacentHTML("afterend", "<h1>Quantidade m??nima de n??veis 2.</h1>");
	}
	if (valityValue === 1){
    	goToCreateQuestion();
		return 1;
	}
	else
		return 0;
}

function validityQuestions(){
	let valityValue = 1;
	let isAllEmpty = 1;
	let html = "<h1>My new paragraph.</h1>";
	const internalBox = create.querySelectorAll('.internal');
	let inputsBoxes = [];
	let allInputs = create.querySelectorAll('input');
	let allH1 = create.querySelectorAll('h1');
	let allH2 = create.querySelectorAll('h2');
	let allH3 = create.querySelectorAll('h3');
	for (let i = 0; i < allInputs.length; i++) {
		allInputs[i].classList.remove('become-red');
		allInputs[i].classList.remove('become-red-2');
		allInputs[i].classList.remove('become-red-3');
	}
	for (i = 0; i < internalBox.length; i++) {
		internalBox[i].parentNode.classList.remove('error');
	}
	for (i = 0; i < allH1.length; i++) {
		allH1[i].remove();
	}
	for (i = 0; i < allH3.length; i++) {
		allH3[i].remove();
	}
	for (i = 0; i < allH2.length; i++) {
		allH2[i].remove();
	}
	for (i = 0; i < internalBox.length; i++) {
		isAllEmpty = 1;
		inputsBoxes = internalBox[i].querySelectorAll('input');
		if (inputsBoxes[0].value.length<20){
			internalBox[i].parentNode.classList.add('error');
			inputsBoxes[0].classList.add('become-red');
			valityValue = 0;
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			inputsBoxes[0].insertAdjacentHTML("afterend", "<h1>O texto deve ter mais que 20 caracteres.</h1>");
		}
		for (ii = 4; ii < inputsBoxes.length; ii++) {
			if (inputsBoxes[ii].value != '')
				isAllEmpty = 0;
		}
		if (inputsBoxes[2].value === '' && inputsBoxes[3].value === '') {
			internalBox[i].parentNode.classList.add('error');
			inputsBoxes[2].classList.add('become-red');
			inputsBoxes[3].classList.add('become-red');
			inputsBoxes[2].insertAdjacentHTML("beforebegin", "<h3>Coloque uma resposta correta.</h3>");
			valityValue = 0;
		}else{
			if(!inputsBoxes[2].checkValidity()){
				internalBox[i].parentNode.classList.add('error');
				inputsBoxes[2].classList.add('become-red');
				openQuestion(internalBox[i].parentNode.querySelector('.external'));
				inputsBoxes[2].insertAdjacentHTML("afterend", "<h1>Este campo n??o pode ficar vazio.</h1>");
				valityValue = 0;
			}
			if (!inputsBoxes[3].checkValidity()) {
				internalBox[i].parentNode.classList.add('error');
				inputsBoxes[3].classList.add('become-red');
				openQuestion(internalBox[i].parentNode.querySelector('.external'));
				inputsBoxes[3].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
				valityValue = 0;
			}}
		if (isAllEmpty){
			inputsBoxes[4].insertAdjacentHTML("beforebegin", "<h2>Coloque pelo menos uma resposta incorreta.</h2>");
			for (ii = 4; ii < inputsBoxes.length; ii++) {
				internalBox[i].parentNode.classList.add('error');
				inputsBoxes[ii].classList.add('become-red-2');
				openQuestion(internalBox[i].parentNode.querySelector('.external'));
				valityValue = 0;
			}
		}
		else {
			if (inputsBoxes[4].value !== '' || inputsBoxes[5].value !== '') {
				if (inputsBoxes[4].value === '') {
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[4].classList.add('become-red-3');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[4].insertAdjacentHTML("afterend", "<h1>Este campo n??o pode ficar vazio.</h1>");
					valityValue = 0;
				}if(!inputsBoxes[5].checkValidity()){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[5].classList.add('become-red');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[5].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
					valityValue = 0;
				}
			} if (inputsBoxes[6].value !== '' || inputsBoxes[7].value !== '') {
				if (inputsBoxes[6].value === '') {
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[6].classList.add('become-red-3');
					inputsBoxes[6].insertAdjacentHTML("afterend", "<h1>Este campo n??o pode ficar vazio.</h1>");
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					valityValue = 0;
				}if(!inputsBoxes[7].checkValidity()){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[7].classList.add('become-red');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[7].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
					valityValue = 0;
				}
			} if (inputsBoxes[8].value !== '' || inputsBoxes[9].value !== '') {
				if (inputsBoxes[8].value === '') {
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[8].classList.add('become-red-3');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[8].insertAdjacentHTML("afterend", "<h1>Este campo n??o pode ficar vazio.</h1>");
					valityValue = 0;
				}if(!inputsBoxes[9].checkValidity()){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[9].classList.add('become-red');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[9].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
					valityValue = 0;
				}
			}
		}
	}
	for (ii = 0; ii < internalBox.length; ii++) {
		if (!internalBox[ii].parentNode.classList.contains('error')) {
			closeQuestion(internalBox[ii].parentNode.querySelector('.external'));
		}
	}
	if (valityValue === 1){
		getQuestions();
		goToCreateLevel();
		return 1;
	}else{
		window.scrollTo(0,0);
		return 0;
	}
}


function validityLevels(edit) {
	let valityValue = 1;
	let thereA0Percent = 0;
	const internalBox = create.querySelectorAll('.internal');
	let inputsBoxes = [];
	let allInputs = create.querySelectorAll('input');
	let allText = create.querySelectorAll('textarea');
	let allH1 = create.querySelectorAll('h1');
	let allH2 = create.querySelectorAll('h2');
	let allH3 = create.querySelectorAll('h3');
	inputsBoxes = create.querySelectorAll('input');
	for (let i = 0; i < allInputs.length; i++) {
		allInputs[i].classList.remove('become-red');
		allInputs[i].classList.remove('become-red-2');
		allInputs[i].classList.remove('become-red-3');
	}
	for (i = 0; i < allH1.length; i++) {
		allH1[i].remove();
	}
	for (i = 0; i < allText.length; i++) {
		allText[i].classList.remove('become-red');
	}
	for (i = 0; i < allH2.length; i++) {
		allH2[i].remove();
	}
	for (i = 0; i < allH3.length; i++) {
		allH3[i].remove();
	}
	for (i = 0; i < internalBox.length; i++) {
		internalBox[i].parentNode.classList.remove('error');
	}
	for (i = 0; i < internalBox.length; i++) {
		if (internalBox[i].querySelector("#number").value == 0 || internalBox[i].querySelector("#number").value === '') {
			thereA0Percent = 1;
		}
	}
	if (thereA0Percent === 0) {
		for (i = 0; i < internalBox.length; i++) {
			internalBox[i].querySelector('input').insertAdjacentHTML('beforebegin', "<h3>Deve ter pelo menos um n??vel minimo 0.</h3>");
			internalBox[i].querySelector("#number").classList.add('become-red');
			internalBox[i].parentNode.classList.add('error');
			valityValue = 0;
		}
	}

	for (i = 0; i < internalBox.length; i++) {
		isAllEmpty = 1;
		inputsBoxes = internalBox[i].querySelectorAll('input');
		if (inputsBoxes[0].value.length < 10) {
			internalBox[i].parentNode.classList.add('error');
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			inputsBoxes[0].classList.add('become-red');
			valityValue = 0;
			inputsBoxes[0].insertAdjacentHTML("afterend", "<h1>O t??tulo do n??vel deve ter no m??nimo 10 caracteres.</h1>");
		} if ((inputsBoxes[1].value < 0 || inputsBoxes[1].value > 100 || inputsBoxes[1].value === '') && thereA0Percent === 1) {
			internalBox[i].parentNode.classList.add('error');
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			inputsBoxes[1].classList.add('become-red');
			valityValue = 0;
			inputsBoxes[1].insertAdjacentHTML("afterend", "<h1>O valor deve estar entre 0 e 100.</h1>");
		} if (!inputsBoxes[2].checkValidity()) {
			internalBox[i].parentNode.classList.add('error');
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			inputsBoxes[2].classList.add('become-red');
			valityValue = 0;
			inputsBoxes[2].insertAdjacentHTML("afterend", "<h1>O valor informado n??o ?? uma URL v??lida.</h1>");
		} if (internalBox[i].querySelector('textarea').value.length < 30) {
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			internalBox[i].parentNode.classList.add('error');
			internalBox[i].querySelector('textarea').classList.add('become-red');
			valityValue = 0;
			internalBox[i].querySelector('textarea').insertAdjacentHTML("afterend", "<h1>A descri????o do n??vel deve ter no m??nimo 30 caracteres.</h1>");
		}
	}
	for (ii = 0; ii < internalBox.length; ii++) {
		if (!internalBox[ii].parentNode.classList.contains('error')) {
			closeQuestion(internalBox[ii].parentNode.querySelector('.external'));
		}
	}
	if (valityValue === 1&&edit!=='ok'){
		getLevels();
		exportQuizz();
		create.innerHTML=``;
	}else if(edit==='ok') {
		getLevels();
		create.innerHTML=``;
		return 1;
	}else
		window.scrollTo(0,0);
		return 0;
}

function returnToHome() {
	page.classList.add('hidden');
	create.classList.add('hidden');
	list.classList.remove('hidden');
    window.scrollTo(0, 0);
	renderMainPage();
}

//-------------------------botao excluir----------
function quizzDelete(element) {
    const confirmar = window.confirm('Confirme para excluir o quizz');

    if (confirmar === true) {
        let objectExcluir;

        const myQuizzList = JSON.parse(localStorage.getItem("userList"));
        for (let i = 0; i < myQuizzList.length; i++){
            if (element.id === myQuizzList[i].id) {
                objectExcluir = myQuizzList[i];
                myQuizzList.splice(i, 1);
                break;
            }
        }

        localStorage.setItem("userList", JSON.stringify(myQuizzList));

        const promessa = axios.delete(url + "/" + objectExcluir.id, {headers: {"Secret-Key": objectExcluir.secretKey}});
        startLoading(list);
        promessa.then(renderMainPage);
        promessa.catch(endLoading);
    }
}
