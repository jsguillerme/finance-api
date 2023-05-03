export function FormatNumberCard(card_number: any) {
  const regexVerifyIsDigit = /\D/gm;
  const number_card_string = String(card_number);
  let DigitsArray = number_card_string.replace(/\s/g, '').split('');
  let ArrayDigitsToString;

  const arrayNoWords = DigitsArray.filter(digit => {
    if (digit.match(regexVerifyIsDigit)) {
      throw new Error("O número do cartão não pode conter letras")
    }
    return digit
  })

  if (!(arrayNoWords.length >= 13 && arrayNoWords.length <= 17)) {
    throw new Error('O número de digitos do cartão precisa ser entre 13 e 17 dígitos e sem letras!')
  }
  ArrayDigitsToString = arrayNoWords.join('');
  return ArrayDigitsToString;
}