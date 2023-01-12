// llaves publicas y privadas de stripe
import STRIPE_KEYS from "./stripe-keys.js"

// lista de productos y precios
let product , prices;

// header de la petición
const optionsFetch = {
 headers: {
  authorization: `Bearer ${STRIPE_KEYS.secret}`
 }
},
// sección donde se van a exponer los productos
$tacos = document.getElementById("tacos"),
// template para los cards
$template = document.getElementById("taco-template").content,
$fragment = document.createDocumentFragment(),
// formato de los precios : $0.00;
moneyFormat = num => `$${num.slice(0,-2)}.${num.slice(-2)}`
// petición de los productos y precios
Promise.all([
 fetch("https://api.stripe.com/v1/products",optionsFetch),
 fetch("https://api.stripe.com/v1/prices", optionsFetch)
])
// por cada peticion, se mapean cada json del array
.then(responses=>Promise.all(responses.map(res=>res.json())))

 
.then(json=>{

  product = json[0].data;
  prices = json[1].data;

  prices.forEach(el =>{

    //  fitro: id de productos que coincidan con los id de los precios
   let productData = product.filter((product) => product.id === el.product);
    // cada card tiene como atributo el id de su precio de cada producto
   $template.querySelector("#taco").setAttribute("data-price",el.id);

   $template.querySelector("img").src = productData[0].images[0];
   $template.querySelector("img").alt = productData[0].name;
   $template.querySelector("figcaption").innerHTML = `
   ${productData[0].name}
   <br>
   ${moneyFormat(el.unit_amount_decimal)} ${el.currency};
   `
    // clonando el template
   let $clone = document.importNode($template,true);
  //  agregando el clon a un fragmento
   $fragment.appendChild($clone);
  });
// agregando el fragmento con todos los clones
  $tacos.appendChild($fragment);

 }).catch(err=>{
 let message = err.statusText || "ocurrio un error";
 $tacos.innerHTML = `${err.status} : ${message}`;
});

document.addEventListener("click",(e)=>{
 if(e.target.matches(".taco *")){
  let priceId = e.target.parentElement.getAttribute("data-price");
  Stripe(STRIPE_KEYS.public)
  .redirectToCheckout({
   lineItems : [{price: priceId, quantity:1}],
   mode : "subscription",
   successUrl : "https://luisgomezojeda.github.io/test-stripe.com/assets/html/stripe-success.html",
   cancelUrl : "https://luisgomezojeda.github.io/test-stripe.com/assets/html/stripe-error.html"
  })
  .then(res=>{
    console.log(res);
   if(res.error){
    $tacos.insertAdjasentHTML("afterend",res.error.message);
   }
  });
 }
})