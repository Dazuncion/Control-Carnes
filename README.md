# 🥩 Control Carnes - Sistema Integral de Gestión (MERN Stack)

Aplicación web progresiva diseñada para optimizar el control de inventarios, flujo de caja y gestión de proveedores en negocios cárnicos. Desarrollada con una arquitectura **Cliente-Servidor** separada, utilizando MongoDB para la persistencia de datos y React para una interfaz de usuario reactiva y adaptable a móviles.

## 🌟 Características Principales

* **📦 Inventario Inteligente:** Cálculo automático de stock neto en tiempo real. El sistema descuenta el inventario basándose en factores de merma configurables (ej: Pollo: 0.85, Res: 1.0) al registrar una venta.
* **📊 Dashboard Financiero:** Visualización gráfica de ingresos diarios usando `recharts` y tarjetas de resumen para "Cuentas por Cobrar" y "Cuentas por Pagar".
* **🤝 Gestión de Deudas:** Sistema completo de abonos. Permite registrar pagos parciales tanto a proveedores (compras) como de clientes (ventas), actualizando los saldos automáticamente.
* **📱 Diseño Mobile-First:** Interfaz construida con **Tailwind CSS**, optimizada para pantallas táctiles, botones grandes para operarios y navegación fluida tipo App nativa.
* **📉 Gestión de Mermas y Tara:** Cálculos automáticos de peso neto restando tara de gavetas y aplicando porcentajes de pérdida por limpieza del producto.
* **📄 Reportes Exportables:** Generación de archivos Excel (`.xlsx`) desde el cliente para contabilidad externa.

---

## 🛠️ Stack Tecnológico

### Frontend (`/Fronted`)
El cliente visual donde interactúa el usuario:
* **Core:** React.js 18 (Hooks: `useState`, `useEffect`, `useMemo`).
* **Estilos:** Tailwind CSS (Diseño utilitario y responsivo).
* **Gráficos:** Recharts (Visualización de datos).
* **Iconos:** Lucide React.
* **Móvil:** Capacitor (Core, Filesystem, Share) para funcionalidades nativas.
* **Utilidades:** XLSX (Exportación de hojas de cálculo).

### Backend (`/backend`)
La API que procesa los datos y conecta con la nube:
* **Servidor:** Node.js + Express.
* **Base de Datos:** MongoDB Atlas (NoSQL).
* **Modelado:** Mongoose (Schemas estrictos para Ventas y Compras).
* **Seguridad/Config:** Dotenv, CORS.

---

## 📂 Estructura del Proyecto

El proyecto está organizado como un repositorio unificado (Monorepo):


Control-Carnes/
│
├── /backend                 # 🧠 Lógica del Servidor (API)
│   ├── /models              # Esquemas de Base de Datos
│   │   ├── Compra.js        # Modelo de Compras (Proveedores, Tara, Pesos)
│   │   └── Venta.js         # Modelo de Ventas (Clientes, Mermas, Pagos)
│   ├── /routes              # Rutas de la API (Endpoints)
│   │   ├── compras.js       # GET, POST, PUT, DELETE Compras
│   │   └── ventas.js        # GET, POST, PUT, DELETE Ventas
│   ├── .env                 # (NO INCLUIDO) Variables de entorno y llaves
│   └── server.js            # Punto de entrada y configuración del servidor
│
└── /Fronted                 # 🎨 Interfaz de Usuario (React)
    ├── /public              # Archivos estáticos (Manifest, Iconos)
    ├── /src                 # Código fuente
    │   ├── /components      # Componentes Reutilizables
    │   │   ├── Modales.js   # Modales de Pago, Devolución y Confirmación
    │   │   └── Navbar.js    # Barra de navegación inferior móvil
    │   ├── /data            # Configuración estática
    │   │   └── config.js    # Constantes de mermas y tipos de carne
    │   ├── /pages           # Vistas Principales
    │   │   ├── Compras.js   # Formulario y lista de compras
    │   │   ├── Dashboard.js # Gráficos y resumen financiero
    │   │   ├── Reportes.js  # Exportación a Excel y Rankings
    │   │   └── Ventas.js    # Formulario de venta y listado diario
    │   ├── /styles          # Estilos CSS personalizados
    │   └── App.js           # Orquestador principal y conexión a API
    └── package.json         # Dependencias del cliente


🚀 Guía de Instalación Local
Sigue estos pasos para levantar el proyecto en tu computadora:

1. Clonar el Repositorio
git clone [https://github.com/Dazuncion/Control-Carnes.git](https://github.com/Dazuncion/Control-Carnes.git)
cd Control-Carnes

2. Configurar el Backend (Servidor)
cd backend
npm install

Crea un archivo .env dentro de la carpeta backend con lo siguiente 
Fragmento de código

PORT=5000
MONGO_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster0.mizck0l.mongodb.net/control-carnes

Inicia el servidor:
npm start
# Debería decir: "🚀 Servidor corriendo en http://localhost:5000"

3. Configurar el Frontend (Cliente)
Abre una nueva terminal (sin cerrar la del backend):
cd Fronted
npm install
Nota: Para trabajar en modo local, asegúrate de que en src/App.js, la variable API_URL apunte a tu servidor local:

JavaScript
const API_URL = 'http://localhost:5000/api';

Inicia la aplicación:
npm start
# La app se abrirá en http://localhost:3000

🌍 Despliegue (Producción)
Este proyecto está listo para ser desplegado en la nube:
Base de Datos: MongoDB Atlas.
Backend API: Render.com (Web Service).
Comando de inicio: node server.js
Variables de entorno: MONGO_URI (Configurar en el panel de Render)
Frontend: Vercel, Netlify o Render (Static Site).

Recuerda actualizar la API_URL en el frontend (src/App.js) con el link de producción de Render:

JavaScript
const API_URL = '[https://api-control-carnes.onrender.com/api](https://api-control-carnes.onrender.com/api)';

🔐 Seguridad
Las credenciales de la base de datos están protegidas mediante variables de entorno.
El acceso a la API está habilitado mediante CORS para permitir peticiones desde el cliente.

🤝 Contribuciones
Si deseas mejorar el cálculo de costos o agregar autenticación:

Haz un Fork.
Crea una rama (git checkout -b feature/Mejora).
Haz tus cambios y commit.
Abre un Pull Request.

Desarrollado con ❤️ por Dazuncion
