# Alchemist Seasoning website

A plain HTML, CSS and JavaScript site. No build step or installs needed.

## Folder layout
- `index.html` – the page structure (Home, Products, About us, cart)
- `css/style.css` – all colours, fonts and layout
- `js/main.js` – products, prices, cart and WhatsApp ordering
- `images/` – put product photos here

## Open it in VS Code
1. Unzip the folder and open it in VS Code (File → Open Folder).
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server**.

## Change prices or descriptions
Edit the `FLAVOURS` list at the top of `js/main.js`. `p100` is the 100 g price and `p1kg` is the 1 kg price.

## Add product photos
1. Copy photos into `images/` (e.g. `peri-peri-100g.jpg`).
2. In `js/main.js`, set `img100:"images/peri-peri-100g.jpg"` and `img1kg:"images/peri-peri-1kg.jpg"` for that flavour.
Square photos (around 800 × 800) look best.

## Change the WhatsApp number
In `js/main.js`, edit `const WA = "916382830926";` (country code + number, no + or spaces).
Also update the plain `wa.me` links in `index.html`.

## Colours
The palette is at the top of `css/style.css` (`--haldi`, `--kesar`, `--mirchi`, etc.).

## Go live for free
Upload the folder to Netlify (drag and drop), GitHub Pages or Vercel.
