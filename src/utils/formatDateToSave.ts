export function formatDateToSave(date: string) {
  const [data, hour] = date.split('T');
  let dateFormatted = data.split('-').reverse().join('/');
  let hourFormatted = hour.split('.')[0];

  let returnDateFormatted = dateFormatted + ' ' + hourFormatted

  return returnDateFormatted;
}