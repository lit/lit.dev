import {createContext} from '@lit/context';

export type Level = {level: number; prefix: string};

export const levelContext = createContext<Level>(Symbol('prefix'));
