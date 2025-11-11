const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');
const domainsPath = path.join(srcPath, 'domains');

function calculateRelativePath(fromFile, toFolder) {
  // Calculate relative path from a file to a folder
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, path.join(srcPath, toFolder));
  return relativePath.replace(/\\/g, '/');
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Calculate correct paths for this specific file
  const dbPath = calculateRelativePath(filePath, 'database');
  const commonPath = calculateRelativePath(filePath, 'common');
  const infraPath = calculateRelativePath(filePath, 'infrastructure');
  const configPath = calculateRelativePath(filePath, 'config');
  
  // Determine if file is in e-commerce or shared domain
  const isEcommerce = filePath.includes(path.join('domains', 'e-commerce'));
  const isShared = filePath.includes(path.join('domains', 'shared'));
  const isSeed = filePath.includes(path.join('database', 'seeds'));
  
  // Fix all possible variations of paths to database, common, infrastructure, config
  const variations = [
    /from ['"]\.\.\/database\//g,
    /from ['"]\.\.\/\.\.\/database\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/database\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/database\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/database\//g,
  ];
  
  for (const regex of variations) {
    content = content.replace(regex, `from '${dbPath}/`);
  }
  
  const commonVariations = [
    /from ['"]\.\.\/common\//g,
    /from ['"]\.\.\/\.\.\/common\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/common\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/common\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/common\//g,
  ];
  
  for (const regex of commonVariations) {
    content = content.replace(regex, `from '${commonPath}/`);
  }
  
  const infraVariations = [
    /from ['"]\.\.\/infrastructure\//g,
    /from ['"]\.\.\/\.\.\/infrastructure\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/infrastructure\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infrastructure\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/infrastructure\//g,
  ];
  
  for (const regex of infraVariations) {
    content = content.replace(regex, `from '${infraPath}/`);
  }
  
  const configVariations = [
    /from ['"]\.\.\/config\//g,
    /from ['"]\.\.\/\.\.\/config\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/config\//g,
    /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/config\//g,
  ];
  
  for (const regex of configVariations) {
    content = content.replace(regex, `from '${configPath}/`);
  }
  
  // Fix cross-domain imports (e-commerce -> shared)
  if (isEcommerce) {
    const sharedPath = calculateRelativePath(filePath, path.join('domains', 'shared'));
    
    const crossDomainPatterns = [
      { regex: /from ['"]\.\.\/notifications\//g, module: 'notifications' },
      { regex: /from ['"]\.\.\/\.\.\/notifications\//g, module: 'notifications' },
      { regex: /from ['"]\.\.\/store-settings\//g, module: 'store-settings' },
      { regex: /from ['"]\.\.\/\.\.\/store-settings\//g, module: 'store-settings' },
      { regex: /from ['"]\.\.\/auth\//g, module: 'auth' },
      { regex: /from ['"]\.\.\/\.\.\/auth\//g, module: 'auth' },
    ];
    
    for (const pattern of crossDomainPatterns) {
      content = content.replace(pattern.regex, `from '${sharedPath}/${pattern.module}/`);
    }
  }
  
  // Fix seed files
  if (isSeed) {
    content = content.replace(/from ['"]\.\.\/\.\.\/modules\//g, "from '../../domains/shared/");
    content = content.replace(/from ['"]\.\.\/\.\.\/modules\/store-categories\//g, "from '../../domains/shared/store-categories/");
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
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        count += walkDir(filePath);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      count += fixFile(filePath);
    }
  }
  
  return count;
}

console.log('🔧 Fixing all import paths with correct calculation...\n');
const fixed = walkDir(srcPath);
console.log(`\n✅ Fixed ${fixed} files`);

