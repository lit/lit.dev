export interface Error {
  error: string;
}
export type Result = Array<{value: string}>;
export type Kind = keyof typeof kindIdMap;

export const baseUrl = 'https://next.json-generator.com/api/json/get/';
export const kindIdMap = {
  '': '',
  'cities': 'VyfXnFpH5',
  'countries': 'Vk0bnY6B9',
  'states': '4J5N3tTH9',
  'streets': 'NybqntTr5',
  // Inserted to demo an error state.
  'error': ''
}

export const kinds = Object.keys(kindIdMap);