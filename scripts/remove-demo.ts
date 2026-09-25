/** Deletes every demo/sample listing and demo agent. Real data is never touched. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const props = await prisma.property.deleteMany({ where: { isDemo: true } });
  const agents = await prisma.agent.deleteMany({ where: { isDemo: true, properties: { none: {} } } });
  console.log(`Removed ${props.count} demo listings and ${agents.count} demo agents.`);
}

main().finally(() => prisma.$disconnect());
