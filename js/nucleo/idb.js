// Envoltura mínima de IndexedDB para guardar cuentos cargados en el dispositivo
// (pueden pesar varios MB por las imágenes, demasiado para localStorage).

const NOMBRE = 'mgdc';
const VERSION = 1;
let conexion;

function abrir() {
  conexion ??= new Promise((ok, mal) => {
    const req = indexedDB.open(NOMBRE, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('cuentos')) db.createObjectStore('cuentos', { keyPath: 'id' });
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => mal(req.error);
  });
  return conexion;
}

async function tx(almacen, modo, accion) {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction(almacen, modo);
    const req = accion(t.objectStore(almacen));
    t.oncomplete = () => ok(req?.result);
    t.onerror = () => mal(t.error);
    t.onabort = () => mal(t.error);
  });
}

export const idb = {
  todos: (almacen) => tx(almacen, 'readonly', (s) => s.getAll()),
  uno: (almacen, id) => tx(almacen, 'readonly', (s) => s.get(id)),
  guardar: (almacen, valor) => tx(almacen, 'readwrite', (s) => s.put(valor)),
  borrar: (almacen, id) => tx(almacen, 'readwrite', (s) => s.delete(id)),
};
