/* eslint-disable import/no-anonymous-default-export */

class GlobalFunctions {
  daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  monthsOfYear = [
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

  // Function that gets dates in various formats to use throughout program. Function returns an object
  dateFormats = (date = new Date(), todayDate = 1) => {
    if (todayDate) {
      const dateArray = date.split('-'); // Split date into an array such as ['yyyy', 'mm', 'dd']
      let [year, month, dayOfMonth] = dateArray; // Destructure array
      date = new Date(year, month, dayOfMonth);

      const monthAdjustedForZeroIndex = month - 1; // Adjust month down by one month to account for zero index
      let dateForHeader = new Date(year, monthAdjustedForZeroIndex, dayOfMonth);

      const monthsForHeading = this.monthsOfYear[monthAdjustedForZeroIndex];
      const dayOfWeekForHeading = this.daysOfWeek[dateForHeader.getDay()];

      dateForHeader = `${dayOfWeekForHeading}, ${monthsForHeading} ${dayOfMonth}, ${year}`;

      const datePickerFormattedDate = `${year}-${month}-${dayOfMonth}`;

      return {
        dateForHeader: dateForHeader,
        gameDate: datePickerFormattedDate,
      };
    } else {
      let month = date.getMonth() + 1;
      const monthSpelledOut = this.monthsOfYear[month - 1];
      month = String(month).padStart(2, '0');
      let dayOfMonth = date.getDate();
      dayOfMonth = String(dayOfMonth).padStart(2, '0');
      const year = date.getFullYear();
      const dayOfWeek = this.daysOfWeek[date.getDay() - 1];

      const dateForHeader = `${dayOfWeek}, ${monthSpelledOut} ${dayOfMonth}, ${year}`;
      const datePickerFormattedDate = `${year}-${month}-${dayOfMonth}`;

      return {
        dateForHeader: dateForHeader,
        gameDate: datePickerFormattedDate,
      };
    }
  };
}
export default new GlobalFunctions();
