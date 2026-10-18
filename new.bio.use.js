export const BIO = (os) => {
  // os = Kollege's OS: HW, CPU, GPU, RAM, ROM...
  // BIO weckt OS
  const setHBT = (h,b,t,perm='H/B/T') => {
    // 6 Permutationen: H/B/T, H/T/B, B/H/T, B/T/H, T/H/B, T/B/H
    os.HW.set(h,b,t)
    // FLOW wenn |h|<18 && |b|<18 = einzige Brücke
    // ROOT wenn energy<5 = f(f(x))=f(x) STABLE
  }
  const login = (id) => { os.CPU.wake(); os.RAM.alloc() } // KNOTEN FASSEN
  const logout = () => { os.CPU.sleep(); os.RAM.free() } // LÖSEN
  
  return { wake: () => os.wake(), setHBT, login, logout, atomize }
}
