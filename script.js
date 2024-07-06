console.log("Script loaded");

let okParams;

function getUrlParams() {
    const params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      params[key] = decodeURIComponent(value);
    });
    return params;
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    okParams = getUrlParams();
    initializeGame();
});

// Переопределение метода postMessage
(function() {
    var originalPostMessage = window.postMessage;
    window.postMessage = function(message, targetOrigin, transfer) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        }
        originalPostMessage.call(this, message, targetOrigin, transfer);
    };
})();

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function touchStart(e) {
    e.preventDefault();
    this.touchData = {
        startX: e.touches[0].clientX - this.offsetLeft,
        startY: e.touches[0].clientY - this.offsetTop,
        flower: {
            name: this.alt,
            image: this.src
        }
    };
}

function touchMove(e) {
    e.preventDefault();
    if (this.touchData) {
        let touchX = e.touches[0].clientX - this.touchData.startX;
        let touchY = e.touches[0].clientY - this.touchData.startY;
        this.style.position = 'absolute';
        this.style.left = touchX + 'px';
        this.style.top = touchY + 'px';
    }
}

function touchEnd(e) {
    e.preventDefault();
    const selectedWreathContainer = document.getElementById("selected-wreath");
    const rect = selectedWreathContainer.getBoundingClientRect();
    const x = e.changedTouches[0].clientX - rect.left;
    const y = e.changedTouches[0].clientY - rect.top;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        addToWreath(this.touchData.flower, x, y);
    }
    
    this.style.position = 'static';
    this.touchData = null;
}

function initializeGame() {
    console.log("Initializing game");

    if (typeof FAPI === 'undefined') {
        console.error("FAPI not loaded");
        return;
    }

    console.log("okParams:", okParams);
    console.log("api_server:", okParams.api_server);
    console.log("apiconnection:", okParams.apiconnection);

    if (okParams && okParams.api_server && okParams.apiconnection) {
        FAPI.init(okParams.api_server, okParams.apiconnection, function() {
            console.log("FAPI initialized successfully");
            startApp();
        });
    } else {
        console.error("Missing required okParams", okParams);
    }

    const isMobile = okParams.mob === 'true';
    const isContainer = okParams.container === 'true';

    if (!checkSignature(okParams)) {
        console.error('Invalid signature');
        // Обработка ошибки
        return;
    }

    const screens = document.querySelectorAll(".screen");
    console.log("Number of screens:", screens.length);

    setupEventListeners();
}

function checkSignature(params) {
    const secretKey = '25552CAEB8682B3C75E65964';
    const signature = params.sig;
    delete params.sig;
    
    const sortedKeys = Object.keys(params).sort();
    let signString = '';
    for (let key of sortedKeys) {
      signString += key + '=' + params[key];
    }
    signString += secretKey;
    
    const calculatedSignature = CryptoJS.MD5(signString).toString();
    return calculatedSignature === signature;
}


function startApp() {
    console.log("Starting app");
    showScreen("splash-screen");
}

function setupEventListeners() {
    const startButton = document.getElementById("start-button");
    if (startButton) {
        console.log("Start button found");
        startButton.addEventListener("click", function() {
            console.log("Start button clicked");
            showScreen("wreath-selection-screen");
        });
        // Добавляем обработчик для касания
        startButton.addEventListener("touchstart", function(e) {
            e.preventDefault(); // Предотвращаем двойное срабатывание на мобильных устройствах
            console.log("Start button touched");
            showScreen("wreath-selection-screen");
        });
    } else {
        console.error("Start button not found!");
    }
}

