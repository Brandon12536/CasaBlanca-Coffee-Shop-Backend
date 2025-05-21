const nodemailer = require('nodemailer');
const { generateOrderPdf } = require('./pdfService');

// Verificar variables de entorno
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Error: Las variables de entorno EMAIL_USER y EMAIL_PASSWORD son requeridas');
  process.exit(1);
}

console.log('Configurando transporte de correo con:', {
  service: 'gmail',
  user: process.env.EMAIL_USER ? 'Email configurado' : 'Falta EMAIL_USER',
  password: process.env.EMAIL_PASSWORD ? 'Contraseña configurada' : 'Falta EMAIL_PASSWORD'
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Mostrar logs detallados
  logger: true  // Mostrar logs en consola
});

// Verificar la configuración del transporte
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error al verificar la configuración del correo:', error);
  } else {
    console.log('El servidor está listo para enviar correos');
  }
});

const sendOrderConfirmation = async (order, userEmail, userName, shippingAddress) => {
  try {
    // Generate the PDF with order details and shipping address
    const pdfBuffer = await generateOrderPdf(order, userName, shippingAddress);

    // Email options
    const mailOptions = {
      from: `"CasaBlanca Coffee Shop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '☕️ ¡Gracias por tu compra en CasaBlanca Coffee Shop!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f5f0; padding: 20px; border-radius: 8px; border: 1px solid #e0d6cc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #5d4037; font-size: 28px; margin-bottom: 5px;">CasaBlanca Coffee Shop <span style="font-size: 24px;">☕️</span></h1>
            <div style="height: 2px; background: linear-gradient(90deg, #d7ccc8, #8d6e63, #d7ccc8); margin: 10px 0;"></div>
          </div>
          
          <div style="background-color: #fff; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #5d4037; margin-top: 0;">¡Hola ${userName}!</h2>
            <p style="color: #5d4037; line-height: 1.6;">Tu pedido <strong>#${order.id}</strong> ha sido procesado exitosamente. Estamos preparando tu pedido con mucho cariño.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f5f0eb; border-left: 4px solid #8d6e63; border-radius: 0 4px 4px 0;">
              <p style="margin: 0 0 10px 0; color: #5d4037; font-weight: 500; font-size: 16px;">Detalles de tu pedido:</p>
              ${(() => {
                let calculatedTotal = 0;
                const itemsHtml = order.items.map(item => {
                  const unitPrice = (item.price || 0) < 100 ? (item.price || 0) * 100 : (item.price || 0);
                  const quantity = item.quantity || 1;
                  const subtotal = unitPrice * quantity;
                  calculatedTotal += subtotal;
                  return `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #5d4037;">
                    <span>• ${quantity}x ${item.product_name || 'Producto'}</span>
                    <span>${(subtotal / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                  </div>`;
                }).join('');
                
                // Usar el total calculado si está disponible, de lo contrario usar el total de la orden
                const displayTotal = calculatedTotal > 0 ? calculatedTotal : (order.total || 0);
                
                return `${itemsHtml}
                <div style="border-top: 1px solid #d7ccc8; margin: 12px 0 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 600;">
                  <span>Total:</span>
                  <span>${(displayTotal / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                </div>`;
              })()}
            </div>
            
            <p style="color: #5d4037;">Hemos adjuntado el comprobante de tu compra en formato PDF.</p>
            
            
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #d7ccc8; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #8d6e63; font-weight: 500;">¿Tienes alguna pregunta?</p>
              <p style="margin: 0; color: #8d6e63;">Estamos aquí para ayudarte en <a href="mailto:contacto@casablancacoffee.com" style="color: #8d6e63; text-decoration: underline;">contacto@casablancacoffee.com</a></p>
              <p style="margin: 10px 0 0 0; color: #a1887f; font-size: 12px;">Horario de atención: Lunes a Sábado de 8:00 AM a 7:00 PM</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0d6cc;">
            <p style="margin: 5px 0; color: #8d6e63; font-size: 12px;">© ${new Date().getFullYear()} CasaBlanca Coffee Shop. Todos los derechos reservados.</p>
            <p style="margin: 5px 0; color: #a1887f; font-size: 12px;">Blvd. Puerta de Hierro 5153, Fracc. Plaza Andares, Zapopan, Jalisco</p>
            <div style="margin-top: 10px;">
              <a href="#" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" style="vertical-align: middle;"></a>
              <a href="#" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="24" style="vertical-align: middle;"></a>
              <a href="#" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="24" style="vertical-align: middle;"></a>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `orden-${order.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    console.log('Enviando correo con opciones:', {
      to: userEmail,
      subject: mailOptions.subject,
      attachments: mailOptions.attachments.map(a => a.filename)
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado:', info.messageId);
    console.log(`Correo de confirmación enviado a ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmation,
};
