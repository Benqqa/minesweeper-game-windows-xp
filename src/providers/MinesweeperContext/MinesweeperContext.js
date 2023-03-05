import {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useState,
    useMemo,
    useEffect,
} from "react";
import { config } from "../../config.js";
import helperGetRandomInt from "../../helpers/helperGetRandomInt.js";

const GameContext = createContext(null);
const CellsContext = createContext(null);
const CellsDispatchContext = createContext(null);

const FIELD_SIZE = config.field.size;
const BOMB_COUNT = config.bombs.count;

/**
 * провайдер для игры "сапер"
 * @param {object} {children}
 * @returns {any}
 */
export function MinesweeperProvider({ children }) {
    const initialCells = generateEmptyCells(FIELD_SIZE);
    // манипуляции над набором ячеек
    const [cells, dispatch] = useReducer(cellsReducer, initialCells);
    // состояние смайлика в хедере
    const [currentSmileType, setSmileType] = useState(
        "smile smile_game_in_progress"
    );
    // количество бомб/мин
    const [currentBombCount, setBombCount] = useState(config.bombs.count);
    // размер  игрового поля
    const [currentFieldSize, setFieldSize] = useState(config.field.size);
    // интервал таймера
    const [currentTimeInterval, setTimeInterval] = useState(null);
    // таймер
    const [timer, setTimer] = useState(0);
    // состояние игрового процесса
    const [currentGameState, setGameState] = useState("not_started");
    // набор используемых игровых состояний
    let gameStates = useMemo(
        () => new Set(["win", "progress", "lose", "not_started"]),
        []
    );
    // набор используемых состояний смайла
    let smileTypes = useMemo(
        () =>
            new Set([
                "smile smile_game_in_progress",
                "smile smile_cell_focus",
                "smile smile_game_win",
                "smile smile_game_lose",
            ]),
        []
    );
    // управление таймером
    useEffect(() => {
        if (currentGameState === "progress") {
            setTimeInterval(
                setInterval(() => {
                    setTimer((value) => {
                        if (value >= 999) {
                            clearInterval(currentTimeInterval);
                            return 999;
                        }
                        return value + 1;
                    });
                }, 1000)
            );
        } else {
            clearInterval(currentTimeInterval);
        }

        return () => clearInterval(currentTimeInterval);
    }, [currentGameState]);

    /**
     * колбек на ячейку в фокусе
     * @param {object} cell - ячейка
     * @param {boolean} isFocus - состояние в фокусе/не в фокусе
     * @returns {boolean}
     */
    const onFocus = useCallback(
        (cell, isFocus) => {
            if (
                currentGameState !== "progress" &&
                currentGameState !== "not_started"
            ) {
                return false;
            }

            if (cell.isOpen === false) {
                if (isFocus) {
                    setSmileType("smile smile_cell_focus");
                } else {
                    setSmileType("smile smile_game_in_progress");
                }
            } else {
                setSmileType("smile smile_game_in_progress");
            }

            return true;
        },
        [currentGameState]
    );

    /**
     * уменьшить количество бомб на одну в счетчике бомб
     * @returns {boolean}
     */
    const decrementBombCount = useCallback(() => {
        setBombCount(currentBombCount - 1);

        return true;
    }, [currentBombCount]);

    /**
     * увеличить количество бомб на одну в счетчике
     * @returns {boolean}
     */
    const incrementBombCount = useCallback(() => {
        setBombCount(currentBombCount + 1);

        return true;
    }, [currentBombCount]);

    /**
     * проверить положение на игровом поле на состояние победы
     * @param {array} cells - ячейки игрового поля
     * @returns {boolean}
     */
    const callWin = useCallback((cells) => {
        if (!Array.isArray(cells)) {
            return false;
        }
        let isWin = true;
        cells.forEach((row) =>
            row.forEach((cell) => {
                if (!cell.isBomb && !cell.isOpen) {
                    isWin = false;
                }
                return cell;
            })
        );
        if (!isWin) {
            return false;
        }
        setGameState("win");
        setSmileType("smile smile_game_win");

        return true;
    }, []);

    /**
     * проверить положение на игровом поле на состояние проигрыша
     * @param {array} cells - ячейки игрового поля
     * @returns {boolean}
     */
    const callLose = useCallback((cells) => {
        if (!Array.isArray(cells)) {
            return false;
        }
        let isLose = false;
        cells.forEach((row) =>
            row.forEach((cell) => {
                if (cell.isBomb && cell.isBang) {
                    isLose = true;
                }
                return cell;
            })
        );
        if (!isLose) {
            return false;
        }
        setGameState("lose");
        setSmileType("smile smile smile_game_lose");

        return true;
    }, []);

    /**
     * подмешать бомбы и номера-подсказки на поле
     * @param {array} cells - ячейки игрового поля
     * @param {any} bombCount -BOMB_COUNT
     * @param {any} fieldSize -FIELD_SIZE
     * @returns {array} cells
     */
    const mixinBombsAndNumbersAtCells = (
        cells,
        bombCount = BOMB_COUNT,
        fieldSize = FIELD_SIZE
    ) => {
        while (bombCount !== 0) {
            let rowId = helperGetRandomInt(fieldSize);
            let columnId = helperGetRandomInt(fieldSize);
            let randomCell = cells[rowId][columnId];
            if (!randomCell.isBomb && !randomCell.isOpen) {
                // bomb mixin
                randomCell.isBomb = true;
                randomCell.cellType = "bomb_cell";
                // numbers mixin
                for (let i = rowId - 1; i <= rowId + 1; i++) {
                    for (let j = columnId - 1; j <= columnId + 1; j++) {
                        let isField =
                            i < fieldSize && i >= 0 && j < fieldSize && j >= 0;
                        if (isField) {
                            let isBombCell =
                                cells[i][j].isBomb &&
                                cells[i][j].cellType === "bomb_cell";
                            if (!isBombCell) {
                                cells[i][j].countBombs++;
                                cells[i][j].cellType = "number_cell";
                            }
                        }
                    }
                }
                bombCount--;
            }
        }
        return cells;
    };

    /**
     * выбор спрайта по состоянию ячейки
     * @param {object} cell - ячейка игрового поля
     * @returns {string}
     */
    const getSpriteImageOption = useCallback((cell) => {
        if (cell.isOpen) {
            switch (cell.cellType) {
                case "bomb_cell": {
                    if (cell.isQuestion) {
                        return "cell question_close_cell";
                    } else if (cell.isFlag) {
                        return "cell bomb_cross_cell";
                    } else if (cell.isBang) {
                        return "cell bomb_bang_cell";
                    } else {
                        return "cell bomb_cell";
                    }
                }
                case "number_cell": {
                    return `cell number_${cell.countBombs}_cell`;
                }
                case "empty_cell": {
                    return "cell empty_cell";
                }
                default: {
                    throw Error("Unknown cell type: " + cell.cellType);
                }
            }
        } else {
            if (cell.isFlag) {
                return "cell flag_cell";
            } else if (cell.isQuestion) {
                return "cell question_close_cell";
            } else {
                return "cell close_cell";
            }
        }
    }, []);

    /**
     * перезапуск игры
     * @returns {boolean}
     */
    const restartGame = () => {
        setBombCount(BOMB_COUNT);
        setGameState("not_started");
        setSmileType("smile smile_game_in_progress");
        setTimer(0);

        return true;
    };

    /**
     * переключение типа смайлика исходя от фокуса на нем
     * @param {boolean} isFocus
     * @returns {boolean}
     */
    const onSmileFocus = (isFocus) => {
        if (isFocus) {
            setSmileType("smile smile_game_in_progress_focus");
        } else {
            switch (currentGameState) {
                case "progress": {
                    setSmileType("smile smile_game_in_progress");

                    return true;
                }
                case "win": {
                    setSmileType("smile smile_game_win");

                    return true;
                }
                case "lose": {
                    setSmileType("smile smile_game_lose");

                    return true;
                }
                default: {
                    setSmileType("smile smile_game_in_progress");

                    return true;
                }
            }
        }
    };

    let game = {
        smileTypes,
        gameStates,
        currentSmileType,
        setSmileType,
        currentBombCount,
        setBombCount,
        currentFieldSize,
        setFieldSize,
        currentTimeInterval,
        setTimeInterval,
        currentGameState,
        setGameState,
        onFocus,
        getSpriteImageOption,
        callLose,
        callWin,
        incrementBombCount,
        decrementBombCount,
        mixinBombsAndNumbersAtCells,
        timer,
        setTimer,
        restartGame,
        onSmileFocus,
    };

    return (
        <GameContext.Provider value={game}>
            <CellsContext.Provider value={cells}>
                <CellsDispatchContext.Provider value={dispatch}>
                    {children}
                </CellsDispatchContext.Provider>
            </CellsContext.Provider>
        </GameContext.Provider>
    );
}

