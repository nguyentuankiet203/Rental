export class CreateUtilityDto {
  room_id!: number;
  month!: number;
  year!: number;

  electric_old!: number;
  electric_new!: number;

  water_old!: number;
  water_new!: number;

  electric_price!: number;
  water_price!: number;
}