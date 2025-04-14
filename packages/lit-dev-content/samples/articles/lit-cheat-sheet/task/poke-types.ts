export interface PokedexEntry {
  name: string;
  cries: {
    latest: string;
    legacy: string;
  };
  height: number;
  weight: number;
  types: {type: {name: string}}[];
}
