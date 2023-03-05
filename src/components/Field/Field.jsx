import React from "react";
import "../../assets/styles/field.css";
import Cell from "../../components/Cell/Cell.jsx";
import { useCells } from "../../providers/MinesweeperContext/MinesweeperContext.js";

export default function Field() {
    const cells = useCells();
    return (
        <div
            className="field"
            style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}
        >
            {cells.map((row) =>
                row.map((cell) => (
                    <Cell key={`${cell.rowId}_${cell.columnId}`} cell={cell} />
                ))
            )}
        </div>
    );
}
