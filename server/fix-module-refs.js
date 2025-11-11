const fs = require('fs');
const path = require('path');

const domainsPath = path.join(__dirname, 'src', 'domains');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix renamed modules
  content = content.replace(/from ['"]\.\.\/category\//g, "from '../categories/");
  content = content.replace(/from ['"]\.\.\/\.\.\/category\//g, "from '../../categories/");
  content = content.replace(/from ['"]\.\.\/account\//g, "from '../accounts/");
  content = content.replace(/from ['"]\.\.\/\.\.\/account\//g, "from '../../accounts/");
  
  // Fix cross-domain references within e-commerce
  const isEcommerce = filePath.includes(path.join('domains', 'e-commerce'));
  const isShared = filePath.includes(path.join('domains', 'shared'));
  
  if (isEcommerce) {
    // From e-commerce to shared (admin guard)
    content = content.replace(/from ['"]\.\.\/\.\.\/admin\//g, "from '../../../shared/admin/");
  }
  
  if (isShared) {
    // Fix payment module reference in courier
    if (filePath.includes('courier')) {
      content = content.replace(/from ['"]\.\.\/payment\//g, "from '../../e-commerce/payment/");
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return 1;
  }
  return 0;
}

function walkDir(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      count += walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      count += fixFile(filePath);
    }
  }
  
  return count;
}

console.log('🔧 Fixing module references...\n');
const fixed = walkDir(domainsPath);
console.log(`\n✅ Fixed ${fixed} files`);

