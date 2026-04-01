exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const { items } = JSON.parse(event.body);
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return { statusCode: 500, body: JSON.stringify({ error: "Token no configurado" }) };
    }
    const preference = {
      items: items.map(item => ({
        title: item.name,
        quantity: item.qty,
        unit_price: parseInt(item.price),
        currency_id: "ARS"
      })),
      back_urls: {
        success: "https://ladecooficial.com.ar?status=ok",
        failure: "https://ladecooficial.com.ar?status=error",
        pending: "https://ladecooficial.com.ar?status=pending"
      },
      auto_return: "approved",
      statement_descriptor: "LA DECO",
      external_reference: "ladeco-" + Date.now()
    };
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken
      },
      body: JSON.stringify(preference)
    });
    const data = await response.json();
    if (data.init_point) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.init_point })
      };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: "No se pudo crear el pago" }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
