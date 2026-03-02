// ===== SPØRSMÅLSBANK MED KATEGORIER =====
const quizData = {
    geografi: {
        name: "Geografi",
        icon: "🌍",
        questions: [
            {
                question: "Hva er hovedstaden i Norge?",
                answers: ["Bergen", "Oslo", "Trondheim", "Stavanger"],
                correct: 1
            },
            {
                question: "Hva er det lengste fjorden i Norge?",
                answers: ["Hardangerfjorden", "Sognefjorden", "Trondheimsfjorden", "Oslofjorden"],
                correct: 1
            },
            {
                question: "Hvilket land er størst i verden?",
                answers: ["Kina", "USA", "Canada", "Russland"],
                correct: 3
            },
            {
                question: "Hvor mange fylker har Norge (2024)?",
                answers: ["11", "13", "15", "18"],
                correct: 2
            },
            {
                question: "Hvilken by er kjent som 'Nordens Paris'?",
                answers: ["Oslo", "Stockholm", "Tromsø", "København"],
                correct: 2
            }
        ]
    },
    vitenskap: {
        name: "Vitenskap",
        icon: "🔬",
        questions: [
            {
                question: "Hvilket grunnstoff har symbolet 'O'?",
                answers: ["Osmium", "Oksygen", "Gull", "Jern"],
                correct: 1
            },
            {
                question: "Hva er lysets hastighet (ca.)?",
                answers: ["100 000 km/s", "200 000 km/s", "300 000 km/s", "400 000 km/s"],
                correct: 2
            },
            {
                question: "Hvor mange planeter er det i solsystemet?",
                answers: ["7", "8", "9", "10"],
                correct: 1
            },
            {
                question: "Hva er det hardeste naturlige materialet?",
                answers: ["Gull", "Jern", "Diamant", "Titan"],
                correct: 2
            },
            {
                question: "Hva er H2O?",
                answers: ["Hydrogen", "Helium", "Vann", "Oksygen"],
                correct: 2
            }
        ]
    },
    historie: {
        name: "Historie",
        icon: "📜",
        questions: [
            {
                question: "Hvilket år ble Norge selvstendig fra Sverige?",
                answers: ["1814", "1905", "1899", "1920"],
                correct: 1
            },
            {
                question: "Hvem 'oppdaget' Amerika i 1492?",
                answers: ["Leiv Eiriksson", "Marco Polo", "Columbus", "Magellan"],
                correct: 2
            },
            {
                question: "Når startet andre verdenskrig?",
                answers: ["1935", "1938", "1939", "1941"],
                correct: 2
            },
            {
                question: "Hva het det første dyret i verdensrommet?",
                answers: ["Ham", "Laika", "Felix", "Albert"],
                correct: 1
            },
            {
                question: "Hvilket år falt Berlinmuren?",
                answers: ["1987", "1988", "1989", "1990"],
                correct: 2
            }
        ]
    },
    underholdning: {
        name: "Underholdning",
        icon: "🎬",
        questions: [
            {
                question: "Hvem spiller Harry Potter i filmene?",
                answers: ["Rupert Grint", "Daniel Radcliffe", "Tom Felton", "Eddie Redmayne"],
                correct: 1
            },
            {
                question: "Hvilket band sang 'Take on Me'?",
                answers: ["Roxette", "ABBA", "a-ha", "Europe"],
                correct: 2
            },
            {
                question: "Hva heter den lengste filmen i Ringenes Herre?",
                answers: ["Ringens brorskap", "To tårn", "Atter en konge", "Hobbiten"],
                correct: 2
            },
            {
                question: "Hvilket land kommer Mario (Nintendo) fra?",
                answers: ["USA", "Italia", "Japan", "Frankrike"],
                correct: 1
            },
            {
                question: "Hva heter hovedpersonen i Zelda-spillene?",
                answers: ["Zelda", "Link", "Ganon", "Epona"],
                correct: 1
            }
        ]
    }
};

// ===== APP STATE =====
let currentCategory = null;
let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let totalTime = 0;
let timerInterval = null;
let timeLeft = 15;
let correctAnswers = 0;
let wrongAnswers = 0;

// ===== INITIALISERING =====
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    registerServiceWorker();
});

