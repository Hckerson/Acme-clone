'use server'
import { Pool } from "pg";
import { users, invoices } from "./placeholder-data";
import bcrypt from 'bcryptjs'

const pool = new Pool({
  user : 'postgres',
  host : 'localhost',
  database : 'acme',
  password : '264813795',
  port : 5432
})

export interface Mers{
  id: string,
  name: string,
  email: string, 
  image_url : string
}

export async function query(){
  try {
    const response = await pool.query('SELECT * FROM customers')
    await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return pool.query(`
          INSERT INTO users (id, name, email, password)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO NOTHING;
        `, [user.id, user.name, user.email, hashedPassword]);
      }),
    );
    console.log(response.rows)
    const result: Mers[] = response.rows.map((customer)=>{
      return{
        id : customer.id,
        name : customer.name,
        email : customer.email,
        image_url : customer.image_url
      }
    })
    return result
  } catch (error) {
    console.error('Error executing query', error)
    return []
  }
}


export async function seedUsers() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  await Promise.all(
    invoices.map(
      (invoice) => pool.query(`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `, [invoice.customer_id, invoice.amount, invoice.status, invoice.date]),
    ),
  );

}