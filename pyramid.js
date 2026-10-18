export const permutation = ['höhe','breite','tiefe'];
export const order = { höhe:0, breite:1, tiefe:2 };
export function apply(H,B,T){
  return { H:H*order.höhe, B:B*order.breite, T:T*order.tiefe, mass:H+B+T }
}
