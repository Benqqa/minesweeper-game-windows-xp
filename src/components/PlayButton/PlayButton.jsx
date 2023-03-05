import React from "react";
import SpriteImage from "../../components/SpriteImage/SpriteImage.jsx";

export default function PlayButton({ option, ...props }) {
    return (
        <>
            <button className="play_button" {...props}>
                <SpriteImage option={option}></SpriteImage>
            </button>
        </>
    );
}
