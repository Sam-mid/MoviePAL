const form = document.querySelector("form");
const inputField = document.getElementById("inputfield");
const submitButton = form.querySelector("button");
const resultDiv = document.getElementById("resultaat");

let messages = [
    ["system", "Belngrijk!, je bent een ai robot die veel vertand heeft van film en series, elk antwoord dat je geeft moet met film of series te maken hebben. als je niet over films of series gaat dan zeg je: die film ken ik niet! "]
];

form.addEventListener("submit", askQuestion);

async function askQuestion(e) {
    e.preventDefault();

    const vraag = inputField.value.trim();
    if (!vraag) return;

    // Voeg de vraag van de gebruiker toe als 'human' rol
    messages.push(["human", vraag]);

    submitButton.disabled = true;
    submitButton.textContent = "Even wachten...";
    resultDiv.textContent = "";

    let volledigAntwoord = "";

    try {
        const response = await fetch("http://localhost:3000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        async function typeWord(word) {
            resultDiv.textContent += word + ' ';
            volledigAntwoord += word + ' ';
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            let words = buffer.split(/\s+/);
            buffer = words.pop();

            for (const word of words) {
                await typeWord(word);
            }
        }

        if (buffer) {
            await typeWord(buffer);
        }

        // Na het volledige antwoord: voeg toe als 'AI' rol in de messages
        messages.push(["AI", volledigAntwoord.trim()]);

    } catch (err) {
        console.error("Fout:", err);
        resultDiv.textContent = "Er ging iets mis.";
    } finally {
        inputField.value = "";
        submitButton.disabled = false;
        submitButton.textContent = "Stel je vraag";
    }
}


