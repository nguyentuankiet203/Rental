import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";

export class UpdateContractDto {
    @IsOptional()
    @IsDateString()
    start_date?: Date;

    @IsOptional()
    @IsDateString()
    end_date?: Date;

    @IsOptional()
    @IsNumber()
    rent_price?: number;

    @IsOptional()
    @IsEnum(["ACTIVE", "ENDED", "EXPIRED"])
    status?: string;
}
