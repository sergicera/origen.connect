import * as THREE from "three";

export function createTextSprite(message, parameters = {}) {
  const fontface = parameters.fontface || "Arial";
  const fontsize = parameters.fontsize || 48;
  const color = parameters.color || "#000000";

  // Create an offscreen canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // For simplicity, set a fixed canvas size
  canvas.width = 256;
  canvas.height = 128;

  // Set text styles
  ctx.font = `${fontsize}px ${fontface}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw the text in the center of the canvas
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  // Create sprite material and sprite
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);

  // Adjust the sprite's scale if needed (this is somewhat trial-and-error)
  sprite.scale.set(2, 1, 1); // wide X dimension, half Y dimension

  return sprite;
}
