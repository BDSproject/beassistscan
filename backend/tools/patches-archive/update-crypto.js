const fs = require('fs');

const servicePath = 'src/services/ebay.service.js';
let serviceCode = fs.readFileSync(servicePath, 'utf8');

const regexToReplace = /const signatureInput = `sig1=\("x-ebay-signature-key" "@method" "@path" "@authority"\);created=\$\{created\}`;\s*const base = \[\s*`"x-ebay-signature-key": \$\{signatureKey\}`,\s*`"@method": \$\{method\.toUpperCase\(\)\}`,\s*`"@path": \$\{pathWithQuery\}`,\s*`"@authority": \$\{host\}`,\s*`"@signature-params": \("x-ebay-signature-key" "@method" "@path" "@authority"\);created=\$\{created\}`\s*\]\.join\('\\n'\);\s*const signer = crypto\.createSign\('RSA-SHA256'\);\s*signer\.update\(base\);\s*signer\.end\(\);\s*const signatureBase64 = signer\.sign\(privateKeyPem, 'base64'\);/gm;

const newCryptoContent = `// === NOUVELLE IMPLEMENTATION SELON RFC9421 pour EBAY ===

      // 1. Définir le dictionnaire et les paramètres du Content-Digest (ici absent car GET/pas de body selon doc "When no HTTP payload is included, this header    not required.")
      
                              `si                              `si               utho                              `si                     la signature-base EXACTEMENT selon la norme (pas de guillemets autour des clés, ordre strict)
      const base = [
        \`"x-ebay-signature-key": \${signatureKey}\`,
        \`"@method": \${method.toUpperCase()}\`,
        \`"@path": \${pathWithQuery}\`,
        \`"@authority": \${host}\`,
        \`"@signature-params": \${signatureInput.replace('sig1=', '')}\`
      ].join('\\n');

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(base);
      const signatureBase64 = signer.sign(privateKeyPem, 'base64');`;

serviceCode = serviceCode.replace(regexToReplace, newCryptoContent);
fs.writeFileSync(servicePath, serviceCode);
console.log('patched crypto!');
