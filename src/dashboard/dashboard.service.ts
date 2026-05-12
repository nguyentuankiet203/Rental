import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}

    async getDashboard(landlordId: number, propertyId?: number) {
        let query = `
            SELECT
                COUNT(r.id) as total_rooms,

                COUNT(*) FILTER (WHERE c.id IS NULL) as available_rooms,

                COUNT(*) FILTER (WHERE c.status = 'ACTIVE') as occupied_rooms,

                COUNT(c.id) as active_contracts,

                COALESCE(SUM(c.rent_price) FILTER (WHERE c.status = 'ACTIVE'), 0) as revenue

            FROM rooms r
            JOIN properties p ON p.id = r.property_id

            LEFT JOIN contracts c 
                ON c.room_id = r.id 
                AND c.status = 'ACTIVE'
            `;

        let params: any[] = [];

        if (propertyId) {
            query += ` WHERE r.property_id = $1`;
            params = [propertyId];
        } else {
            query += ` WHERE p.owner_id = $1`;
            params = [landlordId];
        }

        const result = await this.dataSource.query(query, params);

        return result[0];
    }

    async getRevenueChart(
        landlordId: number,
        propertyId?: number,
        year: number = new Date().getFullYear()
        ) {
        let condition = "";
        let params: any[] = [year];

        if (propertyId) {
            condition = "r.property_id = $2";
            params.push(propertyId);
        } else {
            condition = `p.owner_id = $1`;
            params.push(landlordId);
        }

        const result = await this.dataSource.query(`
            SELECT 
            TO_CHAR(month_series, 'YYYY-MM') as month,
            COALESCE(SUM(c.rent_price), 0) as revenue

            FROM generate_series(
            DATE_TRUNC('year', TO_DATE($1::text, 'YYYY')),
            DATE_TRUNC('year', TO_DATE($1::text, 'YYYY')) + interval '11 months',
            interval '1 month'
            ) as month_series

            LEFT JOIN contracts c
            ON c.status = 'ACTIVE'
            AND DATE_TRUNC('month', c.start_date) <= month_series
            AND DATE_TRUNC('month', c.end_date) >= month_series

            LEFT JOIN rooms r ON r.id = c.room_id
            LEFT JOIN properties p ON p.id = r.property_id

            WHERE ${condition}

            GROUP BY month_series
            ORDER BY month_series
        `, params);

        return result.map((i) => ({
            month: i.month,
            revenue: Number(i.revenue),
        }));
    }

    async getRevenueMulti(
        landlordId: number,
        propertyIds: number[] = [],
        year: number = new Date().getFullYear(),
        ) {
        const properties = propertyIds.length
            ? propertyIds
            : await this.dataSource.query(
                `SELECT id FROM properties WHERE owner_id = $1`,
                [landlordId],
            ).then((res) => res.map((p) => p.id));

        if (!properties.length) return [];

        const selectFields = properties
            .map(
            (id) => `
            COALESCE(SUM(
                CASE WHEN r.property_id = ${id} THEN c.rent_price ELSE 0 END
            ),0) as property_${id}
            `,
            )
            .join(',');

        const result = await this.dataSource.query(
            `
            SELECT 
            TO_CHAR(month_series, 'YYYY-MM') as month,
            ${selectFields}

            FROM generate_series(
            DATE_TRUNC('year', TO_DATE($1::text, 'YYYY')),
            DATE_TRUNC('year', TO_DATE($1::text, 'YYYY')) + interval '11 months',
            interval '1 month'
            ) as month_series

            LEFT JOIN contracts c
            ON c.status = 'ACTIVE'
            AND DATE_TRUNC('month', c.start_date) <= month_series
            AND DATE_TRUNC('month', c.end_date) >= month_series

            LEFT JOIN rooms r ON r.id = c.room_id
            LEFT JOIN properties p ON p.id = r.property_id

            WHERE p.owner_id = $2

            GROUP BY month_series
            ORDER BY month_series
            `,
            [year, landlordId],
        );

        return result.map((row) => {
            const formatted: any = { month: row.month };

            properties.forEach((id) => {
            formatted[`property_${id}`] = Number(row[`property_${id}`] || 0);
            });

            return formatted;
        });
        }
}