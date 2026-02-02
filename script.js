const WinCondition = {
    toBeCleared: 0,
    Cleared: 0
}

class Timer {
    constructor() {
        this.second = 0
        this.minute = 0
        this.hour = 0
        this.CurrentTime = `00:00:00`
        this.timer = null
    }

    StartTimer() {
        this.second = 0
        this.minute = 0
        this.hour = 0
        this.CurrentTime = `00:00:00`
        this.timer = setInterval(() => {
            document.getElementById('timer').innerText = this.CurrentTime
            this.second++
            if (this.second == 60) {
                this.second = 0
                this.minute++
            }
            if (this.minute == 60) {
                this.minute = 0
                this.hour++
            }
            this.CurrentTime = `${this.hour < 10 ? '0' + this.hour : this.hour}:${this.minute < 10 ? '0' + this.minute : this.minute}:${this.second < 10 ? '0' + this.second : this.second}`
        }, 1000)
    }
    StopTimer() {
        clearInterval(this.timer)
    }
}

const JStimer = new Timer()

function BuildField(rows, columns, bombs) {

    // Iniciando o jogo
    let header = document.getElementById('header')
    header.style.display = 'block'
    let counter = document.getElementById('counter')
    counter.innerText = bombs
    let reaction = document.getElementById('reaction_face')
    reaction.innerText = "🙂"

    // Limpando o campo anterior
    let field = document.getElementById('field')
    while (field.hasChildNodes()) {
        field.removeChild(field.firstChild);
    }
    field.classList.remove("disabled")
    document.getElementById('result').innerText = ""


    // Construindo o campo vazio
    for (let i = 0; i < rows; i++) {
        let newRow = document.createElement('ul');
        newRow.id = "Row " + i;
        newRow.className = "Row";
        for (let k = 0; k < columns; k++) {
            let newColumn = document.createElement('li')
            let flagslot = document.createElement('img')

            // Configurando os elementos HTML
            flagslot.style.display = 'none'
            flagslot.src = 'imagens/bandeira.png'
            flagslot.classList.add("flag")
            newColumn.appendChild(flagslot)
            newColumn.id = i + "," + k;
            newColumn.classList.add("Node");
            newColumn.classList.add("Column");
            newColumn.classList.add("hidden");
            newColumn.addEventListener("mousedown", (e) => {
                reaction.innerText = "😮"
            })
            newColumn.addEventListener("mouseup", (e) => {
                reaction.innerText = "🙂"
            })
            newColumn.addEventListener("contextmenu", (e) => {
                e.preventDefault()
                if (newColumn.classList.contains("hidden") && !newColumn.classList.contains("flag")) {
                    newColumn.classList.add("flag")
                    counter.innerText = Number(counter.innerText) - 1
                    flagslot.style.display = 'block'
                } else if (newColumn.classList.contains("hidden") && newColumn.classList.contains("flag")) {
                    newColumn.classList.remove("flag")
                    counter.innerText = Number(counter.innerText) + 1
                    flagslot.style.display = 'none'
                }
            }
            );
            newRow.appendChild(newColumn);
        }
        field.appendChild(newRow);
    }

    // Definindo condição de vitória
    let fieldSize = document.getElementsByClassName('Column')
    WinCondition['Cleared'] = 0
    WinCondition['toBeCleared'] = fieldSize.length - bombs

    // Plantando as bombas
    let coordinates = new Array(bombs)
    for (let i = 0; i < bombs; i++) {
        do {
            newSpot = [Math.floor(Math.random() * rows), Math.floor(Math.random() * columns)]
        } while (coordinates.indexOf(newSpot.toString()) !== -1)
        coordinates[i] = newSpot.toString()

        let site = document.getElementById(newSpot.toString())
        site.addEventListener("click", (e) => {
            if (!e.target.classList.contains("flag")) {
                GameOver(coordinates)
            }
        });
    }

    // Preenchendo demais espaços
    for (i = 0; i < rows; i++) {
        for (k = 0; k < columns; k++) {
            if (coordinates.indexOf(i + "," + k) === -1) {
                SetOnClick(i, k, coordinates, document.getElementById(i + "," + k))
            }
        }
    }

    // Reiniciando o timer
    JStimer.StopTimer()
    JStimer.StartTimer()
}

