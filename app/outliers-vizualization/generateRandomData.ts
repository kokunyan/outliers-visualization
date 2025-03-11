export const generateRandomData = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return letters.map((letter) => ({
    name: letter,
    value: Math.floor(Math.random() * 100) + 1,
  }));
};
