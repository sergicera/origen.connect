export default class Container {
  constructor(app, divElement) {
    this.app = app;
    this.container = divElement;
    this.canvas = null; // Will be set by the ObjViewer
  }

  get clientWidth() {
    return this.container.clientWidth;
  }

  get clientHeight() {
    return this.container.clientHeight;
  }

  setCanvas(canvasElement) {
    // If there's already a canvas, remove it
    if (this.canvas && this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }

    this.canvas = canvasElement;

    // Append new canvas if container is present
    if (this.container && this.canvas) {
      this.container.appendChild(this.canvas);
    }
  }

  setContainer(newContainer) {
    if (this.container !== newContainer) {
      // Remove the canvas from the old container if it exists
      if (
        this.container &&
        this.canvas &&
        this.canvas.parentElement === this.container
      ) {
        this.container.removeChild(this.canvas);
      }

      // Update the container reference
      this.container = newContainer;

      // Append canvas to the new container
      if (this.container && this.canvas) {
        this.container.appendChild(this.canvas);
      }
    }
  }

  clear() {
    if (this.canvas && this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
  }
}
