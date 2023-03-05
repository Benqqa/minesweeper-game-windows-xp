import React from "react";
import "../../assets/styles/sprite.css";

export default function SpriteImage({ option }) {
    return (
        <>
            <div className={`sprite ${option}`}></div>
        </>
    );
}
