require('dotenv').config();
const twilio = require('twilio');
const path = require('path');

// Mostrar información del archivo .env
console.log('Ruta del archivo .env:', path.resolve(process.cwd(), '.env'));
console.log('Variables de entorno cargadas:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Presente' : 'No presente');

// Verificar si las credenciales están presentes
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error('Error: Las credenciales de Twilio no están configuradas correctamente');
    process.exit(1);
}

// Crear cliente de Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Función de prueba
async function testTwilio() {
    try {
        // Intentar obtener información de la cuenta
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log('Conexión exitosa con Twilio');
        console.log('Nombre de la cuenta:', account.friendlyName);
        
        // Intentar enviar un mensaje de prueba
        const message = await client.messages.create({
            to: 'whatsapp:+593964194669',
            from: 'whatsapp:+14155238886',
            body: 'Mensaje de prueba'
        });
        
        console.log('Mensaje enviado exitosamente');
        console.log('Message SID:', message.sid);
    } catch (error) {
        console.error('Error detallado:', {
            message: error.message,
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo
        });
    }
}

// Ejecutar prueba
testTwilio(); 