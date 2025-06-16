const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Building Admin Interface...');

try {
  // 1. Build l'interface admin
  console.log('📦 Installing admin dependencies...');
  execSync('npm install', { cwd: 'admin', stdio: 'inherit' });
  
  console.log('🏗️ Building admin app...');
  execSync('npm run build', { cwd: 'admin', stdio: 'inherit' });
  
  // 2. Copier le build admin vers web-build
  const adminBuildPath = path.join(__dirname, 'admin', 'build');
  const webBuildAdminPath = path.join(__dirname, 'web-build', 'admin');
  
  if (fs.existsSync(adminBuildPath)) {
    // Supprimer l'ancien dossier admin s'il existe
    if (fs.existsSync(webBuildAdminPath)) {
      fs.rmSync(webBuildAdminPath, { recursive: true, force: true });
    }
    
    // Copier le nouveau build
    fs.cpSync(adminBuildPath, webBuildAdminPath, { recursive: true });
    console.log('✅ Admin build copied to web-build/admin');
  } else {
    throw new Error('Admin build directory not found');
  }
  
  console.log('🎉 Admin interface built successfully!');
  console.log('📍 Admin will be accessible at: /admin/login');
  
} catch (error) {
  console.error('❌ Error building admin interface:', error.message);
  process.exit(1);
}
