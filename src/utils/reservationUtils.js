export const isReservationActiveAtTime = (reservation, targetTime) => {
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    
    return targetTime >= startTime && targetTime < endTime;
};

export const getReservationsAtTime = (reservations, timestamp) => {
    const targetTime = new Date(timestamp);
    return reservations.filter(reservation => isReservationActiveAtTime(reservation, targetTime));
};

const isReservationOnDay = (reservation, targetDate) => {
    const startTime = new Date(reservation.startTime);
    const target = new Date(targetDate);
    
    return startTime.getFullYear() === target.getFullYear() &&
           startTime.getMonth() === target.getMonth() &&
           startTime.getDate() === target.getDate();
};

export const getReservationsForDay = (reservations, date) => {
    return reservations.filter(reservation => isReservationOnDay(reservation, date));
};

export const getReservationsForTable = (reservations, tableNum) => {
    return reservations.filter(reservation => reservation.tableNum === tableNum);
};

export const getWalkInsForTable = (walkIns, tableNum) => {
    return walkIns.filter(walkIn => walkIn.tableNum === tableNum);
};

