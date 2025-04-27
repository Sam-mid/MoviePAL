
# MoviePAL

##  Projectstructuur

in de root van de repository staan de volgende mappen:
- `client`: Dit is de frontend van de applicatie, gebouwd met HTML, CSS en JavaScript. Hierin vind je de gebruikersinterface waarmee je kunt communiceren met de server.


- `server`: Dit is de backend van de applicatie, gebouwd met Node.js. Hierin vind je de servercode die verantwoordelijk is voor het verwerken van verzoeken van de client en het communiceren met de Azure OpenAI API.

##  Snel starten

### 1.  Vereisten

- Node.js (v18 of hoger aanbevolen)
- Een geldig `.env` bestand met je Azure OpenAI API-sleutel en configuratie
- Je hebt NPM geinstalleerd in de server map.

```bash
cd server
```

```bash
npm install
```

---

### 2.  Server starten

Ga in de terminal naar de `server` map:

```bash
cd server
``` 
start de server met:

```bash
node --env-file=.env server.js
```

### 3. Client starten
start de client door een live server te draaien op `index.html`

### 4. persoonlijke voorkeuren.
in de server map staat een text document `document.txt` waarin je je persoonlijke voorkeuren kan zetten. Dit document wordt gebruikt om de context van de vraag te bepalen. Het is belangrijk dat dit document goed gevuld is met relevante informatie, zodat de AI een beter antwoord kan geven op je vragen.

### 5. De app gebruiken
vraag in het invoerveld naar een speciefieke film of vraag bijvoorbeeld naar een aanrader op basis van een genre. 
