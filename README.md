# Rebalanceo DCA

App para calcular cómo repartir tu aportación mensual (DCA) entre tus activos para mantener tus % objetivo.

## Cómo funciona

1. Configura tus activos y su % objetivo una sola vez (botón "Configurar"). Se guarda automáticamente en tu navegador (`localStorage`), no hay backend ni base de datos.
2. Cada mes solo introduces dos números: lo que vas a aportar y el valor total actual de tu cartera (el dato que sacas de tu broker).
3. La app te dice cuánto invertir en cada activo este mes, con un gráfico circular.

Los activos y porcentajes ya vienen precargados con tu configuración actual. Puedes editarlos en cualquier momento desde "Configurar".

## Desarrollo local

```bash
npm install
npm run dev
```

## Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Entra en [vercel.com](https://vercel.com) → **Add New Project** → importa el repositorio.
3. Vercel detecta automáticamente que es un proyecto Vite (Framework Preset: Vite). No hace falta tocar nada:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Despliega. Listo — tendrás una URL pública con la app.

Como la configuración se guarda en `localStorage` del navegador, cada dispositivo/navegador donde abras la app mantiene su propia copia. Si quieres que se sincronice entre dispositivos, habría que añadir una base de datos (por ejemplo Vercel KV o Supabase) — dímelo si en algún momento lo quieres.