function loadCategories() {
    const container = document.getElementById('categories');
    container.innerHTML = '';
    
    Object.keys(quizData).forEach((key, index) => {
        const cat = quizData[key];
        const btn = document.createElement('button');
        btn.className = `category-btn ${index === 0 ? 'selected' : ''}`;
        btn.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.name}`;
        btn.onclick = () => selectCategory(key, btn);
        container.appendChild(btn);
    });
    
    currentCategory = Object.keys(quizData)[0];
}

function selectCategory(key, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentCategory = key;
}

// ===== NAVIGASJON =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function goHome() {
    clearInterval(timerInterval);
    showScreen('startScreen');
}

// ===== QUIZ LOGIKK =====
function startQuiz() {
    currentQuestions = [...quizData[currentCategory].questions]
        .sort(() => Math.random() - 0.5);
    currentQuestion = 0;
    score = 0;
    totalTime = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    
    showScreen('quizScreen');
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuestions[currentQuestion];
    
    document.getElementById('question').textContent = q.question;
    document.getElementById('progress').textContent = 
        `Spørsmål ${currentQuestion + 1} av ${currentQuestions.length}`;
    document.getElementById('scoreDisplay').textContent = `${score} poeng`;
    document.getElementById('progressFill').style.width = 
        `${(currentQuestion / currentQuestions.length) * 100}%`;
    document.getElementById('nextBtn').style.display = 'none';

    // Sett opp svar
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    
    q.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(index);
        answersDiv.appendChild(btn);
    });
    
    // Start timer
    startTimer();
}

function startTimer() {
    timeLeft = 15;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `⏱ ${timeLeft}`;
    timerEl.classList.remove('warning');
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        totalTime++;
        timerEl.textContent = `⏱ ${timeLeft}`;
        
        if (timeLeft <= 5) {
            timerEl.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOut();
        }
    }, 1000);
}

function timeOut() {
    const q = currentQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    buttons[q.correct].classList.add('correct');
    wrongAnswers++;
    
    showNextButton();
}

function selectAnswer(selected) {
    clearInterval(timerInterval);
    
    const q = currentQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (selected === q.correct) {
        buttons[selected].classList.add('correct');
        const timeBonus = timeLeft;
        score += 10 + timeBonus;
        correctAnswers++;
        document.getElementById('scoreDisplay').textContent = `${score} poeng`;
    } else {
        buttons[selected].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
        wrongAnswers++;
    }
    
    showNextButton();
}

function showNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.style.display = 'block';
    nextBtn.textContent = currentQuestion < currentQuestions.length - 1 
        ? 'Neste spørsmål →' 
        : 'Se resultat 🏆';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < currentQuestions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

// ===== RESULTAT =====
function showResult() {
    clearInterval(timerInterval);
    
    const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
    
    let icon, title, message;
    if (percentage === 100) {
        icon = '🏆'; title = 'Perfekt!';
        message = 'Du er et geni! Alle riktig!';
    } else if (percentage >= 80) {
        icon = '🌟'; title = 'Veldig bra!';
        message = 'Imponerende resultat!';
    } else if (percentage >= 60) {
        icon = '👍'; title = 'Bra jobba!';
        message = 'Godt over halvparten riktig!';
    } else if (percentage >= 40) {
        icon = '📚'; title = 'Ikke verst!';
        message = 'Litt mer øving så er du der!';
    } else {
        icon = '💪'; title = 'Øvelse gjør mester!';
        message = 'Prøv igjen, du klarer det!';
    }
    
    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('scoreNumber').textContent = score;
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('wrongCount').textContent = wrongAnswers;
    document.getElementById('timeTotal').textContent = `${totalTime}s`;
    document.getElementById('resultMessage').textContent = message;
    
    // Lagre highscore
    saveHighscore();
    
    showScreen('resultScreen');
}

// ===== HIGHSCORE =====
function saveHighscore() {
    const key = `highscore_${currentCategory}`;
    const current = localStorage.getItem(key) || 0;
    if (score > current) {
        localStorage.setItem(key, score);
    }
}

// ===== DELING =====
function shareResult() {
    const text = `🧠 Quiz App - ${quizData[currentCategory].name}\n` +
                 `Jeg fikk ${score} poeng! (${correctAnswers}/${currentQuestions.length} riktige)\n` +
                 `Klarer du å slå meg?`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Quiz App Resultat',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Resultat kopiert til utklippstavle!');
        });
    }
}

function restartQuiz() {
    startQuiz();
}

// ===== SERVICE WORKER & PWA =====
let deferredPrompt;

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrert'))
            .catch(err => console.log('SW feil:', err));
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('installPrompt').classList.remove('hidden');
    });
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(result => {
            deferredPrompt = null;
            document.getElementById('installPrompt').classList.add('hidden');
        });
    }
}

function dismissInstall() {
    document.getElementById('installPrompt').classList.add('hidden');
}