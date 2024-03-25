"use strict"
let timeoutID:number = 0
const textbox = document.querySelector('#textbox') as HTMLTextAreaElement
const filenameBox = document.querySelector('#filename') as HTMLInputElement
const saveAnchor = document.querySelector('#save a') as HTMLAnchorElement
const openAnchor = document.querySelector('#open a') as HTMLAnchorElement
const openInput = document.querySelector('#open input') as HTMLInputElement
const spellcheck = document.querySelector('#spellcheck') as HTMLInputElement
const printAnchor = document.querySelector("#print") as HTMLAnchorElement
const aboutIcon = document.querySelector("#about-icon") as HTMLAnchorElement
const aboutDialog = document.querySelector("#about") as HTMLDialogElement

textbox.spellcheck = spellcheck.checked // Initialize

enum PostStatus {
    Clean = 0,
    Dirty = 1

}


class Post {

    children: any
    raw: string = ''
    filename: string = ''
    status: PostStatus = PostStatus.Clean
    constructor(){}



}
// Automatically load/save cache in local storage when opening and closing the page
textbox.value = localStorage.getItem('bluepad') || ''
textbox.setSelectionRange(textbox.value.length, textbox.value.length) // Place caret at end of content
calcStats() // Update counters after loading

window.addEventListener('beforeunload', storeLocally)
// Allow inputting tabs in the textarea instead of changing focus to the next element
textbox.addEventListener('keydown', (event) => {
    if (event.key === "Tab") {
        event.preventDefault()
        let text = textbox.value, s = textbox.selectionStart, e = textbox.selectionEnd
        textbox.value = text.substring(0, s) + '\t' + text.substring(e)
        textbox.selectionStart = textbox.selectionEnd = s + 1
    }
})

// Auto-save to local storage and calculate stats on every keystroke
textbox.addEventListener('keyup ', () => {
    calcStats()
    window.clearTimeout(timeoutID) // Prevent saving too frequently
    timeoutID = window.setTimeout(storeLocally, 1000)
})


// Save textarea contents as a text file
saveAnchor.addEventListener('click', () => {
    saveAnchor.download = (filenameBox.value || 'bluepad.txt').replace(/^([^.]*)$/, "$1.txt")
    saveAnchor.href = URL.createObjectURL(new Blob([textbox.value], { type: 'text/plain' }))
})

// Load contents from a text file
openAnchor.addEventListener('click', () => {
    openInput.click()
})

openInput.addEventListener('change', () => {
    let reader:FileReader = new FileReader()
    let file = openInput.files![0] // Custom property so the filenameBox can be set from within reader.onload()
    reader.onload = function () {
        filenameBox.value = file.name
        textbox.value = reader.result as string // this = FileReader object
    }
    reader.readAsText(openInput.files![0]) // this = input element
})

// Toggle spell-checking
spellcheck.addEventListener('change', () => {
    textbox.spellcheck = spellcheck.checked
})


// Print the content
printAnchor.addEventListener('click', () => {
    window.print()
})

// Keyboard shortcuts for the save and load functions (`Ctrl+S`, `Ctrl+O`)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        if (event.key === "s") {
            saveAnchor.click()
            event.preventDefault()
        }
        else if (event.key === "o") {
            openInput.click()
            event.preventDefault()
        }
    }
})

// Show the about dialog
aboutIcon.addEventListener('click', () => {
    aboutDialog.showModal()
})

function storeLocally() { 
    localStorage.setItem('bluepad', textbox.value) 
}

// Calculate and display character, words and line counts
function calcStats() {
    updateCount('char', textbox.value.length)
    updateCount('word', textbox.value === "" ? 0 : textbox.value.replace(/\s+/g, ' ').split(' ').length)
    updateCount('line', textbox.value === "" ? 0 : textbox.value.split(/\n/).length)
}

function updateCount(item:string, value:number) {
    const el = document.querySelector('#' + item + '-count') as HTMLSpanElement
    el.textContent = value.toString()
}
