// This is your test publishable API key.
const stripe = Stripe("pk_test_51QUu0oK36K2fQcz8zq3p37vzt6zktGtGgSWRyFJxDAcToRJO5rZWR1lgsFvAYqKBjBsJrhD5DBgvfC49Wqjigiau00t8TM5c6U");

// The items the customer wants to buy


const itemSummary = JSON.parse(sessionStorage.getItem('itemSummary'));
const items = [];

let totalAmount = 0;

if (itemSummary) {
    for (const [name, { quantity, amountPrice }] of Object.entries(itemSummary)) {
      items.push({
        id: name,
        quantity: quantity,
        amountPrice: amountPrice,
      });
        totalAmount += amountPrice;
    }

    const paymentTotalValue = document.querySelector('.payment-total-value');

    paymentTotalValue.textContent = `$${(totalAmount / 100).toFixed(2)}`;
}

let elements;

initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const { clientSecret, dpmCheckerLink } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElementOptions = {
    layout: "accordion",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");

  // [DEV] For demo purposes only
  setDpmCheckerLink(dpmCheckerLink);
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "http://127.0.0.1:5000/waiting",
    },
  });

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden-xxx");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden-xxx");
    messageContainer.textContent = "";
  }, 10000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner-xxx").classList.remove("hidden-xxx");
    document.querySelector(".payment-btn-text").classList.add("hidden-xxx");
    document.querySelector("#button-text").classList.add("hidden-xxx");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner-xxx").classList.add("hidden-xxx");
    document.querySelector(".payment-btn-text").classList.remove("hidden-xxx");
    document.querySelector("#button-text").classList.remove("hidden-xxx");

  }
}

function setDpmCheckerLink(url) {
  document.querySelector("#dpm-integration-checker").href = url;
}