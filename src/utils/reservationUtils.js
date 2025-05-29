const isReservationActiveAtTime = (reservation, targetTime) => {
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    
    return targetTime >= startTime && targetTime <= endTime;
};

export const getReservationsAtTime = (reservations, timestamp) => {
    const targetTime = new Date(timestamp);
    return reservations.filter(reservation => isReservationActiveAtTime(reservation, targetTime));
};