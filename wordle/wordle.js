window.onload = async () => {
    const restartButton = document.getElementById("start");
    restartButton.disabled = true;
    restartButton.innerText = "Loading...";
    const response = await fetch("https://api.masoudkf.com/v1/wordle", {
        headers: {
            "x-api-key": "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv",
        },
    });
    restartButton.disabled = false;
    restartButton.innerText = "Start Over";


    let wordDict = await response.json();
    var { dictionary } = wordDict;
    randomWord = dictionary[Number.parseInt(Math.random() * dictionary.length)];
    givenWord = randomWord.word.toUpperCase();
    givenHint = randomWord.hint;

    var gameOver = false;
    var wonGame = false;
    var lostGame = false;
    const letterCheck = /^[a-zA-Z]$/;
    const columns = 4;
    var row = 0; //cuurent guess (attempt #)
    var letterCol = 0; //cuurent letter of attempt #
    const tds = document.getElementsByTagName("td");

    function loadWord() {
        document.addEventListener("keyup", (event) => {
            if (gameOver) return;
            const val = event.key.toUpperCase();
            if (letterCheck.test(event.key)) {
                if (letterCol < columns) {
                    tds[((row * columns) + letterCol)].innerText = val;
                    if(current.classList.contains("dark-mode")){
                        tds[((row * columns) + letterCol)].classList.remove("selected"); 
                        tds[((row * columns) + letterCol)].classList.add("selected-dark"); 
                        if (((row * columns) + letterCol) == 15) {
                            tds[((row * columns) + letterCol)].classList.add("selected-dark");
                            tds[((row * columns) + letterCol - 1)].classList.remove("selected-dark");
                        } else {
                            tds[((row * columns) + letterCol + 1)].classList.add("selected-dark");
                            tds[((row * columns) + letterCol)].classList.remove("selected-dark");
                        }
                    } else {
                        tds[((row * columns) + letterCol)].classList.remove("selected-dark");    
                        tds[((row * columns) + letterCol)].classList.add("selected");    
                        if (((row * columns) + letterCol) == 15) {
                            tds[((row * columns) + letterCol)].classList.add("selected");
                            tds[((row * columns) + letterCol - 1)].classList.remove("selected");
                        } else {
                            tds[((row * columns) + letterCol + 1)].classList.add("selected");
                            tds[((row * columns) + letterCol)].classList.remove("selected");
                        }
                    }
                    letterCol += 1;
                }
            } else if (event.key == "Backspace") {
                if(current.classList.contains("dark-mode")){
                    tds[((row * columns) + letterCol)].classList.remove("selected");    
                    tds[((row * columns) + letterCol)].classList.add("selected-dark");    
                    if (((row * columns) + letterCol) == 0) {
                        tds[((row * columns) + letterCol)].classList.add("selected-dark");
                        tds[((row * columns) + letterCol + 1)].classList.remove("selected-dark");
                    } else {
                        tds[((row * columns) + letterCol)].classList.remove("selected-dark");
                        tds[((row * columns) + letterCol - 1)].classList.add("selected-dark");
                    }
                } else {
                    tds[((row * columns) + letterCol)].classList.remove("selected-dark");  
                    tds[((row * columns) + letterCol)].classList.remove("selected");      
                    if (((row * columns) + letterCol) == 0) {
                        tds[((row * columns) + letterCol)].classList.add("selected");
                        tds[((row * columns) + letterCol + 1)].classList.remove("selected");
                    } else {
                        tds[((row * columns) + letterCol)].classList.remove("selected");
                        tds[((row * columns) + letterCol - 1)].classList.add("selected");
                    }
                }

                if (letterCol > -1 && letterCol <= columns) {
                    if (letterCol == 0) {
                        tds[((row * columns) + letterCol)].innerText = "";
                    } else {
                        letterCol -= 1;
                        tds[((row * columns) + letterCol)].innerText = "";
                    }
                }
            } else if (event.key == "Enter") {
                if (letterCol != columns) {
                    window.alert("You must complete the word first!");
                } else {
                    checkLetters();
                    row += 1;
                    letterCol = 0;
                }
            }

            restartButton.addEventListener("click", restart);

            if (!gameOver && row == columns) {
                gameOver = true;
                lostGame = true;
                const lost = document.getElementById("lost");
                boldWord = givenWord.bold();
                var formatLost = "You missed the word " + boldWord + " and lost!";
                document.getElementById("lost").innerHTML = formatLost;
                lost.classList.toggle("hidden");
                restartButton.addEventListener("click", restart);
            } else if (gameOver) {
                wonGame = true;
                const congrats = document.getElementById("congrats");
                const won = document.getElementById("won");
                const table = document.getElementById("table");
                boldWord = givenWord.bold();
                var formatWon = "You guessed the word " + boldWord + " correctly!";
                document.getElementById("won").innerHTML = formatWon;
                congrats.classList.toggle("hidden");
                won.classList.toggle("hidden");
                table.classList.toggle("hidden");
                restartButton.addEventListener("click", restart);
            }
        });
    }

    function checkLetters() {
        let correctLetter = 0;
        let letterCount = {};
        for (let i = 0; i < givenWord.length; i++) {
            let letter = givenWord[i];
            if (letterCount[letter]) {
                letterCount[letter] += 1;
            } else {
                letterCount[letter] = 1;
            }
        }
        for (let check = 0; check < columns; check++) {
            let place = tds[((row * columns) + check)].innerText;
            // letter in right place
            if (place == givenWord[check]) {
                tds[((row * columns) + check)].classList.add("rightPlace");
                correctLetter += 1;
                letterCount[place] -= 1;
            }

            if (correctLetter == columns) {
                gameOver = true;
            }
        }

        //second time through, check letters that are present but in the wrong position
        for (let check = 0; check < columns; check++) {
            let place = tds[((row * columns) + check)].innerText;
            if (!tds[((row * columns) + check)].classList.contains("rightPlace")) {
                if (givenWord.includes(place) && letterCount[place] > 0) {
                    //is letter in word but not in the right place
                    tds[((row * columns) + check)].classList.add("inWord");
                    letterCount[place] -= 1;
                } else {
                    //wrong letter
                    tds[((row * columns) + check)].classList.add("wrong");
                }
            }
        }
    }


    const instructions = document.getElementById("instructions");
    const clickIns = document.getElementById("clickInstr");
    clickIns.addEventListener("click", () => {
        instructions.classList.toggle("hidden");
   });
   instructions.addEventListener("keydown", (event) => event.preventDefault());


    const hint = document.getElementById("hint");
    var formatHint = "<i>Hint</i>" + ": " + givenHint;
    document.getElementById("hint").innerHTML = formatHint;
    const clickHint = document.getElementById("clickHelp");
    clickHint.addEventListener("click", () => {
        hint.classList.toggle("hidden");
        hint.addEventListener("keydown", (event) => event.preventDefault());
    });

    const darkMode = document.getElementById("clickDark");
    const current = document.getElementById("container");
    const button2 = document.getElementById("clickInstr");
    const button3 = document.getElementById("clickHelp");
    darkMode.addEventListener("click", () => {
        current.classList.toggle("dark-mode");
        darkMode.classList.toggle("top-dark");
        button2.classList.toggle("top-dark");
        button3.classList.toggle("top-dark");
        tds[((row * columns) + letterCol)].classList.toggle("selected-dark");    
        document.getElementById("lost").style.color = "black";
        document.getElementById("won").style.color = "black";
        document.getElementById("hint").style.color = "black";
        if(current.classList.contains("dark-mode")){
            tds[((row * columns) + letterCol)].classList.add("selected-dark");        
        } else{
            tds[((row * columns) + letterCol)].classList.add("selected");    
        }
        darkMode.addEventListener("keydown", (event) => event.preventDefault());
    });

    if(current.classList.contains("dark-mode")){
        tds[((row * columns) + letterCol)].classList.add("selected-dark");        
    } else{
        tds[((row * columns) + letterCol)].classList.add("selected");    
    }
    function restart() {
        restartButton.addEventListener("keydown", (event) => event.preventDefault());
        randomWord = dictionary[Number.parseInt(Math.random() * dictionary.length)];
        givenWord = randomWord.word.toUpperCase();
        givenHint = randomWord.hint;
        row = 0;
        letterCol = 0;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                tds[((r * columns) + c)].innerText = "";
                tds[((r * columns) + c)].classList.remove("rightPlace");
                tds[((r * columns) + c)].classList.remove("inWord");
                tds[((r * columns) + c)].classList.remove("wrong");
                tds[((r * columns) + c)].classList.remove("selected");
                tds[((r * columns) + c)].classList.remove("selected-dark");
            }
        }

        formatHint = "<i>Hint</i>" + ": " + givenHint;
        document.getElementById("hint").innerHTML = formatHint;

        if (lostGame == true) {
            lost.classList.toggle("hidden");
            lostGame = false;
            gameOver = false;
            return;
        } else if (wonGame == true) {
            congrats.classList.toggle("hidden");
            won.classList.toggle("hidden");
            table.classList.toggle("hidden");
            wonGame = false;
            gameOver = false;
            return;
        }
    }

    loadWord();
}