export function useCells() {
    return useContext(CellsContext);
}

export function useCellsDispatch() {
    return useContext(CellsDispatchContext);
}

export function useGame() {
    return useContext(GameContext);
}

/**
 * генерация игрового поля с пустыми ячейками
 * @param {number} fieldSize - размер игрового поля
 * @returns {array} - cells
 */
const generateEmptyCells = (fieldSize) =>
    Array.from({ length: fieldSize }, (element, rowIndex) =>
        Array.from({ length: fieldSize }, (element, columnIndex) => {
            return {
                rowId: rowIndex,
                columnId: columnIndex,
                cellTypes: new Set(["bomb_cell", "number_cell", "empty_cell"]),
                cellType: "empty_cell",
                isBang: false,
                isBomb: false,
                isOpen: false,
                isFlag: false,
                isQuestion: false,
                countBombs: 0,
            };
        })
    );

/**
 * управление ячейками игрового поля
 * @param {array} cells
 * @param {object} action
 * @returns {array} - cells
 */
function cellsReducer(cells, action) {
    switch (action.type) {
        case "openBombs": {
            return cells.map((row) =>
                row.map((cell) => {
                    if (cell.isBomb) {
                        cell.isOpen = true;
                    }

                    return cell;
                })
            );
        }
        case "setEmptyCells": {
            return generateEmptyCells(FIELD_SIZE);
        }
        case "updateCells": {
            return action.cells.map((row) => row.map((cell) => cell));
        }
        case "openBombsAndSetFlags": {
            cells.map((row) =>
                row.map((cell) => {
                    if (cell.isBomb) {
                        cell.isFlag = true;
                    }
                    
                    return cell;
                })
            );
            return cells;
        }
        case "openAroundCells": {
            // рекурсивное открытие ячеек вокруг
            let newCells = cells.map((row) => row.map((cell) => cell));

            const openAroundCells = (cells, currentCell) => {
                let fieldSize = FIELD_SIZE;
                currentCell.isOpen = true;

                let coords = [];

                for (
                    let i = currentCell.rowId - 1;
                    i <= currentCell.rowId + 1;
                    i++
                ) {
                    for (
                        let j = currentCell.columnId - 1;
                        j <= currentCell.columnId + 1;
                        j++
                    ) {
                        let isField =
                            i < fieldSize && i >= 0 && j < fieldSize && j >= 0;
                        if (isField) {
                            coords.push([i, j]);
                        }
                    }
                }

                for (let coord of coords) {
                    let aroundCell = cells[coord[0]][coord[1]];
                    if (
                        aroundCell.cellType === "number_cell" ||
                        aroundCell.isOpen
                    ) {
                        aroundCell.isOpen = true;
                    } else {
                        openAroundCells(newCells, aroundCell);
                    }
                }

                return cells;
            };

            return openAroundCells(newCells, action.cell);
        }
        case "changed": {
            return cells.map((row) =>
                row.filter((cell) => {
                    if (
                        cell.rowId === action.cell.rowId &&
                        cell.columnId === action.cell.columnId
                    ) {
                        return action.cell;
                    } else {
                        return cell;
                    }
                })
            );
        }
        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
