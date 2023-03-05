import React from "react";
import "../../assets/styles/header.css";
import Counter from "../../components/Counter/Counter.jsx";
import PlayButton from "../../components/PlayButton/PlayButton.jsx";
import {
    useGame,
    useCellsDispatch,
} from "../../providers/MinesweeperContext/MinesweeperContext.js";

export default function Header() {
    const cells_dispatch = useCellsDispatch();
    const {
        currentBombCount,
        currentSmileType,
        timer,
        restartGame,
        onSmileFocus,
    } = useGame();
    return (
        <div className="header">
            <Counter value={currentBombCount}></Counter>
            <PlayButton
                option={currentSmileType}
                onClick={() => {
                    cells_dispatch({
                        type: "setEmptyCells",
                    });
                    restartGame();
                }}
                onMouseDown={() => onSmileFocus(true)}
                onMouseUp={() => onSmileFocus(false)}
                onMouseOut={() => onSmileFocus(false)}
            ></PlayButton>
            <Counter value={timer}></Counter>
        </div>
    );
}
