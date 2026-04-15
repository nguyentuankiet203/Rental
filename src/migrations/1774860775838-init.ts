import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774860775838 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query
    //  (`INSERT INTO property (name) VALUES ('Bình Tân, HCM');`);
     
     
     (`
        
        CREATE TYPE user_role AS ENUM ('ADMIN', 'LANDLORD', 'TENANT');

        CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

        CREATE TYPE contract_status AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

        CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE');

        CREATE TYPE payment_method AS ENUM ('MOMO', 'BANK', 'CASH');

        CREATE TYPE notification_type AS ENUM ('REMINDER', 'SYSTEM', 'PAYMENT');
        
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name VARCHAR(255),
            phone VARCHAR(20),
            role user_role NOT NULL DEFAULT 'TENANT',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE properties (
            id SERIAL PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_owner
                FOREIGN KEY(owner_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );

        CREATE TABLE rooms (
            id SERIAL PRIMARY KEY,
            property_id INT NOT NULL,
            name VARCHAR(100),
            price NUMERIC(12,2) NOT NULL,
            status room_status DEFAULT 'AVAILABLE',

            CONSTRAINT fk_property
                FOREIGN KEY(property_id)
                REFERENCES properties(id)
                ON DELETE CASCADE
        );

        CREATE TABLE contracts (
            id SERIAL PRIMARY KEY,
            room_id INT NOT NULL,
            tenant_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            rent_price NUMERIC(12,2) NOT NULL,
            deposit NUMERIC(12,2),
            status contract_status DEFAULT 'ACTIVE',

            CONSTRAINT fk_room
                FOREIGN KEY(room_id)
                REFERENCES rooms(id)
                ON DELETE CASCADE,

            CONSTRAINT fk_tenant
                FOREIGN KEY(tenant_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );

        CREATE TABLE payments (
            id SERIAL PRIMARY KEY,
            contract_id INT NOT NULL,
            amount NUMERIC(12,2) NOT NULL,
            due_date DATE NOT NULL,
            paid_date DATE,
            status payment_status DEFAULT 'PENDING',
            method payment_method,

            CONSTRAINT fk_contract
                FOREIGN KEY(contract_id)
                REFERENCES contracts(id)
                ON DELETE CASCADE
        );

        CREATE TABLE notifications (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            type notification_type,
            message TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_user
                FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );

        CREATE TABLE ai_logs (
            id SERIAL PRIMARY KEY,
            user_id INT,
            action VARCHAR(100),
            input TEXT,
            output TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_ai_user
                FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE SET NULL
        );

        CREATE INDEX idx_users_email ON users(email);

        CREATE INDEX idx_properties_owner ON properties(owner_id);

        CREATE INDEX idx_rooms_property ON rooms(property_id);

        CREATE INDEX idx_contracts_room ON contracts(room_id);
        CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);

        CREATE INDEX idx_payments_contract ON payments(contract_id);
        CREATE INDEX idx_payments_status ON payments(status);

        CREATE INDEX idx_notifications_user ON notifications(user_id);

        CREATE UNIQUE INDEX unique_active_contract_per_room
        ON contracts(room_id)
        WHERE status = 'ACTIVE';

        CREATE OR REPLACE FUNCTION update_room_status()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.status = 'ACTIVE' THEN
                    UPDATE rooms
                    SET status = 'OCCUPIED'
                    WHERE id = NEW.room_id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trigger_update_room_status
            AFTER INSERT ON contracts
            FOR EACH ROW
            EXECUTE FUNCTION update_room_status();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS contracts;
      DROP TABLE IF EXISTS rooms;
      DROP TABLE IF EXISTS properties;
      DROP TABLE IF EXISTS users;
    `);
  }
}