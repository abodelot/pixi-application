/**
 * Shared object keeping references to main components across application
 */
export class Context {
  // Ref to Tilemap object
  static tilemap;

  // Size { width, height } of view port (size of ScrollContainer)
  static viewPort;
}
