/* eslint-disable import/no-anonymous-default-export */

class GlobalFunctions {
  // Function that gets dates in various formats to use throughout program. Function returns an object
  datesWithDifferentFormats = (
    date = new Date(),
    dateFromDatePicker = false
  ) => {
    console.log(dateFromDatePicker);
    console.log(date);
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const monthsOfYear = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Must be 2 characters in length and if month is say 8 it will pad it with a beginning 0 to make it 08. Add 1 to month since it starts with index of 0
    const monthWithNoPadding = date.getMonth();
    const dayOfMonth = dateFromDatePicker
      ? String(date.getDate() + 1).padStart(2, '0')
      : String(date.getDate()).padStart(2, '0'); // Must be 2 characters in length and if day is say 8 it will pad it with a beginning 0 to make it 08.
    console.log(`Day of month is ---> ${dayOfMonth}`);
    const dayOfWeek = date.getDay();
    const todayDateModified = `${year}-${month}-${dayOfMonth}`;
    const dateSpelledOutWithDayOfWeek = `${daysOfWeek[dayOfWeek]}, ${monthsOfYear[monthWithNoPadding]} ${dayOfMonth}, ${year}`;
    return {
      dateSpelledOutWithDayOfWeek: dateSpelledOutWithDayOfWeek,
      datePickerFormat: todayDateModified,
    };
  };
}
export default new GlobalFunctions();
