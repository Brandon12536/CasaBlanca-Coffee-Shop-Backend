const { generatePdf } = require('html-pdf-node');
const { centsToPesos } = require('../utils/moneyUtils');

// Función para formatear fechas en español
const formatDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Mexico_City' 
  };
  
  // Formatear la fecha en español
  let formatted = date.toLocaleDateString('es-MX', options);
  
  // Asegurar que el mes empiece con mayúscula
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const generateOrderPdf = async (order, userName, shippingAddress) => {
  // Función para formatear precios (asegurando que se manejen como centavos)
  const formatPrice = (price) => {
    // Si el precio es menor a 100, asumir que está en pesos, no en centavos
    const amount = price < 100 ? price * 100 : price;
    return (amount / 100).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const itemsHtml = order.items.map(item => {
    const unitPrice = item.price || 0;
    const quantity = item.quantity || 1;
    const subtotal = unitPrice * quantity;
    
    return `
    <tr>
      <td>${item.product_name || item.product_id || 'Producto'}</td>
      <td class="text-right">${quantity}</td>
      <td class="text-right">${formatPrice(subtotal)}</td>
    </tr>`;
  }).join('');

  const total = order.items.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 1;
    return sum + (itemPrice * itemQuantity);
  }, 0);
  const formattedDate = formatDate(order.created_at);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo #${order.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap');
        
        @page {
          size: 3.15in auto; /* 80mm de ancho */
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body { 
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 10px;
          color: #333;
          width: 100%;
          max-width: 3.15in; /* 80mm */
          margin: 0;
          padding: 10px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #ddd;
        }
        
        .header h1 { 
          color: #000;
          font-size: 20px;
          font-weight: 700;
          margin: 5px 0;
          letter-spacing: 1px;
        }
        
        .header p {
          margin: 1px 0;
          color: #333;
          font-size: 10px;
          line-height: 1.2;
        }
        
        .delivery-address {
          margin: 8px 0;
          padding: 8px;
          background-color: #f8f8f8;
          border-radius: 4px;
          border-left: 3px solid #4a5568;
        }
        
        .delivery-address p {
          margin: 2px 0;
          font-size: 9px;
          line-height: 1.2;
        }
        
        .delivery-address p:first-child {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .info-section {
          margin: 12px 0;
          padding: 10px 0;
          border-bottom: 1px dashed #ddd;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .info-label {
          font-weight: 500;
          color: #555;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0;
          font-size: 11px;
        }
        
        th { 
          text-align: left; 
          padding: 5px 0;
          font-weight: 500;
          border-bottom: 1px dashed #ddd;
        }
        
        td {
          padding: 5px 0;
          border-bottom: 1px dashed #eee;
        }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .total-row {
          margin-top: 10px;
          padding-top: 5px;
          border-top: 2px dashed #000;
          font-weight: bold;
          font-size: 14px;
        }
        
        .footer { 
          margin-top: 20px; 
          font-size: 10px; 
          color: #888;
          text-align: center;
          padding-top: 10px;
          border-top: 1px dashed #ddd;
        }
        
        .coffee-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="coffee-icon">☕️</div>
        <h1>CasaBlanca Coffee Shop</h1>
        <p>Blvd. Puerta de Hierro 5153</p>
        <p>Fracc. Plaza Andares</p>
        <p>Zapopan, Jalisco 45116</p>
        <p>Piso 2</p>
      </div>
      
      <div class="delivery-address">
        <p><strong>ENTREGA A DOMICILIO</strong></p>
        <p>${shippingAddress.line1 || 'Dirección no especificada'}</p>
        ${shippingAddress.line2 ? `<p>${shippingAddress.line2}</p>` : ''}
        <p>${shippingAddress.city || ''} ${shippingAddress.state ? `, ${shippingAddress.state}` : ''} ${shippingAddress.postal_code || ''}</p>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">FOLIO:</span>
          <span>${order.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">FECHA:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CLIENTE:</span>
          <span>${userName || 'Cliente'}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>PRODUCTO</th>
            <th class="text-right">CANT</th>
            <th class="text-right">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="info-row total-row">
        <span>TOTAL</span>
        <span>${formatPrice(total)}</span>
      </div>
      
      <div class="footer">
        <p>¡Gracias por tu compra!</p>
        <p>Este es tu comprobante de pago</p>
        <p>Para cualquier aclaración, contáctanos en:</p>
        <p>coffeeshop@coffeshop.com</p>
      </div>
    </body>
    </html>
  `;

  try {
    const pdfBuffer = await new Promise((resolve, reject) => {
      generatePdf(
        { content: html },
        { 
          // 80mm x 297mm (A4 de alto) - en pulgadas (1 pulgada = 25.4mm)
          width: '3.15in',
          height: '11.69in',
          printBackground: true,
          margin: {
            top: '0.2in',
            right: '0.2in',
            bottom: '0.2in',
            left: '0.2in'
          },
          preferCSSPageSize: false
        },
        (error, buffer) => {
          if (error) reject(error);
          else resolve(buffer);
        }
      );
    });

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = {
  generateOrderPdf,
};
