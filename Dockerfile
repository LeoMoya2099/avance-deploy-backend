# Usa una imagen oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de Node.js
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código al contenedor
COPY . .

# Expone el puerto en el que corre el servidor (cambia si usas otro)
EXPOSE 5001

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
