"use strict"

const textInput = document.getElementById('text-input');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const saveButton = document.getElementById('save-button');
const keySelect = document.getElementById('key-select');
const encipherButton = document.getElementById('encipher-button');
const decipherButton = document.getElementById('decipher-button');
const crackButton = document.getElementById('crack-button');
const dict =  new Typo("en_US");

// Populate dropdown with keys 0-25
for (let i = 0; i <= 25; i++) {
    const key = document.createElement('option');
    key.value = i;
    key.text = i;
    keySelect.appendChild(key);
}

// Upload a selected file into the input textarea
uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            textInput.value = event.target.result;
        };
        reader.readAsText(file);
    }
});

saveButton.addEventListener('click', () => {
    const text = textInput.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caesar_cipher_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Shift alphabetic characters in a text string up (encipher) or down (decipher) by key
function caesarCipher(text, key, encipher = true) {
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            let shiftAmount = encipher ? key : -key;
            if (code >= 65 && code <= 90) {
                return String.fromCharCode(((code - 65 + shiftAmount + 26) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                return String.fromCharCode(((code - 97 + shiftAmount + 26) % 26) + 97);
            }
        }
        return char;
    }).join('');
}

// Handle encipher button
encipherButton.addEventListener('click', () => {
    const text = textInput.value;
    const shift = parseInt(keySelect.value);
    textInput.value = caesarCipher(text, shift, true);
});

// Handle decipher the same way but pass false so it will shift in the other direction
decipherButton.addEventListener('click', () => {
    const text = textInput.value;
    const shift = parseInt(keySelect.value);
    textInput.value = caesarCipher(text, shift, false);
});

// Attempt to crack an enciphered text string by checking every possibility for the key and
// selecting the one which results in a deciphered string with the fewest misspelled words.
dict.ready.then( () => {
    crackButton.addEventListener('click', () => {
        const text = textInput.value;
        let bestShift = 0;
        let leastMisspellings = Infinity;

        // Test all possible shifts (0-25)
        for (let shift = 0; shift <= 25; shift++) {
            const decipheredText = caesarCipher(text, shift, false);
            const words = decipheredText.split(/\s+/);

            // Count how many words for which dict.check() returns false
            const misspellings = words.filter(word => !dict.check(word)).length;
            if (misspellings < leastMisspellings) {
                leastMisspellings = misspellings;
                bestShift = shift;
            }
        }

        // Update key and decipher the text
        keySelect.value = bestShift;
        textInput.value = caesarCipher(text, bestShift, false);
    });
});
