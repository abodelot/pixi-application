import { Game } from './Game';
import { Tilemap } from './Tilemap';
import { MiniMap } from './MiniMap';

interface ViewPort {
  width: number;
  height: number;
}

/**
 * Shared object keeping references to main components across application
 */
export class Context {
  static game: Game;

  // Ref to Tilemap object
  static tilemap: Tilemap;

  // Minimap in toolbar
  static miniMap: MiniMap;

  // Size { width, height } of view port (size of ScrollContainer)
  static viewPort: ViewPort;
}
