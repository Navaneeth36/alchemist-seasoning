const WA = "916382830926";
/* PHOTOS: put product photos in the images/ folder, then fill in img100 / img1kg below,
   e.g. img100:"images/peri-peri-100g.jpg". Leave empty ("") to show the drawn pack. */
const FLAVOURS = [
  {id:"burger",  name:"Spicy Burger Sauce",     kind:"Sauce",  c:"#E8222E", heat:3, p100:59, p1kg:359, img100:"", img1kg:"", desc:"A smoky, chilli-packed sauce that brings real kick to burgers, wraps and loaded fries."},
  {id:"buffalo", name:"Buffalo Sauce Premix",   kind:"Premix", c:"#FF7A00", t:"#4A0E0E", heat:3, p100:59, p1kg:479, img100:"", img1kg:"", desc:"Tangy, buttery heat in the classic American style. Made for wings, tenders and dips."},
  {id:"nash",    name:"Nashville Sauce Premix", kind:"Premix", c:"#B91C1C", heat:4, p100:59, p1kg:489, img100:"", img1kg:"", desc:"Fiery cayenne with a hint of sweetness, for that famous Nashville hot chicken glaze."},
  {id:"peri",    name:"Peri Peri Sauce Premix", kind:"Premix", c:"#E85D04", heat:3, p100:49, p1kg:399, img100:"", img1kg:"", desc:"Bird's eye chilli, lemon and garlic. Zesty and bright on grilled chicken and chips."},
  {id:"bbq",     name:"BBQ Sauce Premix",       kind:"Premix", c:"#9D0208", heat:1, p100:49, p1kg:349, img100:"", img1kg:"", desc:"Sweet, smoky and rich. A crowd-pleaser for burgers, ribs and pizza bases."},
  {id:"tandoori",name:"Tandoori Mayonnaise",    kind:"Premix", c:"#F48C06", t:"#4A0E0E", heat:2, p100:49, p1kg:369, img100:"", img1kg:"", desc:"Creamy mayo with tandoori masala and roasted spices. Lovely in rolls, shawarma and sandwiches."},
  {id:"garlic",  name:"Garlic Mayonnaise",      kind:"Premix", c:"#F6B100", t:"#4A0E0E", heat:0, p100:49, p1kg:349, img100:"", img1kg:"", desc:"Smooth, mellow garlic mayo that pairs with everything from fries to grilled paneer."}
];
const PRODUCTS = FLAVOURS.flatMap(f => [
  {...f, sku:f.id+"-100", size:"100 g", price:f.p100, img:f.img100},
  {...f, sku:f.id+"-1kg", size:"1 kg",  price:f.p1kg, img:f.img1kg}
]);
const BY_SKU = Object.fromEntries(PRODUCTS.map(p=>[p.sku,p]));
const rs = n => "₹" + n.toLocaleString("en-IN");
const short = n => n.replace(/ Sauce Premix| Premix| Sauce$/,"").replace("Mayonnaise","Mayo");
const heatDots = h => [1,2,3,4].map(i=>`<i class="${i<=h?"on":""}"></i>`).join("");
const pack = p => p.img
  ? `<img src="${p.img}" alt="${p.name} ${p.size} pack" loading="lazy">`
  : `<div class="pack ${p.size==="1 kg"?"tub":"pouch"}" style="--c:${p.c};--t:${p.t||'#fff'}" aria-hidden="true"><div class="lbl"><b>${short(p.name)}</b><i>${p.kind}</i></div><span class="wt">${p.size}</span></div>`;
