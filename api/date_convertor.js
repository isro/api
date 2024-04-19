/**
 * Function to extract year, month, and day from a date string in the format "DD-MM-YYYY".
 * @param {string} currentDate - The date string in the format "DD-MM-YYYY".
 * @returns {string} A string representing the date in the format "YYYY-MM-DD".
 * @throws {Error} Throws an error if the date format is invalid.
 */
const extractMYD = (currentDate) => {
    try {
        // Check if the date string is provided and is of type string
        if (!currentDate || typeof currentDate !== 'string') {
            throw new Error('Invalid date format');
        }
        
        // Split the date string into day, month, and year components
        const [day, month, year] = currentDate.split('-');
        
        // Check if all components are present
        if (!day || !month || !year) {
            throw new Error('Invalid date format');
        }
        
        // Return the formatted date string in the format "YYYY-MM-DD"
        return `${year}-${month}-${day}`;
    } catch (e) {
        // If any error occurs, throw an "Invalid date format" error
        throw new Error('Invalid date format');
    }
}

/**
 * Function to format the launch_date property of each record in an array of records.
 * @param {Array} records - An array of records, each containing a launch_date property.
 * @returns {Array} An array of records with the launch_date property formatted as "YYYY-MM-DD".
 */
const formatDate = (records) => {
    return records.map(record => {
        // Format the launch_date property of each record using the extractMYD function
        record.launch_date = extractMYD(record.launch_date);
        return record;
    });
}

module.exports = formatDate;
