document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");

    const screens = document.querySelectorAll(".screen");
    console.log("Number of screens:", screens.length);

    // Функция для переключения экранов
    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.remove("visible");
        });
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.classList.add("visible");
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
    const wreaths = ['wreath1.png', 'wreath2.png', 'wreath3.png', 'wreath4.png', 'wreath5.png'];
    const wreathOptionsContainer = document.querySelector(".wreath-options");

    wreaths.forEach(wreath => {
        const img = document.createElement("img");
        img.src = `images/wreaths/${wreath}`;
        img.alt = wreath;
        img.addEventListener("click", function() {
            startGame(wreath);
        });
        wreathOptionsContainer.appendChild(img);
    });

    function startGame(selectedWreath) {
        showScreen("game-screen");
    
        const selectedWreathContainer = document.getElementById("selected-wreath");
        selectedWreathContainer.innerHTML = `<img src="images/wreaths/${selectedWreath}" alt="Selected Wreath">`;
    
        const randomBackground = Math.floor(Math.random() * 5) + 1;
        const gameBackground = document.getElementById("game-background");
        gameBackground.style.backgroundImage = `url('images/backgrounds/bg${randomBackground}.jpg')`;
    
        selectedWreathContainer.addEventListener('dragover', dragOver);
        selectedWreathContainer.addEventListener('drop', drop);
    
        displayFlowers();
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
            { name: 'Бессмертник', image: 'images/flowers/bessmert.png', meaning: 'Здоровье' },
            { name: 'Незабудка', image: 'images/flowers/nezab.png', meaning: 'Вечная память' },
            { name: 'Маргаритка', image: 'images/flowers/daisy.png', meaning: 'Невинность' },
            { name: 'Красная мальва', image: 'images/flowers/malvared.png', meaning: 'Вера' },
            { name: 'Мак', image: 'images/flowers/maksmall.png', meaning: 'Память о воинах' },
            { name: 'Барвинок', image: 'images/flowers/barvin.png', meaning: 'Бессмертие души' },
            { name: 'Пшеница', image: 'images/flowers/corn.png', meaning: 'Изобилие' },
            { name: 'Хмель', image: 'images/flowers/chmel.png', meaning: 'Ум' },
            { name: 'Вереск', image: 'images/flowers/veresk.png', meaning: 'Одиночество' },
            { name: 'Тысячелистник', image: 'images/flowers/tyswight.png', meaning: 'Непокоренность' },
            { name: 'Первоцвет', image: 'images/flowers/pervozvet.png', meaning: 'Недолговечность' },
            { name: 'Розовый тысячелистник', image: 'images/flowers/tysrose.png', meaning: 'Упорство' },
            { name: 'Белая мальва', image: 'images/flowers/malvawight.png', meaning: 'Надежда' },
            { name: 'Мак полевой', image: 'images/flowers/makbig.png', meaning: 'Вечный покой' },
            { name: 'Яблоня', image: 'images/flowers/yabl.png', meaning: 'Преданность' },
            { name: 'Розовый пион', image: 'images/flowers/pionrose.png', meaning: 'Влюбленность' },
            { name: 'Мальва лиловая', image: 'images/flowers/malvalil.png', meaning: 'Любовь' },
            { name: 'Калина', image: 'images/flowers/kalina.png', meaning: 'Красота и здоровье' },
            { name: 'Ромашка', image: 'images/flowers/romaska.png', meaning: 'Девичья чистота' },
            { name: 'Пион лиловый', image: 'images/flowers/pionlil.png', meaning: 'Процветание' },
            { name: 'Василек', image: 'images/flowers/vasil.png', meaning: 'Верность' }
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
    
            flowerDiv.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });
    
            flowerDiv.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
    
            flowerImg.addEventListener('dragstart', dragStart);
    
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
        flowerImg.src = flower.image; // Убедитесь, что flower.image содержит правильный путь
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

        // Добавляем обработчик двойного клика для удаления цветка
    flowerImg.addEventListener('dblclick', removeFlower);

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
        // Проверяем, находимся ли мы на игровом экране
        if (document.getElementById('game-screen').classList.contains('visible')) {
            e.target.remove();
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
    const finishButton = document.getElementById("finish-button");

    document.getElementById("finish-button").addEventListener("click", function() {
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
        }

    // Устанавливаем размер финального венка
    finalWreathContainer.style.transform = `scale(${scaleFactor})`;
    finalWreathContainer.style.transformOrigin = 'center center';
});


    document.getElementById("restart-button").addEventListener("click", function() {
        showScreen("wreath-selection-screen");
    });

    document.getElementById("exit-button").addEventListener("click", function() {
        window.close();
    });

    document.getElementById("save-button").addEventListener("click", function() {
        saveWreathAsImage();
    });

    function saveWreathAsImage() {
        html2canvas(document.getElementById("final-wreath")).then(canvas => {
            const link = document.createElement('a');
            link.download = 'wreath.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    document.getElementById("publish-button").addEventListener("click", function() {
        publishWreath();
    });
    
    document.getElementById("send-button").addEventListener("click", function() {
        sendWreathToFriends();
    });
   
    
});