const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>`;
const waURL = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const clampQty = v => Math.max(1, Math.min(999, parseInt(v,10) || 1));

/* ---------- cart state (kept in this browser) ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("alchemist-cart")||"{}") || {}; } catch(e) { cart = {}; }
Object.keys(cart).forEach(k => { if(!BY_SKU[k]) delete cart[k]; });
const save = () => { try { localStorage.setItem("alchemist-cart", JSON.stringify(cart)); } catch(e){} };
const count = () => Object.values(cart).reduce((a,b)=>a+b,0);
const total = () => Object.entries(cart).reduce((a,[k,q])=>a+BY_SKU[k].price*q,0);

function addToCart(sku, q){
  cart[sku] = Math.min(999,(cart[sku]||0)+q); save(); renderCart();
  document.querySelectorAll("[data-count]").forEach(b=>{b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump")});
  toast(`✓ Added ${q} × ${short(BY_SKU[sku].name)} ${BY_SKU[sku].size}`);
}
function setQty(sku,q){ if(q<=0) delete cart[sku]; else cart[sku]=Math.min(999,q); save(); renderCart(); }

function orderText(lines){
  const name = document.getElementById("custName").value.trim();
  const addr = document.getElementById("custAddr").value.trim();
  let t = "Hi Alchemist Seasoning, I'd like to place an order:\n\n";
  let sum = 0;
  lines.forEach(([sku,q],i)=>{ const p=BY_SKU[sku]; sum+=p.price*q; t += `${i+1}. ${p.name} (${p.size}) × ${q} = ${rs(p.price*q)}\n`; });
  t += `\nTotal: ${rs(sum)}`;
  if(name) t += `\nName: ${name}`;
  if(addr) t += `\nDelivery: ${addr}`;
  return t;
}

const cartBody = document.getElementById("cartBody"), checkout = document.getElementById("checkout");
function renderCart(){
  const n = count(), entries = Object.entries(cart);
  document.querySelectorAll("[data-count]").forEach(b=>b.textContent=n);
  document.getElementById("fab").classList.toggle("show", n>0 && !drawer.classList.contains("open"));
  document.getElementById("itemCount").textContent = n===1 ? "1 item" : `${n} items`;
  document.getElementById("cartTotal").textContent = rs(total());
  cartBody.innerHTML = entries.length ? entries.map(([sku,q])=>{
    const p = BY_SKU[sku];
    return `<div class="line" style="--c:${p.c};--t:${p.t||'#fff'}">
      <span class="sw" aria-hidden="true">${p.size}</span>
      <div><h4>${p.name}</h4><span class="meta price">${rs(p.price)} each</span></div>
      <div class="right">
        <span class="sub price">${rs(p.price*q)}</span>
        <div class="qty" data-sku="${sku}">
          <button data-step="-1" aria-label="Decrease ${p.name} ${p.size}">−</button>
          <input id="cq-${sku}" type="number" min="1" max="999" inputmode="numeric" value="${q}" aria-label="Quantity of ${p.name} ${p.size}">
          <button data-step="1" aria-label="Increase ${p.name} ${p.size}">+</button>
        </div>
        <button class="rm" data-rm="${sku}">Remove</button>
      </div></div>`;
  }).join("") : `<div class="empty"><b>Your cart is empty</b>Pick a quantity on any product and tap “Add to cart”.</div>`;
  updateCheckout();
}
function updateCheckout(){
  const entries = Object.entries(cart);
  checkout.innerHTML = `${waIcon} Place order on WhatsApp · ${rs(total())}`;
  checkout.setAttribute("aria-disabled", entries.length ? "false":"true");
  checkout.href = entries.length ? waURL(orderText(entries)) : "#";
}
["custName","custAddr"].forEach(id=>document.getElementById(id).addEventListener("input",updateCheckout));

cartBody.addEventListener("click",e=>{
  const rm=e.target.closest("[data-rm]"); if(rm){setQty(rm.dataset.rm,0);return}
  const st=e.target.closest("[data-step]"); if(st){const sku=st.closest(".qty").dataset.sku; setQty(sku,(cart[sku]||0)+ +st.dataset.step)}
});
cartBody.addEventListener("change",e=>{ if(e.target.matches("input")){const sku=e.target.closest(".qty").dataset.sku; setQty(sku,clampQty(e.target.value))} });

const drawer=document.getElementById("drawer"), scrim=document.getElementById("scrim");
function openCart(){document.getElementById("toast").classList.remove("show");drawer.classList.add("open");scrim.classList.add("open");drawer.setAttribute("aria-hidden","false");document.getElementById("fab").classList.remove("show");closeMenu();document.getElementById("closeCart").focus()}
function closeCart(){drawer.classList.remove("open");scrim.classList.remove("open");drawer.setAttribute("aria-hidden","true");renderCart()}
document.querySelectorAll("[data-open-cart]").forEach(b=>b.addEventListener("click",openCart));
document.getElementById("closeCart").addEventListener("click",closeCart);
scrim.addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&drawer.classList.contains("open"))closeCart()});

let tt; function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2200)}

/* ---------- home flavour cards ---------- */
document.getElementById("flavours").innerHTML = FLAVOURS.map(f => `
  <article class="flav" style="--c:${f.c};--t:${f.t||'#fff'}">
    <h3>${f.name}</h3>
    <div class="heat" aria-label="Heat ${f.heat} of 4">${heatDots(f.heat)}<span style="margin-left:6px">${["Mild","Gentle","Medium","Hot","Very hot"][f.heat]}</span></div>
    <p>${f.desc}</p>
    <span class="from price">100 g ${rs(f.p100)} · 1 kg ${rs(f.p1kg)}</span>
  </article>`).join("");

/* ---------- products ---------- */
const grid = document.getElementById("grid");
function renderProducts(filter){
  grid.innerHTML = PRODUCTS.filter(p => filter==="all" || p.size===filter).map(p => `
    <article class="prod" style="--c:${p.c};--t:${p.t||'#fff'}" data-sku="${p.sku}">
      <div class="stage">${pack(p)}</div>
      <div class="info">
        <div class="tagrow"><span class="size ${p.size==="1 kg"?"kg":""}">${p.size}</span><span class="heat" aria-label="Heat ${p.heat} of 4">${heatDots(p.heat)}</span></div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <span class="price">${rs(p.price)}<small>per ${p.size} pack</small></span>
        <div class="buy">
          <div class="qty" data-sku="${p.sku}">
            <button data-pstep="-1" aria-label="Decrease quantity">−</button>
            <input id="q-${p.sku}" type="number" min="1" max="999" inputmode="numeric" value="1" aria-label="Quantity of ${p.name} ${p.size}">
            <button data-pstep="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn-pink" data-add="${p.sku}">Add to cart</button>
          <a class="btn btn-wa" data-direct="${p.sku}" href="#" target="_blank" rel="noopener">${waIcon} Order now</a>
        </div>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".prod").forEach(updateDirect);
  armReveal(grid.querySelectorAll(".prod"));
}
function updateDirect(card){
  const p = BY_SKU[card.dataset.sku], q = clampQty(card.querySelector("input").value);
  card.querySelector("[data-direct]").href = waURL(`Hi Alchemist Seasoning, I'd like to order:\n\n${p.name} (${p.size}) × ${q} = ${rs(p.price*q)}\n\nPlease confirm availability and delivery.`);
}
grid.addEventListener("click",e=>{
  const st=e.target.closest("[data-pstep]");
  if(st){const card=st.closest(".prod"),inp=card.querySelector("input");inp.value=clampQty(+inp.value + +st.dataset.pstep);updateDirect(card);return}
  const add=e.target.closest("[data-add]");
  if(add){const card=add.closest(".prod"),inp=card.querySelector("input");addToCart(add.dataset.add,clampQty(inp.value));inp.value=1;updateDirect(card)}
});
grid.addEventListener("input",e=>{ if(e.target.matches("input")) updateDirect(e.target.closest(".prod")) });
grid.addEventListener("change",e=>{ if(e.target.matches("input")){e.target.value=clampQty(e.target.value);updateDirect(e.target.closest(".prod"))} });
document.querySelectorAll(".chip").forEach(ch => ch.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c===ch));
  renderProducts(ch.dataset.f);
}));

