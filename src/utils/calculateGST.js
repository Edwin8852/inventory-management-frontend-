// Flat 18% GST calculation as per backend logic
export const calculateGST = (amount, rate = 0.18) => {
  return amount * rate;
};
