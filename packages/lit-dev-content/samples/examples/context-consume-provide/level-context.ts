import {createContext} from '@lit/context';

export type Level = {level: number; color: string};

export const levelContext = createContext<Level>(Symbol('level'));