// Função para retornar a lista de campos em torno da coordenada parâmetro
function Peek(StringRow, StringColumn) {
    let row = Number(StringRow)
    let column = Number(StringColumn)
    let result = []
    if (document.getElementById(`${(row - 1)},${column}`) !== null) result.push(document.getElementById(`${(row - 1)},${column}`))
    if (document.getElementById(`${(row)},${column - 1}`) !== null) result.push(document.getElementById(`${(row)},${column - 1}`))
    if (document.getElementById(`${(row)},${column + 1}`) !== null) result.push(document.getElementById(`${(row)},${column + 1}`))
    if (document.getElementById(`${(row + 1)},${column}`) !== null) result.push(document.getElementById(`${(row + 1)},${column}`))
    if (document.getElementById(`${(row - 1)},${column - 1}`) !== null) result.push(document.getElementById(`${(row - 1)},${column - 1}`))
    if (document.getElementById(`${(row - 1)},${column + 1}`) !== null) result.push(document.getElementById(`${(row - 1)},${column + 1}`))
    if (document.getElementById(`${(row + 1)},${column - 1}`) !== null) result.push(document.getElementById(`${(row + 1)},${column - 1}`))
    if (document.getElementById(`${(row + 1)},${column + 1}`) !== null) result.push(document.getElementById(`${(row + 1)},${column + 1}`))
    return result
}

function SetOnClick(i, k, coordinates, Node) {
    let bombsAround = 0
    let avoidList = []
    let nodesAround = Peek(i, k)
    nodesAround.forEach(e => {
        if (coordinates.indexOf(e.id) !== -1) bombsAround++
    });

    // Campos com números
    if (bombsAround > 0) {
        Node.onclick = (e) => {
            Node.innerHTML = bombsAround
            if (Node.classList.contains("hidden") && !Node.classList.contains("flag")) {
                Node.classList.add("number")
                e.innerHTML = bombsAround
                WinCondition['Cleared'] = WinCondition['Cleared'] + 1
                e.target.classList.remove("hidden")
                CheckWinCon()


                // Caso o número esteja revelado e o seu valor seja igual a quantidade de bandeiras adjacentes, revela os nodes adjacentes sem bandeiras
            } else if (!Node.classList.contains("hidden")) {
                nodesAround.forEach(e => {
                    if (e.classList.contains("flag")) {
                        avoidList.push(e)
                    }
                });

                if (avoidList.length == bombsAround) {
                    ClearField(Node, avoidList).forEach(e => {
                        e.click()
                    })
                } else {
                    avoidList = []
                }
            }

        }

        // Campos vazios
    } else {
        Node.classList.add("empty")
        Node.onclick = () => {
            let emptyNodesList = [Node]
            let currentList = []
            let currentNode = Node
            let currentI = 0
            avoidList.push(currentNode)
            for (currentI = 0; true; currentI++) {
                currentList = ClearField(currentNode, avoidList)
                currentList.forEach(e => {
                    if (e.classList.contains("empty")) {
                        emptyNodesList.push(e)
                    } else {
                        e.click()
                        console.log(e)
                    }
                    avoidList.push(e)
                }
                )
                if (emptyNodesList[currentI] === undefined) {
                    console.log("quebrou na posição: " + currentI)
                    break
                }
                currentNode = emptyNodesList[currentI]
            }

            avoidList.forEach(e => {
                if (e.classList.contains("hidden")) {
                    e.classList.remove("hidden")
                    e.classList.add("clear")
                    WinCondition['Cleared'] = WinCondition['Cleared'] + 1
                }
            })
            CheckWinCon()

        }
    }
}

// Retorna uma lista de nodes adjacentes e ocultos. Com uma lista de filtragem como parâmetro
function ClearField(node, avoidList) {
    let result = []
    Peek(node.id.split(",")[0], node.id.split(",")[1]).forEach(e => {
        if (e.classList.contains("flag") && avoidList.indexOf(e) === -1) {
            e.classList.remove("flag")
            e.firstChild.style.display = 'none'
            document.getElementById('counter').innerText = Number(document.getElementById('counter').innerText) + 1
        }
        if (e.classList.contains("hidden") && avoidList.indexOf(e) === -1) {
            result.push(e)
        }
    })
    return result
}



//Anuncia que o jogador perdeu
function GameOver(coordinates) {
    let site = null
    for (i of coordinates) {
        site = document.getElementById(i)
        site.classList.add("boom")
    }
    let disableField = document.getElementById('field')
    disableField.classList.add("disabled")
    document.getElementById('result').innerText = "Game Over"
    document.getElementById('reaction_face').innerText = "🤯"
    JStimer.StopTimer()

}

//Verifica e anuncia se o jogador venceu 
function CheckWinCon() {
    if (WinCondition['toBeCleared'] == WinCondition['Cleared'] && WinCondition['toBeCleared'] != 0) {
        document.getElementById('result').innerText = "Você ganhou, parabéns!"
        document.getElementById('field').classList.add("disabled")
        document.getElementById('reaction_face').innerText = "😎"
        JStimer.StopTimer()
    }
}



function Submit(level) {
    let rows
    let columns
    switch (level) {
        case 0:
            rows = document.getElementById('row').value
            columns = document.getElementById('column').value
            break;
        case 1:
            rows = 8
            columns = 8
            break;
        case 2:
            rows = 12
            columns = 12
            break;
        case 3:
            rows = 15
            columns = 15
    }
    BuildField(rows, columns, Math.round((rows * columns) * 0.15))
}
