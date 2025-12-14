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
    title: "Happy Holidays",
    from: "from Anakaren & Aaron",
    tapPrompt: "tap to enter"
  },

  audio: {
    src: "/assets/audio/lullaby.mp3",
    volume: 0.4
  },

  sections: [
    {
      id: "intro",
      title: "How was our 2025?",
      body: "It was a year of changes, learning, and adventures!",
      layout: "tall-left",
      catAnimation: "walk-across",
      catImage: "/assets/cats/shrimpas_00.png",
      showScrollHint: true,
      images: [
        { src: "/assets/images/images_00.jpg", alt: "Anakaren and Aaron", rotation: "ccw-1", span: "tall" },
        { src: "/assets/images/images_01.jpg", alt: "Sente and Gote on chair", rotation: "cw-1" },
        { src: "/assets/images/images_02.jpg", alt: "Cats cuddling", rotation: "cw-2" }
      ]
    },
    {
      id: "social",
      title: "We saw some faces.",
      body: null,
      layout: "hero-top",
      catAnimation: "peek-corner",
      catImage: "/assets/cats/shrimpas_03.png",
      images: [
        { src: "/assets/images/images_06.jpg", alt: "Friends gathering", rotation: "ccw-1", span: "hero" },
        { src: "/assets/images/images_10.jpg", alt: "Baby shower celebration", rotation: "cw-2" },
        { src: "/assets/images/images_09.jpg", alt: "Trying on a sombrero", rotation: "ccw-2" }
      ]
    },
    {
      id: "weird",
      title: "We got a little weird.",
      body: null,
      layout: "hero-bottom",
      catAnimation: "sleep-corner",
      catImage: "/assets/cats/shrimpas_02.png",
      images: [
        { src: "/assets/images/images_04.jpg", alt: "Upside down illusion", rotation: "cw-1" },
        { src: "/assets/images/images_05.jpg", alt: "Head on plate illusion", rotation: "ccw-1", span: "hero" }
      ]
    },
    {
      id: "cozy",
      title: "We stayed cozy.",
      body: null,
      layout: "tall-right",
      catAnimation: "pop-up",
      catImage: "/assets/cats/shrimpas_01.png",
      images: [
        { src: "/assets/images/images_08.jpg", alt: "Turtle statue", rotation: "ccw-2" },
        { src: "/assets/images/images_03.jpg", alt: "Aaron with cat", rotation: "cw-1", span: "tall" }
      ]
    },
    {
      id: "signoff",
      title: "Happy Holidays!",
      body: "From our family to yours — Anakaren, Aaron, Sente & Gote",
      layout: "single",
      catAnimation: "both-cats",
      catImage: "/assets/cats/shrimpas_04.png",
      images: [
        { src: "/assets/images/images_07.jpg", alt: "Rambutan creature" }
      ]
    }
  ]
};

/**
 * Available presets for the builder UI
 */
export const presets = {
  layouts: [
    { id: "tall-left", label: "Tall Left", description: "Portrait left, 2 stacked right" },
    { id: "tall-right", label: "Tall Right", description: "2 stacked left, portrait right" },
    { id: "hero-top", label: "Hero Top", description: "Wide image top, 2 small below" },
    { id: "hero-bottom", label: "Hero Bottom", description: "2 small top, wide image below" },
    { id: "trio", label: "Trio", description: "3 equal columns" },
    { id: "single", label: "Single", description: "One centered image" }
  ],

  catAnimations: [
    { id: "walk-across", label: "Walk Across", catImage: "/assets/cats/shrimpas_00.png" },
    { id: "peek-corner", label: "Peek from Corner", catImage: "/assets/cats/shrimpas_03.png" },
    { id: "sleep-corner", label: "Sleeping", catImage: "/assets/cats/shrimpas_02.png" },
    { id: "pop-up", label: "Pop Up", catImage: "/assets/cats/shrimpas_01.png" },
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
