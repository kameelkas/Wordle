window.onload = async () => {
    const restartButton = document.getElementById("start");
    restartButton.disabled = true;
    restartButton.innerText = "Loading...";
    const response = await fetch("https://pql557lcwoi3hoihdf6ltalppm0axuxs.lambda-url.ca-central-1.on.aws", 
    {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
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
    const letterCheck = /^[a-zA-Z\b\r]$/;
    const columns = 4;
    var row = 0; //current guess (attempt #)
    var letterCol = 0; //cuurent letter of attempt #
    const tds = document.getElementsByTagName("td");
    const keyboardButtons = document.querySelectorAll(".keyboard-key");

    //this takes care of letters being typed into the Wordle grid if using physical keyboard
    document.addEventListener("keyup", (event) => {
        if(gameOver) return;
        let takenLetter = event.key;
        if(letterCheck.test(takenLetter)) {
            gridWordCheck(takenLetter.toUpperCase());
        } else if (takenLetter === "Backspace" || takenLetter === "Enter") {
            gridWordCheck(takenLetter);
        };
    });

    //this takes care of letters being typed into the Wordle grid if using on screen keyboard
    keyboardButtons.forEach((key) => {
        key.addEventListener("click", () => {
        let clickedLetter = key.dataset.letter;
        gridWordCheck(clickedLetter);
        });
    });


    function gridWordCheck(typedLetter) {
        if(typedLetter === "Enter") {
            if(letterCol != columns) {
                window.alert("You must complete the word first!");
            } else {
                checkLetters();
                row += 1;
                letterCol = 0;
            }
        } else if (typedLetter === "Backspace") {
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
        } else {
            const value = typedLetter;
            if (letterCol < columns) {
                tds[((row * columns) + letterCol)].innerText = value;
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
        }

        restartButton.addEventListener("click", restart);

            if (!gameOver && row == columns) {
                keyboardButtons.forEach((key) => {
                    key.disabled = true;
                });
                gameOver = true;
                lostGame = true;
                const lost = document.getElementById("lost");
                boldWord = givenWord.bold();
                var formatLost = "You missed the word " + boldWord + " and lost!";
                document.getElementById("lost").innerHTML = formatLost;
                lost.classList.toggle("hidden");
                restartButton.addEventListener("click", restart);
            } else if (gameOver) {
                keyboardButtons.forEach((key) => {
                    key.disabled = true;
                });
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
    };

    function checkLetters() {
        //Making a dictionary that tracks each letter that appears in the given word and the occurence of that letter in the word
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

        //adds the green background on Wordle grid and green keyboard highlight for letters that are in the word and in the correct position       
        for (let check = 0; check < columns; check++) {
            let place = tds[((row * columns) + check)].innerText;
            let letterButton = document.querySelector(`button[data-letter="${place}"]`);
            // letter in right place
            if (place == givenWord[check]) {
                tds[((row * columns) + check)].classList.add("rightPlace");
                letterButton.classList.add("keyboard-key-rightPlace");
                correctLetter += 1;
                letterCount[place] -= 1;
            }

            if (correctLetter == columns) {
                gameOver = true;
            }
        }

        //second time through, check letters that are present but in the wrong position and adds the appropriate background (yellow or grey)
        for (let check = 0; check < columns; check++) {
            let place = tds[((row * columns) + check)].innerText;
            let letterButton = document.querySelector(`button[data-letter="${place}"]`);
            if (!tds[((row * columns) + check)].classList.contains("rightPlace")) {
                if (givenWord.includes(place) && letterCount[place] > 0) {
                    //is letter in word but not in the right place
                    tds[((row * columns) + check)].classList.add("inWord");
                    if (!letterButton.classList.contains("keyboard-key-rightPlace")) {
                        letterButton.classList.add("keyboard-key-inWord");
                    };
                    letterCount[place] -= 1;
                } else {
                    //wrong letter
                    tds[((row * columns) + check)].classList.add("wrong");
                    if (!letterButton.classList.contains("keyboard-key-rightPlace") && !letterButton.classList.contains("keyboard-key-inWord")) {
                        letterButton.classList.add("keyboard-key-wrong");
                    };
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
        /*Prevent the user from pressing any of the keyboard keys from being clicked which will mess 
        with the toggle of the lost/won actions and the grid, allowing the user to continue guessing 
        even if they have already won/lost before using all turns
        */
        keyboardButtons.forEach((key) => {
            key.disabled = false;
        });

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

        keyboardButtons.forEach((key) => {
            key.classList.remove("keyboard-key-rightPlace");
            key.classList.remove("keyboard-key-inWord");
            key.classList.remove("keyboard-key-wrong");
            });
    
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

};
