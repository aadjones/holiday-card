/**
 * Card Configuration Schema
 *
 * This defines the structure and content of the holiday card.
 * The CardRenderer consumes this config to generate the card HTML.
 *
 * For Phase B (shareable cards), this same schema will be
 * serialized to/from URL parameters.
 */

export const defaultConfig = {
  intro: {
    year: "2025",
    title: "Happy Holidays!",
    from: "from Anakaren & Aaron",
    tapPrompt: "tap to enter",
    image: "/data/images/intro.jpg"
  },

  audio: {
    src: "/assets/audio/lullaby.mp3",
    volume: 0.4
  },

  sections: [
    {
      id: "intro",
      title: "How was our 2025?",
      body: "Scroll down to find out!",
      layout: "tall-left",
      catAnimation: "walk-across",
      catImage: "/assets/cats/shrimpas_00.png",
      showScrollHint: true,
      images: [
        { src: "/data/images/section-0-img-0.jpg", alt: "Anakaren and Aaron", span: "tall" },
        { src: "/data/images/section-0-img-1.jpg", alt: "Sente and Gote on chair", rotation: "cw-1" },
        { src: "/data/images/section-0-img-2.jpg", alt: "Cats cuddling", rotation: "ccw-1" }
      ]
    },
    {
      id: "social",
      title: "We saw some faces",
      body: null,
      layout: "hero-top",
      catAnimation: "peek-corner",
      catImage: "/assets/cats/shrimpas_03.png",
      images: [
        { src: "/data/images/section-1-img-0.jpg", alt: "Friends gathering", rotation: "ccw-1", span: "hero" },
        { src: "/data/images/section-1-img-1.jpg", alt: "Baby shower celebration", rotation: "cw-2" },
        { src: "/data/images/section-1-img-2.jpg", alt: "Trying on a sombrero", rotation: "ccw-2" }
      ]
    },
    {
      id: "weird",
      title: null,
      body: null,
      layout: "stack",
      catAnimation: "sleep-corner",
      catImage: "/assets/cats/shrimpas_02.png",
      images: [
        { src: "/data/images/section-2-img-0.jpg", alt: "Head on plate illusion", rotation: "ccw-1", span: "hero" },
        { src: "/data/images/section-2-img-1.jpg", alt: "" }
      ]
    },
    {
      id: "cozy",
      title: "We stayed cozy",
      body: null,
      layout: "hero-top",
      catAnimation: "walk-across-right",
      catImage: "/assets/cats/shrimpas_00.png",
      images: [
        { src: "/data/images/section-3-img-0.jpg", alt: "Turtle statue", rotation: "ccw-2" },
        { src: "/data/images/section-3-img-1.jpg", alt: "" },
        { src: "/data/images/section-3-img-2.jpg", alt: "" }
      ]
    },
    {
      id: "signoff",
      title: "We got weird",
      body: null,
      layout: "trio",
      catAnimation: "pop-up",
      catImage: "/assets/cats/shrimpas_01.png",
      images: [
        { src: "/data/images/section-4-img-0.jpg", alt: "" },
        { src: "/data/images/section-4-img-1.jpg", alt: "" },
        { src: "/data/images/section-4-img-2.jpg", alt: "" }
      ]
    },
    {
      id: "finale",
      title: "Here's to an even crazier 2026!",
      body: null,
      layout: "hero-bottom",
      catAnimation: "both-cats",
      catImage: "/assets/cats/shrimpas_04.png",
      images: [
        { src: "/data/images/section-5-img-0.jpg", alt: "" },
        { src: "/data/images/section-5-img-1.jpg", alt: "" },
        { src: "/data/images/section-5-img-2.jpg", alt: "" }
      ]
    }
  ]
};

/**
 * Available presets for the builder UI
 */
export const presets = {
  layouts: [
    { id: "single", label: "Single", description: "One centered image" },
    { id: "stack", label: "Stack", description: "2 landscape images stacked" },
    { id: "grid", label: "Grid", description: "2x2 grid of 4 images" },
    { id: "trio", label: "Trio", description: "1 on top, 2 below (pyramid)" },
    { id: "tall-left", label: "Tall Left", description: "Portrait left, 2 stacked right" },
    { id: "tall-right", label: "Tall Right", description: "2 stacked left, portrait right" },
    { id: "hero-top", label: "Hero Top", description: "Wide image top, 2 small below" },
    { id: "hero-bottom", label: "Hero Bottom", description: "2 small top, wide image below" }
  ],

  catAnimations: [
    { id: "walk-across", label: "Walk Left to Right", catImage: "/assets/cats/shrimpas_00.png" },
    { id: "walk-across-right", label: "Walk Right to Left", catImage: "/assets/cats/shrimpas_00.png" },
    { id: "peek-corner", label: "Peek from Corner", catImage: "/assets/cats/shrimpas_03.png" },
    { id: "peek-center", label: "Peek from Center", catImage: "/assets/cats/shrimpas_03.png" },
    { id: "sleep-corner", label: "Sleep in Corner", catImage: "/assets/cats/shrimpas_02.png" },
    { id: "sleep-center", label: "Sleep in Center", catImage: "/assets/cats/shrimpas_02.png" },
    { id: "pop-up", label: "Pop Up (Corner)", catImage: "/assets/cats/shrimpas_01.png" },
    { id: "pop-up-center", label: "Pop Up (Center)", catImage: "/assets/cats/shrimpas_01.png" },
    { id: "center-middle", label: "Center of Card", catImage: "/assets/cats/shrimpas_03.png" },
    { id: "both-cats", label: "Both Cats", catImage: "/assets/cats/shrimpas_04.png" },
    { id: "none", label: "No Cat", catImage: null }
  ],

  rotations: [
    { id: null, label: "None" },
    { id: "cw-1", label: "Slight Right" },
    { id: "cw-2", label: "More Right" },
    { id: "ccw-1", label: "Slight Left" },
    { id: "ccw-2", label: "More Left" }
  ]
};
