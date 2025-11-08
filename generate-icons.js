#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple SVG icon for the extension (a form with a checkmark)
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0066CC"/>
  
  <!-- Document/Form icon -->
  <rect x="${size * 0.2}" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.7}" 
        fill="white" rx="${size * 0.05}"/>
  
  <!-- Lines representing form fields -->
  <rect x="${size * 0.3}" y="${size * 0.28}" width="${size * 0.4}" height="${size * 0.05}" 
        fill="#0066CC" rx="${size * 0.025}"/>
  <rect x="${size * 0.3}" y="${size * 0.42}" width="${size * 0.4}" height="${size * 0.05}" 
        fill="#0066CC" rx="${size * 0.025}"/>
  <rect x="${size * 0.3}" y="${size * 0.56}" width="${size * 0.4}" height="${size * 0.05}" 
        fill="#0066CC" rx="${size * 0.025}"/>
  
  <!-- Checkmark -->
  <circle cx="${size * 0.75}" cy="${size * 0.75}" r="${size * 0.15}" fill="#4CAF50"/>
  <path d="M ${size * 0.68} ${size * 0.75} L ${size * 0.73} ${size * 0.80} L ${size * 0.82} ${size * 0.68}" 
        stroke="white" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;https://googleads.g.doubleclick.net/dbm/clk?sa=L&ai=CJAT83PwMaaiZKO-NhcIPst7IsQOeianlgAHA4Yuc7xSP5PD36UEQASCBy-MdYO383YWsG6AB_fLI8ynIAQapAhtPcYDVU7M-qAMByAObBKoEoQJP0HTdtDoiXQq6Mx7jzXLWQc1KhiPvojUmMFcrtYN-SpxgYYDZQMrAOUDx4CqVkxBPEDnZZOyXq9mVQ4_nUFx0b8uhhvEABP9XjFQF9rV_b43nAIbHqE7LICvyUQnnntoNlEfDFoVo6VxtYSFKfKrv6-sie9VJrdViu5zvUWlkBKtbCEXiLVp80GJLGh5kOPYMO6cLggOB3QaIDcALb7WydOFAnt0d0rcxEsLh7AJhK_wPoUgxj5j-0nBuHiTpnZ8vIHJxOyw_cynOY3JXtyuRD_Mpe_Tk1bXmY3K5ErpMnjxjoPhNBtLOZElxYJdKBS3JP2rWtbJL-3-SLi_U-BSPukeDVBA1xZA8GERJxA7iqKx8KehHR0LCxNaa-E8pWx2awAS8-ejYqQXgBAOIBeyfuIdVkAYBoAY3gAf9qpnTBKgH4tixAqgHpr4bqAfMzrECqAfz0RuoB5bYG6gHqpuxAqgHjs4bqAeT2BuoB_DgG6gH7paxAqgH_p6xAqgHr76xAqgH1ckbqAfZtrECqAeVxbECqAf_nrECqAffn7ECqAf4wrECqAf7wrEC2AcB0ggyCIDhgBAQARidATIIqoKAgICAgAg6DoDAA4CAhICAlK7gA6gHSL39wTpYp6Dz6qbekAOxCXC-R9lyUPDtgAoDmAsByAsBogwDkAEBqg0CUFTiDRMImJ_06qbekAMV70ZBAh0yLzI26g0TCPHx9uqm3pADFe9GQQIdMi8yNogO____________AbAT1On8HtgTCogUAdgUAdAVAZgWAcoWAgoA-BYBgBcBshcOGAIqCjU1MzYxODIyNDToFwSqGBcJAAAAAMD5_0ASCjU1MzYxODIyNDQYAbIYCRIC604YNyIBANAZAdgZAQ&num=1&cid=CAQSjQEAwksa0fQntAK3ee4XuxHMocOOqlOoV9IhVDB4hHZDlWbagYc5pGtSe8V-rgjGpGWOTF5S4CrIAWi5pIJzgMEjTOOZjVStU4d-uvRzno8hBI6l7ojJQyXL5Hw1SV5lHztS-U7SeyxBl9S_vy-cbW5WpaoqMdsGXVnQqcvF53vz4-erHOmfHf4t1l9tsJAYAQ&sig=AOD64_3cALgeARLVNjnficyzmYmoS1MrzA&client=ca-pub-4939634212290203&dbm_c=AKAmf-B0EJdGzoyQfWNvgBKzj2DGNz_5_F4QuUwHTQZ2uim4KCkKI8RAQ2vEVoNE1txeuq2VNGshJgPKy0Q-_cwYOC0NdBBR7VuPDnKt3j0stgypKdSaQUNWR6R_U5-fYrwdYph1Pcy4YDuKPsRYONutxs_KP7OUW792iI0MLpjM0CTPoeO9P481xUv3s6SvjyppNl5Yxr34FDvB3FpluFJOuUHeZ6jCNlOa068qXbuftQaHDZJnmaFEfF3uf-6peyw8M5xzTZcqomlbP1ijaB9CbKaA7aX8-Q&dbm_d=AKAmf-CRqJNErRh82B0jIO5nnhYAdy4QuRlTpxT88I6A1RBriUOE0PfQTynxjRHBflUfSXthNzl97KMSxNcZZMYVacol7V5UZI748AQ06QZs0kzaLfsQHMq2nEv3JoSfM6CS1Npg-Gd_PpBlCQ__pPpp5Jf30aCH5oezo2zRJ9xdlQwgoLI4xTaNy2_8gtNvK_jpW1tchCVXWeoq8wxGFgi3N3F8QPTHZKxq_GgxwMfjk8Omlpl5RgIRFUjuj7vvG2WVfq5O0HkYv0b0WAr9pMMs4rj6bXWi0NdQ6mIpkz0e6zg3Ri76TfYcvZRhe8ZHrmmBIvuWNblZaCuWOf1mkElVNq6gunLzp_JTupB7ccskdebvzHW3msLdzQ-A80DOhbOZJYDH2g4cts_MZbDioOxFjV1za6zUCFbIgtUjhasMCKRWenq7Y6BRhTn7GzqfS6Zs2km9u6ewOrMarUmOrGsYBumAg1d-I31d78oFTshlI3Lf6MfKkphnh95-MpI1dvGaWoarqmE0tB9SEHeXfK5-mSlOcl7vCQ&dc_exteid=32511627256182217818456714259745470&dc_pubid=4&nm=3&nx=225&ny=131&mb=1&adurl=https://www.medica-tradefair.com/en/Hospital_Management?utm_source=dv360&utm_medium=cpm

// Create SVG files for all sizes needed by Xcode
const sizes = [16, 32, 48, 64, 96, 128, 256, 512, 1024];

sizes.forEach(size => {
  const svg = createSVG(size);
  const svgPath = path.join(__dirname, 'icons', `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created icon-${size}.svg`);
});

console.log('\nSVG icons created successfully!');
console.log('Note: Safari supports SVG icons, but if you need PNG, you can convert them using:');
console.log('  - Online tools like CloudConvert');
console.log('  - ImageMagick: convert icon-48.svg icon-48.png');
console.log('  - Or use macOS Preview app to export as PNG');

