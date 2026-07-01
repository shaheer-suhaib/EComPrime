import mongoose from "mongoose";
import dns from "node:dns";

// The mongodb+srv:// scheme needs an SRV DNS lookup, which Node's c-ares
// resolver runs against the OS-configured nameserver. If that server refuses
// the query (querySrv ECONNREFUSED), force a public DNS server instead.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectToDatabase() {
    await mongoose.connect(process.env.MONGO_URI!);
  
  // Simulate a successful connection
  console.log("Database connected successfully.");
}