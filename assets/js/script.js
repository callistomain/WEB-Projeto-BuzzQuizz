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
    let fragment;
    
    startLoading(list);
	axios.get(url)
    .then(promise => {
        const allQuizzes = promise.data;
        const userList = JSON.parse(localStorage.getItem("userList"));
        
        // Filtering user quizzes
        if (userList) {
            const myQuizzesList = document.querySelector(".my-quizzes ul");
            document.querySelector(".empty-quizz").classList.add("hidden");
            document.querySelector(".my-title").classList.remove("hidden");
            const myQuizzes = [];

            for (let i = 0; i < allQuizzes.length; i++) {
                let isFromUser = false;

                for (let j = 0; j < userList.length; j++) {
                    if (allQuizzes[i].id === userList[j]) {
                        userList.splice(j, 1);
                        isFromUser = true;
                        break;
                    }
                }

                if (isFromUser) {
                    myQuizzes.push(allQuizzes[i]);
                    allQuizzes.splice(i, 1);
                    i--;
                }
            }

            // My Quizzes
            fragment = document.createDocumentFragment();
            myQuizzes.forEach(e => fragment.appendChild(createQuizzBox(e)));
            myQuizzesList.replaceChildren(fragment);
        }

        // All Quizzes
        fragment = document.createDocumentFragment();
        allQuizzes.forEach(e => fragment.appendChild(createQuizzBox(e)));
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
	newQuizzData=[];
	const listInputs = create.querySelectorAll('input');
	for (let i = 0; i < listInputs.length; i++) {
		newQuizzData.push(listInputs[i].value);
	}

	create.innerHTML = `<p class="title-creation">Crie suas perguntas</p>`;
	for (let i = 0; i < newQuizzData[2]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation'>
                <div onclick='' class='external id${i}'>
                    <p>Pergunta ${i + 1}</p>
                    <ion-icon onclick='toggleQuestion(this.parentNode)' class="" name="create-outline"></ion-icon>
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

	create.innerHTML = create.innerHTML + `<button onclick="validityQuestions()" >Prosseguir pra criar níveis</button>`
	const ion = document.querySelector('.quizz-create ion-icon');
	toggleQuestion(ion.parentNode);
	window.scrollTo(0,0);
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
	for (let i=0; i<allInputs.length;i++){
		allInputs[i].classList.remove('become-red');
		allInputs[i].classList.remove('become-red-2');
		allInputs[i].classList.remove('become-red-3');
	}
	for (i=0; i<internalBox.length;i++){
		internalBox[i].parentNode.classList.remove('error');
	}
	for (i=0; i<allH1.length;i++){
		allH1[i].remove();
	}
	for (i=0; i<allH3.length;i++){
		allH3[i].remove();
	}
	for (i=0; i<allH2.length;i++){
		allH2[i].remove();
	}
	for (i=0; i<internalBox.length;i++){
		isAllEmpty = 1;
		inputsBoxes = internalBox[i].querySelectorAll('input');
		if (inputsBoxes[0].value.length<=20){
			internalBox[i].parentNode.classList.add('error');
			inputsBoxes[0].classList.add('become-red');
			valityValue = 0;
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			inputsBoxes[0].insertAdjacentHTML("afterend", "<h1>O texto deve ter mais que 20 caracteres.</h1>");
		}
		for (ii=4;ii<inputsBoxes.length;ii++){
			if (inputsBoxes[ii].value!='')
				isAllEmpty=0;
		}
		if (inputsBoxes[2].value===''&&inputsBoxes[3].value===''){
			internalBox[i].parentNode.classList.add('error');
			inputsBoxes[2].classList.add('become-red');
			inputsBoxes[3].classList.add('become-red');
			inputsBoxes[2].insertAdjacentHTML("beforebegin", "<h3>Coloque uma resposta correta.</h3>");
		}else{
			if(!inputsBoxes[2].checkValidity()){
				internalBox[i].parentNode.classList.add('error');
				inputsBoxes[2].classList.add('become-red');
				openQuestion(internalBox[i].parentNode.querySelector('.external'));
				inputsBoxes[2].insertAdjacentHTML("afterend", "<h1>Este campo não pode ficar vazio.</h1>");
			}
			if(!inputsBoxes[3].checkValidity()){
				internalBox[i].parentNode.classList.add('error');
				inputsBoxes[3].classList.add('become-red');
				openQuestion(internalBox[i].parentNode.querySelector('.external'));
				inputsBoxes[3].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
			}}
		if (isAllEmpty){
			inputsBoxes[4].insertAdjacentHTML("beforebegin", "<h2>Coloque pelo menos uma resposta incorreta.</h2>");
			for (ii=4;ii<inputsBoxes.length;ii++){
				internalBox[i].parentNode.classList.add('error');
				inputsBoxes[ii].classList.add('become-red-2');
				openQuestion(internalBox[i].parentNode.querySelector('.external'));
			}
		}
		else{
			if (inputsBoxes[4].value!==''||inputsBoxes[5].value!==''){
				if (inputsBoxes[4].value===''){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[4].classList.add('become-red-3');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[4].insertAdjacentHTML("afterend", "<h1>Este campo não pode ficar vazio.</h1>");
				}if(!inputsBoxes[5].checkValidity()){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[5].classList.add('become-red');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[5].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
				}
			}if (inputsBoxes[6].value!==''||inputsBoxes[7].value!==''){
				if (inputsBoxes[6].value===''){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[6].classList.add('become-red-3');
					inputsBoxes[6].insertAdjacentHTML("afterend", "<h1>Este campo não pode ficar vazio.</h1>");
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
				}if(!inputsBoxes[7].checkValidity()){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[7].classList.add('become-red');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[7].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
				}
			}if (inputsBoxes[8].value!==''||inputsBoxes[9].value!==''){
				if (inputsBoxes[8].value===''){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[8].classList.add('become-red-3');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[8].insertAdjacentHTML("afterend", "<h1>Este campo não pode ficar vazio.</h1>");
				}if(!inputsBoxes[9].checkValidity()){
					internalBox[i].parentNode.classList.add('error');
					inputsBoxes[9].classList.add('become-red');
					openQuestion(internalBox[i].parentNode.querySelector('.external'));
					inputsBoxes[9].insertAdjacentHTML("afterend", "<h1>Coloque uma URL valida.</h1>");
				}
			}
		}
	}
	for (ii=0; ii<internalBox.length;ii++){
		if (!internalBox[ii].parentNode.classList.contains('error')){
			closeQuestion(internalBox[ii].parentNode.querySelector('.external'));}
	}
	if (valityValue === 1)
		goToCreateLevel();
	else
		window.scrollTo(0,0);
}

function goToCreateLevel(){
	create.innerHTML = `<p class="title-creation">Agora, decida os níveis!</p>`;
	for (let i = 0; i < newQuizzData[3]; i++) {
		create.innerHTML += `
        <div class="box-creation">
            <div class='question-creation'>
                <div onclick='' class='external id${i + 1}'>
                    <p>Nível ${i + 1}</p>
                    <ion-icon onclick='toggleQuestion(this.parentNode)' class="" name="create-outline"></ion-icon>
            		<ion-icon onclick='toggleQuestion(this.parentNode)' class="hidden" name="remove-outline"></ion-icon>
                </div>
                <div class='internal hidden id${i + 1}'>
                    <input class='creation-space-1' type="text" id="text" placeholder="Título do nível">
					<input class='creation-space-1' type="number" id="number" placeholder="% de acerto mínima" required>
					<input class='creation-space-1' type="url" id="text" placeholder="URL da imagem do nível" required>
					<textarea class='creation-space-1' placeholder="Descrição do nível"></textarea> 
                </div>
            </div>
        </div>
        `;
	}
	create.innerHTML = create.innerHTML + `<button onclick="validityLevels()" >Finalizar Quizz</button>`
	const ion = document.querySelector('.quizz-create ion-icon');
	toggleQuestion(ion.parentNode);
	window.scrollTo(0,0);
}
function validityLevels(){
	let valityValue = 1;
	let isAllEmpty = 1;
	let thereA0Percent = 0;
	const internalBox = create.querySelectorAll('.internal');
	let inputsBoxes = [];
	let allInputs = create.querySelectorAll('input');
	let allText = create.querySelectorAll('textarea');
	let allH1 = create.querySelectorAll('h1');
	let allH2 = create.querySelectorAll('h2');
	let allH3 = create.querySelectorAll('h3');
	inputsBoxes = create.querySelectorAll('input');
	for (let i=0; i<allInputs.length;i++){
		allInputs[i].classList.remove('become-red');
		allInputs[i].classList.remove('become-red-2');
		allInputs[i].classList.remove('become-red-3');
	}
	for (i=0; i<allH1.length;i++){
		allH1[i].remove();
	}
	for (i=0; i<allText.length;i++){
		allText[i].classList.remove('become-red');
	}
	for (i=0; i<allH2.length;i++){
		allH2[i].remove();
	}
	for (i=0; i<allH3.length;i++){
		allH3[i].remove();
	}
	for (i=0; i<internalBox.length;i++){
		internalBox[i].parentNode.classList.remove('error');
	}
	for (i=0; i<internalBox.length;i++){
		if(internalBox[i].querySelector("#number").value==0||internalBox[i].querySelector("#number").value===''){
			thereA0Percent = 1;
		}
	}
	if(thereA0Percent === 0){
		for (i=0; i<internalBox.length;i++){
			internalBox[i].querySelector('input').insertAdjacentHTML('beforebegin',"<h3>Deve ter pelo menos um nível minimo 0.</h3>");
			internalBox[i].querySelector("#number").classList.add('become-red');
			internalBox[i].parentNode.classList.add('error');
			valityValue = 0;
		}
	}

	for (i=0; i<internalBox.length;i++){
		isAllEmpty = 1;
		inputsBoxes = internalBox[i].querySelectorAll('input');
		if (inputsBoxes[0].value.length<=10) {
			internalBox[i].parentNode.classList.add('error');
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			inputsBoxes[0].classList.add('become-red');
			valityValue = 0;
			inputsBoxes[0].insertAdjacentHTML("afterend", "<h1>O título do nível deve ter no mínimo 10 caracteres.</h1>");
		} if ((inputsBoxes[1].value<0||inputsBoxes[1].value>100||inputsBoxes[1].value==='')&&thereA0Percent===1) {
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
			inputsBoxes[2].insertAdjacentHTML("afterend", "<h1>O valor informado não é uma URL válida.</h1>");
		} if (internalBox[i].querySelector('textarea').value < 30) {
			openQuestion(internalBox[i].parentNode.querySelector('.external'));
			internalBox[i].parentNode.classList.add('error');
			internalBox[i].querySelector('textarea').classList.add('become-red');
			valityValue = 0;
			internalBox[i].querySelector('textarea').insertAdjacentHTML("afterend", "<h1>A descrição do nível deve ter no mínimo 30 caracteres.</h1>");
		}
	}
	for (ii=0; ii<internalBox.length;ii++){
		if (!internalBox[ii].parentNode.classList.contains('error')){
			closeQuestion(internalBox[ii].parentNode.querySelector('.external'));}
	}
	if (valityValue === 1)
		goToCreateLevel();
	else
		window.scrollTo(0,0);
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

// Validação do Quizz ===========================================================================
function validarInfosQuizz() {
	let valityValue = 1;
	arrayCreateQuizz = {
		titulo:'',
		imagem:'',
		quantidadeDePerguntas: 0,
		quantidadeDeNiveis: 0,
		perguntas: [],
		niveis:[],
	}
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

	arrayCreateQuizz.titulo = titulo.value;
	arrayCreateQuizz.imagem = imagem.value;
	arrayCreateQuizz.quantidadeDePerguntas = quantidadeDePerguntas.value;
	arrayCreateQuizz.quantidadeDeNiveis = quantidadeDeNiveis.value;

	if (arrayCreateQuizz.titulo.length < 20 || arrayCreateQuizz.titulo.length > 65) {
		inputsBoxes[0].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[0].insertAdjacentHTML("afterend", "<h1>O título deve ter no mínimo 20 caracteres e no máximo 65.</h1>");
	} if (!imagem.validity.valid) {
		inputsBoxes[1].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[1].insertAdjacentHTML("afterend", "<h1>O valor informado não é uma URL válida.</h1>");
    } if (arrayCreateQuizz.quantidadeDePerguntas < 3) {
		inputsBoxes[2].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[2].insertAdjacentHTML("afterend", "<h1>Quantidade mínima de perguntas 3.</h1>");
	} if (arrayCreateQuizz.quantidadeDeNiveis < 2) {
		inputsBoxes[3].classList.add('become-red');
		valityValue = 0;
		inputsBoxes[3].insertAdjacentHTML("afterend", "<h1>Quantidade mínima de níveis 2.</h1>");
	}
	if (valityValue === 1)
    	goToCreateQuestion();
}
