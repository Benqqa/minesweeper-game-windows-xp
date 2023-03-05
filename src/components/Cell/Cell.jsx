import React from "react";
import SpriteImage from "../../components/SpriteImage/SpriteImage.jsx";
import {
    useCells,
    useCellsDispatch,
    useGame,
} from "../../providers/MinesweeperContext/MinesweeperContext.js";

export default function Cell({ cell }) {
    const cell_dispatch = useCellsDispatch();
    const {
        onFocus,
        getSpriteImageOption,
        callLose,
        callWin,
        incrementBombCount,
        decrementBombCount,
        setBombCount,
        currentGameState,
        setGameState,
        mixinBombsAndNumbersAtCells,
        setTimer,
    } = useGame();
    const cells = useCells();

    /**
     * колбек на открытие ячейки
     * @param {object} cell - ячейка игрового поля
     * @returns {boolean}
     */
    const onOpen = (cell) => {
        if (cell.isOpen || cell.isFlag || cell.isQuestion) {
            return false;
        }
        switch (currentGameState) {
            case "progress": {
                cell.isOpen = true;
                if (cell.cellType === "bomb_cell") {
                    cell.isBang = true;
                }
                if (cell.cellType === "empty_cell") {
                    cell_dispatch({
                        type: "openAroundCells",
                        cell: cell,
                    });
                } else {
                    cell_dispatch({
                        type: "changed",
                        cell: cell,
                    });
                }
                if (cell.isBang) {
                    callLose(cells);
                    cell_dispatch({
                        type: "openBombs",
                    });
                } else {
                    let isWin = callWin(cells);
                    if (isWin) {
                        cell_dispatch({
                            type: "openBombsAndSetFlags",
                        });
                        setBombCount(0);
                    }
                }

                return true;
            }
            case "not_started": {
                cell.isOpen = true;
                cell_dispatch({
                    type: "changed",
                    cell: cell,
                });
                cell_dispatch({
                    type: "updateCells",
                    cells: mixinBombsAndNumbersAtCells(cells),
                });
                if (cell.cellType === "empty_cell") {
                    cell_dispatch({
                        type: "openAroundCells",
                        cell: cell,
                    });
                }
                let isWin = callWin(cells);
                if (isWin) {
                    cell_dispatch({
                        type: "openBombsAndSetFlags",
                    });
                    setBombCount(0);
                }
                setGameState("progress");
                setTimer(0);

                return true;
            }
            default: {
                return false;
            }
        }
    };

    /**
     * колбек на клик правой кнопкой мыши по ячейке
     * @param {Event} event
     * @param {object} cell - ячейка игрового поля
     * @returns {boolean}
     */
    const onRightClick = (event, cell) => {
        event.preventDefault();
        switch (currentGameState) {
            case "progress": {
                if (cell.isOpen) {
                    return false;
                }
                if (cell.isFlag) {
                    cell.isQuestion = true;
                    cell.isFlag = false;
                    incrementBombCount();
                } else if (cell.isQuestion) {
                    cell.isQuestion = false;
                } else {
                    cell.isFlag = true;
                    decrementBombCount();
                }
                cell_dispatch({
                    type: "changed",
                    cell: cell,
                });

                return true;
            }
            default: {
                return false;
            }
        }
    };

    return (
        <>
            <div
                className={`cell_${cell.rowId}_${cell.columnId}`}
                onClick={() => onOpen(cell)}
                onMouseDown={() => onFocus(cell, true)}
                onMouseUp={() => onFocus(cell, false)}
                onMouseOut={() => onFocus(cell, false)}
                onContextMenu={(event) => onRightClick(event, cell)}
            >
                <SpriteImage option={getSpriteImageOption(cell)}></SpriteImage>
            </div>
        </>
    );
}
