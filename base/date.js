// @ts-check
import * as StringUtils from "./string.js"

/**
 * Utility function to handle dates
 * @module DateUtilities
 */

const HOURS_IN_DAY = 24
const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60
const MILLISECOND_IN_SECOND = 1000
const MILLISECONDS_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECOND_IN_SECOND
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

/**
 * Get same date as given but with time at 00:00
 * @param {Date} date 
 * @returns {Date}
 */
export function getDayStart(date) {
    return new Date(date.getFullYear(),date.getMonth(),date.getDate())
}

/**
 * Get first date of month of given date, offset by given offsets
 * @param {Date} date
 * @param {number} monthOffset 
 * @param {number} dateOffset
 * @returns {Date}
 */
 export function getFirstOfMonth(date, monthOffset = 0, dateOffset = 0) {
    return new Date(date.getFullYear(),date.getMonth() + monthOffset,1 + dateOffset);
}

/**
 * Returns the number of days in the month of the given date
 * @param {Date} date 
 * @returns {number}
 */
export function daysInMonth(date) {
    return getFirstOfMonth(date, 1, -1).getDate();
}

/**
 * Returns the # of days between the two dates, ignoring time of day
 * @param {Date} dateA
 * @param {Date} dateB
 * @returns {number}
 */
export function dayDifference(dateA, dateB) {
    const timeDiff = getDayStart(dateA).getTime() - getDayStart(dateB).getTime();
    const days = timeDiff / MILLISECONDS_IN_DAY;
    return days;
}

/**
 * Return a string with date in given format
 * @param {Date} date 
 * @param {string} format 
 * @returns {string}
 */
export function toFormat(date, format = "YYYY-mm-dd") {
    const full_year = date.getFullYear() + ""
    const month = date.getMonth()
    const day_date = date.getDate()
    const day = DAYS[date.getDay()]


    format = format.replace(/YYYY/g, full_year)
    format = format.replace(/YY/g,(full_year + "").substring(2,4))
    format = format.replace(/MMMM/g,MONTHS[month])
    format = format.replace(/MMM/g,MONTHS[month].substring(0,3))
    format = format.replace(/mm/g, StringUtils.fillString(month+"",2,"0"))
    format = format.replace(/dd/g, StringUtils.fillString(day_date+"",2,"0"))
    format = format.replace(/d/g,day_date + "")
    format = format.replace(/DDDD/g,day)
    format = format.replace(/DDD/g,(day+"").substring(0,3))
    return format
}

/**
 * Return date as reference from today:
 *  - If date is yesterday, today or tomorrow returns "Yesterday", "Today" and "Tomorrow" respectively
 *  - If date is in the next 7 days it returns the day of the week(e.g. "Monday")
 *  - Otherwise, returns date formatted as genericFormat  
 * @param {Date} date 
 * @param {string} genericFormat 
 * @returns {string}
 */
export function todayReference(date, genericFormat = "DDD, MMMM dd") {
    const dayDiff = dayDifference(new Date(),date);
    if(dayDiff == -1) return "Yesterday";
    if(dayDiff == 0) return "Today";
    if(dayDiff == 1) return "Tomorrow";
    if(dayDiff < 7 && dayDiff > 0) return DAYS[date.getDay()];

    return toFormat(date,genericFormat);
}