/* ---------- ribbon + hero spice dots ---------- */
const words = ["Peri Peri","Nashville Hot","Tandoori Mayo","Smoky BBQ","Buffalo","Garlic Mayo","Spicy Burger"];
document.getElementById("ribbon").innerHTML = [...words,...words].map(w=>`<span>${w}</span>`).join("");
const hero = document.querySelector(".hero");
const SPICE_N = innerWidth < 600 ? 9 : 20;
const spiceCols = ["#E8222E","#B91C1C","#FF7A00","#D9480F","#FFFFFF","#9D0208"];
const spices = [];
for(let i=0;i<SPICE_N;i++){
  const s=document.createElement("span"); s.className="spice";
  const d=6+Math.random()*18; s.style.width=s.style.height=d+"px";
  s.style.left=Math.random()*100+"%"; s.style.top=(SPICE_N<20 ? 74+Math.random()*24 : Math.random()*100)+"%";
  s.style.background=spiceCols[i%spiceCols.length]; s.style.opacity=.45+Math.random()*.4;
  hero.appendChild(s); spices.push({el:s,speed:.15+Math.random()*.5});
}

/* ---------- routing + mobile menu ---------- */
const pages=["home","products","about"];
const menu=document.getElementById("menu"), burger=document.getElementById("burger");
function show(name){
  if(!pages.includes(name)) name="home";
  pages.forEach(p => document.getElementById("page-"+p).hidden = p!==name);
  document.querySelectorAll(".links a[data-link]").forEach(a => a.classList.toggle("active", a.dataset.link===name));
  window.scrollTo({top:0,behavior:"instant"});
  if(name==="products") renderProducts(document.querySelector('.chip[aria-pressed="true"]').dataset.f);
  armReveal(document.querySelectorAll(`#page-${name} .flav, #page-${name} .value, #page-${name} .head, #page-${name} .prose`));
  closeMenu();
}
function closeMenu(){menu.classList.remove("open");burger.setAttribute("aria-expanded","false");burger.setAttribute("aria-label","Open menu")}
burger.addEventListener("click",()=>{const o=!menu.classList.contains("open");menu.classList.toggle("open",o);burger.setAttribute("aria-expanded",o);burger.setAttribute("aria-label",o?"Close menu":"Open menu")});
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-link]");
  if(a){e.preventDefault(); history.replaceState(null,"","#"+a.dataset.link); show(a.dataset.link); return;}
  if(!e.target.closest("header")) closeMenu();
});
window.addEventListener("hashchange",()=>show(location.hash.slice(1)));

