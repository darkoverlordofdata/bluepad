"use strict";
let timeoutID = 0;
const textbox = document.querySelector('#textbox');
const filenameBox = document.querySelector('#filename');
const saveAnchor = document.querySelector('#save a');
const openAnchor = document.querySelector('#open a');
const openInput = document.querySelector('#open input');
const spellcheck = document.querySelector('#spellcheck');
const printAnchor = document.querySelector("#print");
const aboutIcon = document.querySelector("#about-icon");
const aboutDialog = document.querySelector("#about");
textbox.spellcheck = spellcheck.checked; // Initialize
var PostStatus;
(function (PostStatus) {
    PostStatus[PostStatus["Clean"] = 0] = "Clean";
    PostStatus[PostStatus["Dirty"] = 1] = "Dirty";
})(PostStatus || (PostStatus = {}));
class Post {
    constructor() {
        this.raw = '';
        this.filename = '';
        this.status = PostStatus.Clean;
    }
}
// Automatically load/save cache in local storage when opening and closing the page
textbox.value = localStorage.getItem('bluepad') || '';
textbox.setSelectionRange(textbox.value.length, textbox.value.length); // Place caret at end of content
calcStats(); // Update counters after loading
window.addEventListener('beforeunload', storeLocally);
// Allow inputting tabs in the textarea instead of changing focus to the next element
textbox.addEventListener('keydown', (event) => {
    if (event.key === "Tab") {
        event.preventDefault();
        let text = textbox.value, s = textbox.selectionStart, e = textbox.selectionEnd;
        textbox.value = text.substring(0, s) + '\t' + text.substring(e);
        textbox.selectionStart = textbox.selectionEnd = s + 1;
    }
});
// Auto-save to local storage and calculate stats on every keystroke
textbox.addEventListener('keyup ', () => {
    calcStats();
    window.clearTimeout(timeoutID); // Prevent saving too frequently
    timeoutID = window.setTimeout(storeLocally, 1000);
});
// Save textarea contents as a text file
saveAnchor.addEventListener('click', () => {
    saveAnchor.download = (filenameBox.value || 'bluepad.txt').replace(/^([^.]*)$/, "$1.txt");
    saveAnchor.href = URL.createObjectURL(new Blob([textbox.value], { type: 'text/plain' }));
});
// Load contents from a text file
openAnchor.addEventListener('click', () => {
    openInput.click();
});
openInput.addEventListener('change', () => {
    let reader = new FileReader();
    let file = openInput.files[0]; // Custom property so the filenameBox can be set from within reader.onload()
    reader.onload = function () {
        filenameBox.value = file.name;
        textbox.value = reader.result; // this = FileReader object
    };
    reader.readAsText(openInput.files[0]); // this = input element
});
// Toggle spell-checking
spellcheck.addEventListener('change', () => {
    textbox.spellcheck = spellcheck.checked;
});
// Print the content
printAnchor.addEventListener('click', () => {
    window.print();
});
// Keyboard shortcuts for the save and load functions (`Ctrl+S`, `Ctrl+O`)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        if (event.key === "s") {
            saveAnchor.click();
            event.preventDefault();
        }
        else if (event.key === "o") {
            openInput.click();
            event.preventDefault();
        }
    }
});
// Show the about dialog
aboutIcon.addEventListener('click', () => {
    aboutDialog.showModal();
});
function storeLocally() {
    localStorage.setItem('bluepad', textbox.value);
}
// Calculate and display character, words and line counts
function calcStats() {
    updateCount('char', textbox.value.length);
    updateCount('word', textbox.value === "" ? 0 : textbox.value.replace(/\s+/g, ' ').split(' ').length);
    updateCount('line', textbox.value === "" ? 0 : textbox.value.split(/\n/).length);
}
function updateCount(item, value) {
    const el = document.querySelector('#' + item + '-count');
    el.textContent = value.toString();
}
