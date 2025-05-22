const ISODateNoSplitThai = (date) => {
    const monthNameList = ["ม.ค. ", "ก.พ. ", "มี.ค. ", "เม.ย. ", "พ.ค. ", "มิ.ย. ", "ก.ค. ", "ส.ค. ", "ก.ย. ", "ต.ค. ", "พ.ย. ", "ธ.ค. "];
    const currentDate = new Date(date);

    const monthIndex = currentDate.month();
    const formattedDate = `${currentDate.date()} ${monthNameList[monthIndex]}${currentDate.year()}`;

    return formattedDate;
}

const ckAmOrPm = (date) => {
    const currentDate = new Date(date);
    const amOrPm = currentDate.format('a');

    if (amOrPm == 'pm') {
        return 'PM'
      } else {
        return 'AM'
      }
}

const ISOdate = (date ,newFormat) => {
    let newDate = date.split(".")
    if(newDate[2]){
        newDate = newDate[1]+"."+newDate[0]+"."+newDate[2]
    }else{
        newDate = date
    }
    let dates = new Date(newDate);
    const formattedDate = dates.format(newFormat);
    return formattedDate;
}

const ISODateNoSplit = (date ,newFormat) => {

    if(!date || !newFormat) return false
    let dates = new Date(date).format(newFormat);
    return dates;
}

const ISODateTimeNoSplit = (date ,newFormat) => {

    if(!date || !newFormat) return false
    let dates = new Date(date,newFormat);
    return dates;
}

const CkISOdate = (date) => {
    
    let newDate = date.split(".")
    newDate = newDate[2]+"-"+newDate[1]+"-"+newDate[0]
    
    if(newDate[2]){
        newDate = newDate[1]+"."+newDate[0]+"."+newDate[2]
    }else{
        newDate = date
    }

    const targetDate = new Date(newDate);

    const currentDate = new Date();

    if (
    currentDate.getFullYear() == targetDate.getFullYear() &&
    currentDate.getMonth() == targetDate.getMonth() &&
    currentDate.getDate() == targetDate.getDate()
    ) {
        return true
    } else {
        return false
    }
}


module.exports = { 
    ISODateNoSplitThai, 
    ckAmOrPm, 
    ISOdate,
    ISODateNoSplit,
    ISODateTimeNoSplit, 
    CkISOdate
};