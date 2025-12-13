# 🥩 Control Carnes - Sistema Integral de Gestión (MERN Stack)

Aplicación web progresiva diseñada para optimizar el control de inventarios, flujo de caja y gestión de proveedores en negocios cárnicos. Desarrollada con una arquitectura **Cliente-Servidor** separada, utilizando MongoDB para la persistencia de datos y React para una interfaz de usuario reactiva.

## 🌟 Características Principales

* **📦 Inventario Inteligente:** Cálculo automático de stock neto en tiempo real con factores de merma configurables.
* **📊 Dashboard Financiero:** Visualización gráfica de ingresos diarios y resumen de cuentas por cobrar/pagar.
* **🤝 Gestión de Deudas:** Sistema de abonos parciales para compras y ventas.
* **📱 Diseño Mobile-First:** Interfaz optimizada para pantallas táctiles usando **Tailwind CSS**.
* **📉 Gestión de Mermas y Tara:** Cálculos automáticos de peso neto.
* **📄 Reportes Exportables:** Generación de archivos Excel (`.xlsx`).


## 🛠️ Stack Tecnológico

* **Frontend:** React.js 18, Tailwind CSS, Recharts, Capacitor.
* **Backend:** Node.js, Express.
* **Base de Datos:** MongoDB Atlas.
* **Seguridad:** Dotenv, CORS.


## 🚀 Guía de Instalación Local

Sigue estos pasos para levantar el proyecto en tu propia computadora conectándolo a tu propia base de datos.

### 1. Clonar el Repositorio

git clone [https://github.com/Dazuncion/Control-Carnes.git](https://github.com/Dazuncion/Control-Carnes.git)
cd Control-Carnes

2. Configurar el Backend (Servidor)

cd backend
npm install

Crea un archivo llamado .env dentro de la carpeta /backend y agrega tus credenciales:

Fragmento de código

PORT=5000
# Reemplaza con tu propia cadena de conexión de MongoDB Atlas o Local
MONGO_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@tu-cluster.mongodb.net/control-carnes

Inicia el servidor:

npm start

# Debería decir: "🚀 Server en http://localhost:5000" y "✅ Base de Datos MongoDB Conectada"


3. Configurar el Frontend (Cliente)
Abre una nueva terminal (manteniendo el backend corriendo) y navega a la carpeta del frontend:

cd Fronted

npm install

Configuración de la API: En lugar de modificar el código directamente, crea un archivo .env dentro de la carpeta /Fronted para definir a dónde se conectará la aplicación:

Fragmento de código

REACT_APP_API_URL=http://localhost:5000/api

(Nota: Si despliegas a producción, cambiarás esta variable por la URL de tu servidor en la nube).

Inicia la aplicación:

npm start

# La app se abrirá automáticamente en http://localhost:3000

🌍 Despliegue (Producción)
Si deseas subir este proyecto a la nube (ej. Render, Vercel, Railway), asegúrate de configurar las Variables de Entorno en el panel de control de tu proveedor de hosting:

Backend: Configura MONGO_URI con tu base de datos de producción.

Frontend: Configura REACT_APP_API_URL con la URL donde alojaste tu backend (ej: https://tu-api.onrender.com/api).

🤝 Contribuciones
Si deseas mejorar el cálculo de costos o agregar autenticación:

Haz un Fork.

Crea una rama (git checkout -b feature/Mejora).

Haz tus cambios y commit.

Abre un Pull Request.

Desarrollado con ❤️ por Dazuncion
