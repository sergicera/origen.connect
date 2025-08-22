export const PALETTES = {
  dark: {
    backgroundColor: "rgba(15, 18, 20, 1)",
    fogColor: "rgba(15, 18, 20, 1)",
    fogDensity: 0.0015,
    ambientLight: {
      color: 0x404050,
      intensity: 0.4
    },
    hemisphereLight: {
      skyColor: 0xb1e1ff,
      groundColor: 0x080820,
      intensity: 0.6
    },
    directionalLight: {
      color: 0xffffff,
      intensity: 0.8
    },
    fillLight: {
      color: 0x8ebbff,
      intensity: 0.3
    },
    rimLight: {
      color: 0xffffcc,
      intensity: 0.2
    },
    gridHelper: {
      primaryColor: 0x555555,
      secondaryColor: 0x222222
    },
    baseEmissiveMultiplier: 0.3,
    specularColor: 0x222222,
    shininess: 10
  },
  light: {
    backgroundColor: "rgba(245, 245, 245, 1)",
    fogColor: "rgba(245, 245, 245, 1)",
    fogDensity: 0.001,
    ambientLight: {
      color: 0x606060,
      intensity: 0.5
    },
    hemisphereLight: {
      skyColor: 0xdaeeff,
      groundColor: 0xf8f8f8,
      intensity: 0.7
    },
    directionalLight: {
      color: 0xffffff,
      intensity: 0.7
    },
    fillLight: {
      color: 0xc9d8ff,
      intensity: 0.25
    },
    rimLight: {
      color: 0xffffec,
      intensity: 0.15
    },
    gridHelper: {
      primaryColor: 0xaaaaaa,
      secondaryColor: 0xcccccc
    },
    baseEmissiveMultiplier: 0.1,
    specularColor: 0x444444,
    shininess: 5
  }
} 