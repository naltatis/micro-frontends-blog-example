const products = {
  animal1: {
    name: "Die Ente.",
    price: "29,99 €",
    image: "ente.png"
  },
  animal2: {
    name: "Die Schildkröte.",
    price: "19,99 €",
    image: "schildkroete.png"
  }
};

let cartApi = new Set();

class BuyProduct extends HTMLElement {
  static get observedAttributes() {
    return ["sku"];
  }

  connectedCallback() {
    this.render = this.render.bind(this);
    this.addToCart = this.addToCart.bind(this);
    window.addEventListener("buy:cart-changed", this.render);
    this.addEventListener("click", this.addToCart);
    this.sku = this.getAttribute("sku");
    this.render();
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.sku = this.getAttribute("sku");
    this.render();
  }

  render() {
    const { name, price, image } = products[this.sku];
    const inCart = cartApi.has(this.sku);

    const button = inCart
      ? `<div>✓ im Warenkorb</div>`
      : `<button>für ${price} kaufen</button>`;

    this.innerHTML = `
      <img src="./team-buy/images/${image}">
      <strong>${name}</strong>
      ${button}
    `;
  }

  addToCart(e) {
    if (e.target.tagName !== "BUTTON") {
      return;
    }
    cartApi.add(this.sku);
    const event = new CustomEvent("buy:cart-changed", { bubbles: true });
    this.dispatchEvent(event);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.addToCart);
    window.removeEventListener("buy:cart-changed", this.render);
  }
}

class BuyCart extends HTMLElement {
  connectedCallback() {
    this.render = this.render.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    window.addEventListener("buy:cart-changed", this.render);
    this.addEventListener("click", this.removeFromCart);
    this.render();
  }

  render() {
    let items = "";
    cartApi.forEach(sku => {
      const { name, price, image } = products[sku];
      items += `
        <li data-sku="${sku}" role="button" tabindex="0">
          <img src="./team-buy/images/${image}">
        </li>
      `;
    });
    this.innerHTML = `<ol>${items}</ol>`;
  }

  removeFromCart(e) {
    const sku = e.target.getAttribute("data-sku");
    if (!sku) {
      return;
    }
    cartApi.delete(sku);
    const event = new CustomEvent("buy:cart-changed", { bubbles: true });
    this.dispatchEvent(event);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.removeFromCart);
    window.removeEventListener("buy:cart-changed", this.render);
  }
}

window.customElements.define("buy-product", BuyProduct);
window.customElements.define("buy-cart", BuyCart);
