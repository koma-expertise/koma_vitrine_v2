/* KOMA — Panneau Tweaks (police titres · intensité couleur · espacement · variante hero) */

const KOMA_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headingFont": "Archivo",
  "colorIntensity": "Sobre",
  "spacing": "Normal",
  "heroVariant": "Photo + cockpit"
}/*EDITMODE-END*/;

const KOMA_FONT_MAP = { "Archivo": "archivo", "Space Grotesk": "space", "Schibsted Grotesk": "schibsted", "DM Sans": "dmsans" };
const KOMA_COLOR_MAP = { "Sobre": "sobre", "Signature": "signature" };
const KOMA_SPACING_MAP = { "Compact": "compact", "Normal": "normal", "Aéré": "aere" };
const KOMA_HERO_MAP = { "Photo + cockpit": "photo", "Immersif": "immersif", "Épuré typo": "typo" };

function KomaTweaksApp() {
  const [t, setTweak] = useTweaks(KOMA_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const ds = {
      font: KOMA_FONT_MAP[t.headingFont] || "archivo",
      color: KOMA_COLOR_MAP[t.colorIntensity] || "sobre",
      spacing: KOMA_SPACING_MAP[t.spacing] || "normal",
      hero: KOMA_HERO_MAP[t.heroVariant] || "photo"
    };
    const root = document.documentElement;
    root.dataset.font = ds.font;
    root.dataset.color = ds.color;
    root.dataset.spacing = ds.spacing;
    root.dataset.hero = ds.hero;
    try { localStorage.setItem("koma_theme", JSON.stringify(ds)); } catch (e) {}
  }, [t]);

  const hasHero = !!document.querySelector(".hero-home");

  return (
    <TweaksPanel>
      <TweakSection label="Typographie"></TweakSection>
      <TweakSelect label="Police des titres" value={t.headingFont}
        options={["Archivo", "Space Grotesk", "Schibsted Grotesk", "DM Sans"]}
        onChange={(v) => setTweak("headingFont", v)}></TweakSelect>
      <TweakSection label="Couleur et rythme"></TweakSection>
      <TweakRadio label="Intensité couleur" value={t.colorIntensity}
        options={["Sobre", "Signature"]}
        onChange={(v) => setTweak("colorIntensity", v)}></TweakRadio>
      <TweakRadio label="Espacement" value={t.spacing}
        options={["Compact", "Normal", "Aéré"]}
        onChange={(v) => setTweak("spacing", v)}></TweakRadio>
      {hasHero ? <TweakSection label="Hero accueil"></TweakSection> : null}
      {hasHero ? (
        <TweakSelect label="Variante du hero" value={t.heroVariant}
          options={["Photo + cockpit", "Immersif", "Épuré typo"]}
          onChange={(v) => setTweak("heroVariant", v)}></TweakSelect>
      ) : null}
    </TweaksPanel>
  );
}

(function () {
  const mount = document.createElement("div");
  document.body.appendChild(mount);
  ReactDOM.createRoot(mount).render(<KomaTweaksApp></KomaTweaksApp>);
})();
