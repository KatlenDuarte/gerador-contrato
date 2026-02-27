// app/scripts/gerarToken.js
import 'dotenv/config';
import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.error("❌ JWT_SECRET não definido no .env");
  process.exit(1);
}

// 🔧 IDENTIFIQUE O CLIENTE
const cliente = "CLIENTE-001"; // nome, pedido, email, etc

const token = jwt.sign(
  { cliente },
  SECRET,
  { expiresIn: "7d" } // validade do acesso
);

console.log("\n✅ TOKEN GERADO:\n");
console.log(token);
console.log("\n🔗 LINK DE ACESSO:\n");
console.log(`https://SEU-DOMINIO.vercel.app/?token=${token}\n`);