import InvoiceForm from "./components/InvoiceForm"
import { db } from "@/app/config/db";
import { customers, items } from "@/app/config/schema";

export default async function InvoicePage() {
  const customersList = await db.select().from(customers);


  return (
    <main className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Create Invoice</h1>
      <InvoiceForm customers={customersList} />
    </main>
  );
}

