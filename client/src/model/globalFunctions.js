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

  hockeySeasonStartMonth = 8; // August (approx month)
  hockeySeasonEndMonth = 4; // April (approx month)

  // Function to determine hockey season based on the date provided to function
  hockeySeason = (date) => {
    const dateArray = date.split('-');
    const year = +dateArray[0];
    const month = +dateArray[1];
    // console.log(dateArray);
    // console.log(year, typeof year);
    // console.log(month, typeof month);
    if (month >= 8 && month <= 12) {
      return `${year}-${year + 1}`;
    } else if (month >= 1 && month <= 4) {
      return `${year - 1}-${year}`;
    } else {
      return 'Not a valid regular season';
    }
  };

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
      console.log(date);
      let month = date.getMonth() + 1;
      const monthSpelledOut = this.monthsOfYear[month - 1];
      month = String(month).padStart(2, '0');
      let dayOfMonth = date.getDate();
      dayOfMonth = String(dayOfMonth).padStart(2, '0');
      const year = date.getFullYear();
      const dayOfWeek = this.daysOfWeek[date.getDay() - 1];
      console.log(dayOfWeek);

      const dateForHeader = `${dayOfWeek}, ${monthSpelledOut} ${dayOfMonth}, ${year}`;
      console.log(dateForHeader);
      const datePickerFormattedDate = `${year}-${month}-${dayOfMonth}`;

      return {
        dateForHeader: dateForHeader,
        gameDate: datePickerFormattedDate,
      };
    }
  };
}
export default new GlobalFunctions();
