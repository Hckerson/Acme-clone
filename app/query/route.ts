import { neon } from '@neondatabase/serverless';

const sql = neon(`${process.env.DATABASE_URL}`, {
  fetchOptions: {
    timeout: 10000, // Timeout in milliseconds (10 seconds)
  },
});
import "dotenv/config"

async function listInvoices() {
	const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

	return data;
}

export async function GET() {
  try {
  	return Response.json(await listInvoices());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}
