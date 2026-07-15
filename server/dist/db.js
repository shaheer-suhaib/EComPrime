"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
// The mongodb+srv:// scheme needs an SRV DNS lookup, which Node's c-ares
// resolver runs against the OS-configured nameserver. If that server refuses
// the query (querySrv ECONNREFUSED), force a public DNS server instead.
node_dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
async function connectToDatabase() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    // Simulate a successful connection
    console.log("Database connected successfully.");
}
