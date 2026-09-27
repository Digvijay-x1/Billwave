<script lang="ts">
  import Header from "$lib/components/marketing/Header.svelte";
  import Footer from "$lib/components/marketing/Footer.svelte";

  const calLink = "https://cal.com/XXXXXX/30min";
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Talk to Founder",
    description:
      "Book a call with the Billwave founder to discuss your billing architecture.",
    url: "https://billwave.digvijayrawat.me/talk-to-founder",
    mainEntity: {
      "@type": "Organization",
      name: "Billwave",
      url: "https://billwave.digvijayrawat.me",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Founder",
      },
    },
  }).replace(/</g, "\\u003c");
</script>

<svelte:head>
  <title>Talk to Founder — Billwave</title>
  <meta
    name="description"
    content="Book a call with the Billwave founder to discuss your billing architecture."
  />
  <link rel="canonical" href="https://billwave.digvijayrawat.me/talk-to-founder" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://billwave.digvijayrawat.me/talk-to-founder" />
  <meta property="og:title" content="Talk to Founder — Billwave" />
  <meta
    property="og:description"
    content="Book a call with the Billwave founder to discuss your billing architecture."
  />
  <meta property="og:image" content="https://billwave.digvijayrawat.me/og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@DIGVIJAY__RAWAT" />
  <meta name="twitter:url" content="https://billwave.digvijayrawat.me/talk-to-founder" />
  <meta name="twitter:title" content="Talk to Founder — Billwave" />
  <meta
    name="twitter:description"
    content="Book a call with the Billwave founder to discuss your billing architecture."
  />
  <meta name="twitter:image" content="https://billwave.digvijayrawat.me/og.jpg" />
  {@html `<script type="application/ld+json">${structuredData}</script>`}
</svelte:head>

<div
  class="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col"
>
  <Header variant="home" showBorder={false} />

  <main class="flex-grow">
    <section class="px-6 py-16 md:py-24">
      <div class="mx-auto max-w-3xl">
        <div class="mb-12 text-center">
          <p class="eyebrow mb-6 justify-center">Talk to us</p>
          <h1 class="font-display text-display-lg text-balance text-text-primary">
            Let's talk billing.
          </h1>
          <p class="mx-auto mt-5 max-w-md text-sm text-text-secondary md:text-base">
            Book a 30-minute call with our founder to discuss your billing
            architecture, pricing model, or any questions.
          </p>
        </div>

        <div class="overflow-hidden rounded-xl border border-border bg-bg-card shadow-[0_1px_0_var(--color-border-strong)]">
          <div class="dither h-2 w-full" style="--dither-color: var(--color-accent); background-color: var(--color-bg-secondary)" aria-hidden="true"></div>
          <iframe
            src="{calLink}?embed=true&embedType=Inline&hideLandingPageDetails=1&hideEventTypeDetails=1&primaryColor=e8a855"
            title="Book a call with Billwave founder"
            class="block w-full border-none"
            style="min-height: 700px"
            scrolling="yes"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
