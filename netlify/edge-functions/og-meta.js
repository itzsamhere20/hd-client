export default async (request, context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const BOT_REGEX =
    /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot/i;

  if (!BOT_REGEX.test(userAgent)) {
    return context.next();
  }

  const escape = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const API_BASE = "https://hd-backend-odir.onrender.com/api";
  const SITE = "https://hamdamcollections.com";
  const DEFAULT_IMAGE = `${SITE}/favicon.png`;

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const renderHTML = ({
    title,
    description,
    image,
    type = "website",
    extraBody = "",
  }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}" />
<meta property="og:type" content="${escape(type)}" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:image" content="${escape(image)}" />
<meta property="og:url" content="${escape(request.url)}" />
<meta property="og:site_name" content="Hamdam Jewellers" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:image" content="${escape(image)}" />
</head>
<body>
<h1>${escape(title)}</h1>
<p>${escape(description)}</p>
<img src="${escape(image)}" alt="${escape(title)}" />
${extraBody}
</body>
</html>`;

  try {
    /* ───────── /collections (all products) ───────── */
    if (segments.length === 1 && segments[0] === "collections") {
      const html = renderHTML({
        title: "Collections | Hamdam Jewellers",
        description:
          "Browse all jewellery collections at Hamdam — rings, necklaces, bracelets and more. Handmade with premium quality in Pakistan.",
        image: DEFAULT_IMAGE,
      });

      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    /* ───────── /collections/:category ───────── */
    if (segments.length === 2 && segments[0] === "collections") {
      const categoryName = segments[1];

      const catRes = await fetch(`${API_BASE}/categories`);
      const categories = await catRes.json();
      const categoryData = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
      );

      const niceName = capitalize(categoryName);
      const title = `${niceName} | Hamdam Jewellers`;
      const description = `Explore our ${niceName} collection at Hamdam Jewellers — handmade luxury jewellery crafted with premium quality in Pakistan.`;
      const image = categoryData?.image || DEFAULT_IMAGE;

      const html = renderHTML({ title, description, image });

      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    /* ───────── /collections/:category/:slug (product) ───────── */
    if (segments.length === 3 && segments[0] === "collections") {
      const slug = segments[2];
      const id = slug.split("-").pop();

      const apiRes = await fetch(`${API_BASE}/products/${id}`);
      const product = await apiRes.json();

      if (!product || !product.name) return context.next();

      const finalPrice =
        Number(product.price) -
        Math.floor(
          (Number(product.price) * Number(product.discount || 0)) / 100,
        );

      const description = product.description
        ? product.description.length > 160
          ? product.description.slice(0, 157) + "..."
          : product.description
        : "Luxury handmade jewellery crafted with premium quality in Pakistan.";

      const title = `${product.name} | Hamdam Jewellers`;
      const image = product.image || DEFAULT_IMAGE;

      const html = renderHTML({
        title,
        description,
        image,
        type: "product",
        extraBody: `<p>PKR ${finalPrice}</p>`,
      });

      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return context.next();
  } catch (err) {
    return context.next();
  }
};