/* ---------- scroll reveal (only items below the first screen) ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = "IntersectionObserver" in window ? new IntersectionObserver(es=>es.forEach(en=>{
  if(en.isIntersecting){const el=en.target;el.style.animationDelay=(el.dataset.d||0)+"ms";el.classList.remove("pre");el.classList.add("reveal-in");io.unobserve(el)}
}),{threshold:.12}) : null;
function armReveal(list){
  if(reduce||!io) return;
  let n=0;
  list.forEach(el=>{ if(el.getBoundingClientRect().top > innerHeight){el.classList.add("pre");el.dataset.d=(n++%3)*90;io.observe(el)} });
}

/* ---------- scroll effects ---------- */
const bar=document.getElementById("progress"), head=document.getElementById("top"), ribbon=document.getElementById("ribbon");
let ticking=false;
function onScroll(){
  const y=scrollY, max=document.documentElement.scrollHeight-innerHeight;
  bar.style.transform=`scaleX(${max>0?y/max:0})`;
  head.classList.toggle("scrolled",y>10);
  if(!reduce){
    spices.forEach(s=>s.el.style.transform=`translateY(${y*s.speed}px)`);
  }
  ticking=false;
}
addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(onScroll);ticking=true}},{passive:true});

renderCart();
show(location.hash.slice(1)||"home");
onScroll();