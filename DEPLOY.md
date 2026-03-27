# GitHub Pages Deploy — Warhammer Tournament App

## Vaatimukset
- GitHub-tili (ilmainen)
- Tietokoneella selain riittää — ei tarvita komentoriviä

---

## Vaiheet

### 1. Luo uusi repositorio
1. Mene github.com → kirjaudu sisään
2. Klikkaa **+** → **New repository**
3. Nimi esim: `warhammer-tournament`
4. Aseta **Public** (Pages vaatii tämän ilmaistilillä)
5. Klikkaa **Create repository**

### 2. Lataa index.html repoon
1. Avaa juuri luotu repo
2. Klikkaa **Add file** → **Upload files**
3. Vedä `index.html` tiedosto ikkunaan
4. Commit message: `Add tournament app`
5. Klikkaa **Commit changes**

### 3. Ota GitHub Pages käyttöön
1. Repossa klikkaa **Settings** (yläpalkki)
2. Vasemmassa sivupalkissa: **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / **(root)**
5. Klikkaa **Save**

### 4. Odota ~1 minuutti
- GitHub rakentaa sivun automaattisesti
- Osoite näkyy Pages-asetuksissa:
  `https://SINUN-KÄYTTÄJÄNIMI.github.io/warhammer-tournament/`

---

## Päivitys myöhemmin
1. Lataa uusi `index.html` repoon (Upload files)
2. Korvaa vanha tiedosto
3. Muutokset näkyvät ~1 min kuluessa

---

## Firebase (live standings) — muista
Firebase Realtime Database on jo konfiguroitu tiedostoon.
Varmista että Firebase Consolessa (console.firebase.google.com):
- Realtime Database on **enabled**
- Rules sallii luku ja kirjoitus (test mode):
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
  ⚠️ Tämä on ok turnauksen ajaksi. Tuotantoon lisää autentikointi.

---

## QR-koodi / Share
Kun sovellus on deployattu GitHub Pagesille:
- TO painaa **📡 Share** -nappia
- QR-koodi osoittaa oikeaan GitHub Pages -osoitteeseen
- Pelaajat skannaavat → näkevät live-standings

