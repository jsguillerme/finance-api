export function calculatorSpentCurrent(old_spent: string, value: string) {
  let old_spent_number = Number(old_spent);
  let value_number = Number(value);

  return String(old_spent_number += value_number)

}