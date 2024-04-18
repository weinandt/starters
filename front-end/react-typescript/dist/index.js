import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
function MyButton() {
    return (React.createElement("button", null, "I'm a button"));
}
let App = function MyApp() {
    return (React.createElement("div", null,
        React.createElement("h1", null, "Welcome to my app"),
        React.createElement(MyButton, null)));
};
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(StrictMode, null,
    React.createElement(App, null)));