function showScreen(screenId) {
    console.log("Showing screen:", screenId);
    const screens = document.querySelectorAll(".screen");
    screens.forEach(screen => {
        screen.classList.remove("visible");
    });
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add("visible");
    } else {
        console.error("Screen not found:", screenId);
    }
}

    // Показываем стартовый экран
    showScreen("splash-screen");

    const startButton = document.getElementById("start-button");
    console.log("Start button:", startButton);

    if (startButton) {
        startButton.addEventListener("click", function() {
            console.log("Start button clicked");
            showScreen("wreath-selection-screen");
        });
    } else {
        console.error("Start button not found!");
    }

    // Венки
    const wreaths = ['https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/wreaths/wreath1.png', 
        'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/wreaths/wreath2.png', 
        'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/wreaths/wreath3.png', 
        'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/wreaths/wreath4.png', 
        'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/wreaths/wreath5.png'];
    const wreathOptionsContainer = document.querySelector(".wreath-options");

    wreaths.forEach(wreath => {
        const img = document.createElement("img");
        img.src = wreath;
        img.alt = "Wreath";
        img.addEventListener("click", function() {
            startGame(wreath);
        });
        wreathOptionsContainer.appendChild(img);
    });

    function startGame(selectedWreath) {
        showScreen("game-screen");
    
        const selectedWreathContainer = document.getElementById("selected-wreath");
        selectedWreathContainer.innerHTML = `<img src="${selectedWreath}" alt="Selected Wreath">`;
    
        const randomBackground = Math.floor(Math.random() * 5) + 1;
        const gameBackground = document.getElementById("game-background");
        gameBackground.style.backgroundImage = `url('https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/backgrounds/bg${randomBackground}.jpg')`;
    
        selectedWreathContainer.addEventListener('dragover', dragOver);
        selectedWreathContainer.addEventListener('drop', drop);
    
        displayFlowers();
    }

    function addTouchEventListener(elementId, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener("click", function(e) {
                e.preventDefault();
                callback();
            });
            element.addEventListener("touchend", function(e) {
                e.preventDefault();
                callback();
            });
        } else {
            console.error(`Element with id ${elementId} not found!`);
        }
    }
    
    function dragOver(e) {
        e.preventDefault();
    }
    
    function drop(e) {
        e.preventDefault();
        const flowerElement = document.elementFromPoint(e.clientX, e.clientY);
        
        if (flowerElement && flowerElement.classList.contains('flower-in-wreath')) {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            flowerElement.style.left = `${x}px`;
            flowerElement.style.top = `${y}px`;
        } else {
            const flowerName = e.dataTransfer.getData('text');
            const flower = {
                name: flowerName,
                image: `images/flowers/${flowerName.toLowerCase()}.png`
            };
            
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            addToWreath(flower, x, y);
        }
    }

    function displayFlowers() {
        const gameBackground = document.getElementById("game-background");
        gameBackground.innerHTML = ''; // Убираем старые цветы
        const flowers = [
            { name: 'Бессмертник', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/bessmert.png', meaning: 'Здоровье' },
            { name: 'Незабудка', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/nezab.png', meaning: 'Вечная память' },
            { name: 'Маргаритка', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/daisy.png', meaning: 'Невинность' },
            { name: 'Красная мальва', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/malvared.png', meaning: 'Вера' },
            { name: 'Мак', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/maksmall.png', meaning: 'Память о воинах' },
            { name: 'Барвинок', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/barvin.png', meaning: 'Бессмертие души' },
            { name: 'Пшеница', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/corn.png', meaning: 'Изобилие' },
            { name: 'Хмель', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/chmel.png', meaning: 'Ум' },
            { name: 'Вереск', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/veresk.png', meaning: 'Одиночество' },
            { name: 'Тысячелистник', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/tyswight.png', meaning: 'Непокоренность' },
            { name: 'Первоцвет', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/pervozvet.png', meaning: 'Недолговечность' },
            { name: 'Розовый тысячелистник', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/tysrose.png', meaning: 'Упорство' },
            { name: 'Белая мальва', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/malvawight.png', meaning: 'Надежда' },
            { name: 'Мак полевой', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/makbig.png', meaning: 'Вечный покой' },
            { name: 'Яблоня', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/yabl.png', meaning: 'Преданность' },
            { name: 'Розовый пион', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/pionrose.png', meaning: 'Влюбленность' },
            { name: 'Мальва лиловая', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/malvalil.png', meaning: 'Любовь' },
            { name: 'Калина', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/kalina.png', meaning: 'Красота и здоровье' },
            { name: 'Ромашка', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/romaska.png', meaning: 'Девичья чистота' },
            { name: 'Пион лиловый', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/pionlil.png', meaning: 'Процветание' },
            { name: 'Василек', image: 'https://cdn.jsdelivr.net/gh/StasySmith/happywreath@main/images/flowers/vasil.png', meaning: 'Верность' }
        ];
    
        flowers.forEach(flower => {
            const flowerDiv = document.createElement('div');
            flowerDiv.classList.add('flower-container');
            
            const flowerImg = document.createElement('img');
            flowerImg.src = flower.image;
            flowerImg.alt = flower.name;
            flowerImg.draggable = true;
            flowerImg.classList.add('flower-image');
    
            const tooltip = document.createElement('div');
            tooltip.classList.add('flower-tooltip');
            tooltip.innerHTML = `<strong>${flower.name}</strong><br>${flower.meaning}`;
            tooltip.style.display = 'none';
    
            flowerDiv.appendChild(flowerImg);
            flowerDiv.appendChild(tooltip);

            // Добавляем обработчики для мобильных устройств
        flowerDiv.addEventListener('touchstart', function(e) {
            e.preventDefault();
            tooltip.style.display = 'block';
        });

        flowerDiv.addEventListener('touchend', function(e) {
            e.preventDefault();
            tooltip.style.display = 'none';
        });
    
            flowerDiv.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });
    
            flowerDiv.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
    
            flowerImg.addEventListener('dragstart', dragStart);

            // Добавляем обработчики касаний
        flowerImg.addEventListener('touchstart', touchStart);
        flowerImg.addEventListener('touchmove', touchMove);
        flowerImg.addEventListener('touchend', touchEnd);
    
            // Позиционирование цветка
            const x = Math.random() * (gameBackground.offsetWidth - 50);
            const y = Math.random() * (gameBackground.offsetHeight - 50);
            flowerDiv.style.position = 'absolute';
            flowerDiv.style.left = `${x}px`;
            flowerDiv.style.top = `${y}px`;
    
            gameBackground.appendChild(flowerDiv);
        });
    }

       
    function dragStart(e) {
        if (e.type === 'touchstart') {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = e.target.getBoundingClientRect();
            e.target.touchOffsetX = touch.clientX - rect.left;
            e.target.touchOffsetY = touch.clientY - rect.top;
        }
        const flower = {
            name: e.target.alt,
            image: e.target.src
        };
        e.dataTransfer.setData('application/json', JSON.stringify(flower));
        e.dataTransfer.setDragImage(e.target, 25, 25);
    }
    
    function drop(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        const flower = JSON.parse(data);
        
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        addToWreath(flower, x, y);
    }

    function addToWreath(flower, x, y) {
        const selectedWreathContainer = document.getElementById("selected-wreath");
        const flowerImg = document.createElement('img');
        flowerImg.src = flower.image;
        flowerImg.alt = flower.name;
        flowerImg.classList.add('flower-in-wreath');
        flowerImg.style.position = 'absolute';
        flowerImg.style.left = `${x}px`;
        flowerImg.style.top = `${y}px`;
        flowerImg.style.width = '40px';
        flowerImg.style.height = '40px';
    
        flowerImg.draggable = true;
    
        flowerImg.addEventListener('dragstart', dragStart);
        flowerImg.addEventListener('dragend', dragEnd);
    
        // Обработчик двойного клика для удаления цветка (для десктопов)
        flowerImg.addEventListener('dblclick', removeFlower);
    
        // Обработчик двойного касания для удаления цветка (для мобильных устройств)
        let lastTap = 0;
        flowerImg.addEventListener('touchstart', function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
                e.stopPropagation();
                removeFlower.call(this);
            }
            lastTap = currentTime;
        });
    
        // Обработчик для перетаскивания на мобильных устройствах
        flowerImg.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = selectedWreathContainer.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.style.left = `${x}px`;
            this.style.top = `${y}px`;
        });
    
        flowerImg.addEventListener('mouseenter', showInstruction);
        flowerImg.addEventListener('mouseleave', hideInstruction);
    
        selectedWreathContainer.appendChild(flowerImg);
    }

    function showInstruction(e) {
        const wreathContainer = document.getElementById('wreath-container');
        let instruction = wreathContainer.querySelector('.instruction');
        
        if (!instruction) {
            instruction = document.createElement('div');
            instruction.className = 'instruction';
            instruction.textContent = 'Дважды кликните на цветок в венке, чтобы удалить его';
            wreathContainer.appendChild(instruction);
        }

        instruction.style.display = 'block';
}

function hideInstruction(e) {
    const instruction = document.querySelector('.instruction');
    if (instruction) {
        instruction.style.display = 'none';
    }
}
    
function removeFlower(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (document.getElementById('game-screen').classList.contains('visible')) {
        this.remove();
    }
}

    function dragEnd(e) {
        const rect = e.target.parentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        e.target.style.left = `${x}px`;
        e.target.style.top = `${y}px`;
    }

    FAPI.init(function() {
        console.log("API Одноклассников инициализирован");
    });

    // Обработчик для кнопки "Готово"
   
    addTouchEventListener("finish-button", function()  {
        showScreen("result-screen");
        showFinalWreath();

        function showFinalWreath() {
            const finalWreathContainer = document.getElementById("final-wreath");
            const selectedWreathContainer = document.getElementById("selected-wreath");
            
            // Очищаем контейнер финального венка
            finalWreathContainer.innerHTML = '';
            
            // Копируем основу венка
            const wreathBase = selectedWreathContainer.querySelector('img:not(.flower-in-wreath)');
            if (wreathBase) {
                const clonedWreathBase = wreathBase.cloneNode(true);
                clonedWreathBase.classList.add('wreath-base');
                finalWreathContainer.appendChild(clonedWreathBase);
            }
        
            // Определяем коэффициент масштабирования
            const scaleFactor = 1.5;
        
            // Копируем и перемещаем цветы
            const flowers = selectedWreathContainer.querySelectorAll('.flower-in-wreath');
        
            flowers.forEach(flower => {
                const clonedFlower = flower.cloneNode(true);

                // Удаляем обработчик события двойного клика
        clonedFlower.removeEventListener('dblclick', removeFlower);
        
        // Добавляем новый класс для финальных цветков
        clonedFlower.classList.add('final-flower');
                
                // Получаем текущие размеры и позиции
                const originalWidth = parseFloat(flower.style.width);
                const originalHeight = parseFloat(flower.style.height);
                const originalLeft = parseFloat(flower.style.left);
                const originalTop = parseFloat(flower.style.top);
        
                // Масштабируем размеры и позиции
                const newWidth = originalWidth * scaleFactor;
                const newHeight = originalHeight * scaleFactor;
                const newLeft = originalLeft * scaleFactor;
                const newTop = originalTop * scaleFactor;
        
                // Применяем новые размеры и позиции
                clonedFlower.style.width = `${newWidth}px`;
                clonedFlower.style.height = `${newHeight}px`;
                clonedFlower.style.left = `${newLeft}px`;
                clonedFlower.style.top = `${newTop}px`;
        
                finalWreathContainer.appendChild(clonedFlower);
            });
        
            // Масштабируем контейнер финального венка
            finalWreathContainer.style.transform = `scale(${scaleFactor})`;
            finalWreathContainer.style.transformOrigin = 'center center';

             // Устанавливаем размер финального венка
    finalWreathContainer.style.transform = `scale(${scaleFactor})`;
    finalWreathContainer.style.transformOrigin = 'center center';

        }

   
});


addTouchEventListener("restart-button", function() {
    showScreen("wreath-selection-screen");
});

addTouchEventListener("exit-button", function() {
    console.log("Exit button pressed");
    if (confirm("Вы уверены, что хотите выйти из игры?")) {
        try {
            window.close();
        } catch (error) {
            console.error("Ошибка при закрытии окна:", error);
            alert("Чтобы выйти из игры, пожалуйста, закройте эту вкладку.");
        }
    }
});
// Функция для определения типа устройства (если она еще не определена)
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

    addTouchEventListener("save-button", function() {
        console.log("Save button pressed");
        saveWreathAsImage();
    });

   function saveWreathAsImage() {
        console.log("Attempting to save wreath as image");
        
        const wreathElement = document.getElementById("final-wreath");
        
        // Убедимся, что все изображения загружены
        const images = wreathElement.getElementsByTagName('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => img.onload = resolve);
        });
    
        Promise.all(imagePromises).then(() => {
            html2canvas(wreathElement, {
                allowTaint: true,
                useCORS: true,
                scale: 2, // Увеличиваем масштаб для лучшего качества
                logging: true, // Включаем логирование для отладки
                backgroundColor: '#FFFFFF' // Белый фон
            }).then(canvas => {
                console.log("Canvas created");
                
                // Создаем новый canvas того же размера
                const newCanvas = document.createElement('canvas');
                const ctx = newCanvas.getContext('2d');
                
                newCanvas.width = canvas.width;
                newCanvas.height = canvas.height;
                
                // Рисуем оригинальный венок
                ctx.drawImage(canvas, 0, 0);
                
                // Добавляем текст поверх венка
                ctx.fillStyle = 'rgb(65, 186, 230)'; // Цвет текста
                ctx.font = 'bold 120px Caveat'; // Размер и шрифт текста
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                
                const text = 'Венок Счастья';
                const x = newCanvas.width / 2;
                const y = 100; // Отступ сверху
                
                // Рисуем текст с обводкой
                ctx.fillText(text, x, y);
                
                console.log("Text added to canvas");
    
                // Сохраняем изображение
                const imageDataUrl = newCanvas.toDataURL('image/jpeg', 0.9);
                
                if (isMobileDevice()) {
                    console.log("Mobile device detected, opening image in new tab");
                    const img = document.createElement('img');
                    img.src = imageDataUrl;
                    const w = window.open("");
                    w.document.write(img.outerHTML);
                } else {
                    console.log("Desktop device detected, downloading image");
                    const link = document.createElement('a');
                    link.download = 'wreath.jpg';
                    link.href = imageDataUrl;
                    link.click();
                }
            }).catch(error => {
                console.error("Error in html2canvas:", error);
                alert("Произошла ошибка при создании изображения. Пожалуйста, попробуйте еще раз.");
            });
        });
    }
    
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
 
    



 
    


 
    



 
    








