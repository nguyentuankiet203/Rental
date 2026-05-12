export class ImportRoomDto {
  property_id!: number;
  rooms!: {
    room_number: number;
    price_per_month: number;
  }[];
}