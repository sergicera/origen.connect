export default class Container {
  constructor(app, divElement) {
    this.app = app;
    this.container = divElement;
    this.renderer = null;
    this.canvas = null;
  }

  /**
   * Sets the container for the viewer.
   * @param {*} newContainer - The new container element.
   */

  setContainer(newContainer) {
    if (this.container !== newContainer) {
      // Remove canvas from the old container
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
}
