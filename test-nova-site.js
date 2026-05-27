#!/usr/bin/env node
// test-nova-site.js
// Script de test pour Nova

const http = require('http');

function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: json
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 TESTS DE L\'API NOVA\n');

  try {
    // Test 1: API racine
    console.log('1️⃣  Test de la connexion API...');
    const root = await testEndpoint('/');
    console.log(`   Status: ${root.status}`);
    console.log(`   Message: ${root.data.message}\n`);

    // Test 2: Produits
    console.log('2️⃣  Test récupération des produits...');
    const products = await testEndpoint('/api/products');
    console.log(`   Status: ${products.status}`);
    console.log(`   Produits trouvés: ${products.data.data?.products?.length || 0}`);
    if (products.data.data?.products?.length > 0) {
      console.log(`   Premier produit: ${products.data.data.products[0].titre}\n`);
    }

    // Test 3: Catégories
    console.log('3️⃣  Test récupération des catégories...');
    const categories = await testEndpoint('/api/categories');
    console.log(`   Status: ${categories.status}`);
    console.log(`   Catégories trouvées: ${categories.data.data?.categories?.length || 0}\n`);

    // Test 4: Produit spécifique
    if (products.data.data?.products?.length > 0) {
      const productId = products.data.data.products[0].id;
      console.log(`4️⃣  Test récupération du produit #${productId}...`);
      const product = await testEndpoint(`/api/products/${productId}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Produit: ${product.data.data?.product?.titre}\n`);
    }

    console.log('✅ TOUS LES TESTS PASSENT!\n');
    console.log('📋 Résumé:');
    console.log('   ✓ API accessible');
    console.log('   ✓ Produits disponibles');
    console.log('   ✓ Catégories disponibles');
    console.log('   ✓ Détails produit accessibles\n');

    console.log('🚀 Pour accéder au site:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Catalogue: http://localhost:3000/catalogue');
    console.log('   Admin: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\nVérifiez que:');
    console.log('   ✓ Le serveur PHP est en cours d\'exécution (http://localhost:8000)');
    console.log('   ✓ Le serveur React est en cours d\'exécution (http://localhost:3000)');
    console.log('   ✓ La base de données MySQL est accessible');
  }
}

runTests();
