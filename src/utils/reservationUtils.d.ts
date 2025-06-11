import { Reservation } from '../models/Reservation';
import { WalkIn } from '../models/WalkIn';

export function getReservationsForTable(reservations: Reservation[], tableNum: number): Reservation[];
export function getWalkInsForTable(walkIns: WalkIn[], tableNum: number): WalkIn[]; 
export function isReservationActiveAtTime(reservation: Reservation | WalkIn, targetTime: Date): boolean;

