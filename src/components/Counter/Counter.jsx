import React from "react";
import "../../assets/styles/counter.css";
import SpriteImage from "../../components/SpriteImage/SpriteImage.jsx";

export default function Counter({ value }) {
    if (value < 0) {
        value = 0;
    }
    let numericsList = value.toString().split("");
    if (numericsList.length < 3) {
        for (let i = 0; i < 4 - numericsList.length; i++) {
            numericsList.unshift("0");
        }
    }
    const spriteImageList = numericsList.map((numeric, index) => {
        return (
            <SpriteImage
                key={value.toString() + index}
                option={`numeric numeric_${numeric}`}
            ></SpriteImage>
        );
    });

    return (
        <>
            <div className="counter">
                {spriteImageList}
            </div>
        </>
    );
}
