import {createContext} from '@lit/context';

export const levelContext = createContext<number>(Symbol('level'));
