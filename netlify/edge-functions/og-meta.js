export default async (request, context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const BOT_REGEX =
    /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot/i;

  if (!BOT_REGEX.test(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const slug = url.pathname.split("/").pop();
  const id = slug.split("-").pop();

  try {
    const apiRes = await fetch(
      `https://hd-backend-odir.onrender.com/api/products/${id}`,
    );
    const product = await apiRes.json();

    if (!product || !product.name) return context.next();

    const finalPrice =
      Number(product.price) -
      Math.floor((Number(product.price) * Number(product.discount || 0)) / 100);

    const description = product.description
      ? product.description.length > 160
        ? product.description.slice(0, 157) + "..."
        : product.description
      : "Luxury handmade jewellery crafted with premium quality in Pakistan.";

    const escape = (str = "") =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escape(product.name)} | Hamdam Jewellers</title>
<meta name="description" content="${escape(description)}" />
<meta property="og:type" content="product" />
<meta property="og:title" content="${escape(product.name)} | Hamdam Jewellers" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:image" content="${escape(product.image)}" />
<meta property="og:url" content="${escape(request.url)}" />
<meta property="og:site_name" content="Hamdam Jewellers" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(product.name)} | Hamdam Jewellers" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:image" content="${escape(product.image)}" />
</head>
<body>
<h1>${escape(product.name)}</h1>
<p>${escape(description)}</p>
<img src="${escape(product.image)}" alt="${escape(product.name)}" />
<p>PKR ${finalPrice}</p>
</body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return context.next();
  }
};
