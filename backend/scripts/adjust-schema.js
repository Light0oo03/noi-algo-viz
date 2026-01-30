const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let content = fs.readFileSync(schemaPath, 'utf8');
  
  // 检查是否已经是 postgresql
  if (content.includes('provider = "postgresql"')) {
    console.log('Schema is already configured for PostgreSQL.');
    process.exit(0);
  }

  console.log('Switching Prisma provider from sqlite to postgresql...');
  
  // 替换 provider
  content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
  
  // 写入文件
  fs.writeFileSync(schemaPath, content);
  console.log('Schema updated successfully.');
} catch (e) {
  console.error('Failed to update schema:', e);
  process.exit(1);
}
