import "./assets/styles/null.css";
import "./App.css";
import { MinesweeperProvider } from "./providers/MinesweeperContext/MinesweeperContext.js";
import Field from "./components/Field/Field.jsx";
import Header from "./components/Header/Header.jsx";

export default function MinesweeperApp() {
    return (
        <div className="wrapper_game">
            <MinesweeperProvider>
                <Header></Header>
                <Field></Field>
            </MinesweeperProvider>
        </div>
    );
}
