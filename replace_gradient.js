const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../../../../../../e:/Innonsh/PrePrimary_app-main/src');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('expo-linear-gradient')) {
                content = content.replace(/import\s+\{\s*LinearGradient\s*\}\s+from\s+['"]expo-linear-gradient['"];?/g, "import LinearGradient from 'react-native-linear-gradient';");
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

walkDir(path.resolve('e:/Innonsh/PrePrimary_app-main/src'));
