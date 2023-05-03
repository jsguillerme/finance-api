export function protectedNumberCard(cardNumber: string) {
  let arrayNumbers = cardNumber.split('');
  arrayNumbers.map((value, index) => {
    if (index >= 4 && index <= 11) {
      arrayNumbers[index] = '*'
    }
  })

  return arrayNumbers.join('');
}
