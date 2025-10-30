export default function Head() {
  const title = "Free Online File Converter (50+ Formats) | Converto";
  const description = "Convert, compress, and transform files online with 50+ professional tools—CSV, Excel, PDF, JSON, images, audio, and more. Fast, secure, and no sign‑up required.";
  return (
    <>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href="https://converto.dev/" />
    </>
  );
}


