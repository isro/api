const extractMYD = (currentDate, formatOnly=true) => {
    try {
        if (!currentDate || typeof currentDate !== 'string') {
            throw new Error('Invalid date format');
        }
        const [day, month, year] = currentDate.split('-');
        if (!day || !month || !year) {
            throw new Error('Invalid date format');
        }
        if(formatOnly){
            return `${year}-${month}-${day}`
        }
        const parsedDate = new Date(`${year}-${month}-${day}`);
        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date format');
        }
        return [
            parsedDate.getFullYear(),
            (parsedDate.getMonth() + 1).toString().padStart(2, '0'),
            parsedDate.getDate().toString().padStart(2, '0')
        ];
    } catch (e) {
        throw new Error('Invalid date format');
    }
}

const extractFormat = (format, currentDate) => {
    try{
    const [year, month, day] = extractMYD(currentDate, false);
    switch (format) {
        case 'YYYY/MM/DD':
            return `${year}/${month}/${day}`;
        case 'YYYY/DD/MM':
            return `${year}/${day}/${month}`;
        case 'YYYY.MM.DD':
            return `${year}.${month}.${day}`;
        case 'YYYY.DD.MM':
            return `${year}.${day}.${month}`;
        case 'YYYY_MM_DD':
            return `${year}_${month}_${day}`;
        case 'YYYY_DD_MM':
            return `${year}_${day}_${month}`;
        case 'YYYYMMDD':
            return `${year}${month}${day}`;
        case 'YYYYDDMM':
            return `${year}${day}${month}`;
        case 'MM/YYYY/DD':
            return `${month}/${year}/${day}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'MM.DD.YYYY':
            return `${month}.${day}.${year}`;
        case 'MM.DD.YY':
            return `${month}.${day}.${year.toString().slice(-2)}`;
        case 'MM_DD_YYYY':
            return `${month}_${day}_${year}`;
        case 'MM_DD_YY':
            return `${month}_${day}_${year.toString().slice(-2)}`;
        case 'MMDDYYYY':
            return `${month}${day}${year}`;
        case 'MMDDYY':
            return `${month}${day}${year.toString().slice(-2)}`;
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'DD.MM.YYYY':
            return `${day}.${month}.${year}`;
        case 'DD.MM.YY':
            return `${day}.${month}.${year.toString().slice(-2)}`;
        case 'DDMMYYYY':
            return `${day}${month}${year}`;
        case 'DDMMYY':
            return `${day}${month}${year.toString().slice(-2)}`;
        case 'DD-MM-YYYY':
            return `${day}-${month}-${year}`;
        case 'DD-MM-YY':
            return `${day}-${month}-${year.toString().slice(-2)}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'YYYY-MM':
            return `${year}-${month}`;
        case 'YYYYMM':
            return `${year}${month}`;
        case 'MM-DD':
            return `${month}-${day}`;
        case 'MMDD':
            return `${month}${day}`;
        case 'MM-YY':
            return `${month}-${year.toString().slice(-2)}`;
        case 'MMYY':
            return `${month}${year.toString().slice(-2)}`;
        case 'DD-MM':
            return `${day}-${month}`;
        case 'DDMM':
            return `${day}${month}`;
        case 'DD-YY':
            return `${day}-${year.toString().slice(-2)}`;
        case 'DDYY':
            return `${day}${year.toString().slice(-2)}`;
        default:
            // Default to pre-defined format
            return currentDate;
    }
} catch (error) {
        // Return the original date if an error occurs
        return error
    }
}

const formatToDateFormat = (format, records) => {
    return records.map(record => {
        record.launch_date = extractFormat(format, record.launch_date);
        return record;
    });
}

const formatDate = (records) => {
    return records.map(record => {
        record.launch_date = extractMYD(record.launch_date);
        return record;
    });
}

module.exports = {
    formatDate,
    formatToDateFormat
}
