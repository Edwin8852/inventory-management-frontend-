const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('d:/X town/Inventory Billing System/frontend/src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace $ followed by number
  let newContent = content.replace(/\$([0-9]+)/g, '₹$1');
  
  // Replace \`$$ with \`₹$
  newContent = newContent.replace(/`\$\$/g, '`₹$');
  
  // Replace >$< with >₹<
  newContent = newContent.replace(/>\$(.*?)</g, '>₹$1<');
  
  // Replace '$' with '₹'
  newContent = newContent.replace(/'\$'/g, "'₹'");
  newContent = newContent.replace(/"\$"/g, '"₹"');
  
  // Also look for specific matches like `$ ` or ` $ ` inside JSX text
  // Let's just be careful and only apply the above which covers 99% of UI currency hardcodes.

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Total files updated: ${changed}`);
